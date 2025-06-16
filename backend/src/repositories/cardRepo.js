import pool from "../config/db.js";

export const createCard = async ({
  column_id,
  title,
  description = null,
  priority = null,
  due_date = null,
  position = null,
}) => {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    let pos = position;
    if (pos === null || pos === undefined) {
      const {
        rows: [{ next }],
      } = await client.query(
        "SELECT COALESCE(MAX(position), -1) + 1 AS next FROM cards WHERE column_id = $1",
        [column_id]
      );
      pos = next;
    }

    const {
      rows: [card],
    } = await client.query(
      `WITH ins AS (
         INSERT INTO cards
           (column_id, title, description, position, priority, due_date)
         VALUES ($1, $2, $3, $4, $5, $6)
         RETURNING *
       )
       SELECT ins.*, bc.board_id
         FROM ins
         JOIN board_columns bc ON bc.column_id = ins.column_id;`,
      [column_id, title, description, pos, priority, due_date]
    );

    await client.query("COMMIT");
    return card;
  } catch (err) {
    await client.query("ROLLBACK");
    throw err;
  } finally {
    client.release();
  }
};

export const listCardsByColumn = async (column_id) => {
  const { rows } = await pool.query(
    `SELECT * FROM cards
      WHERE column_id = $1
      ORDER BY position`,
    [column_id]
  );
  return rows;
};

export const moveCard = async ({
  card_id,
  new_column_id,
  new_position = null,
}) => {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    /* 1. Берём текущие данные карточки под FOR UPDATE, чтобы заблокировать строку */
    const {
      rows: [card],
    } = await client.query(
      "SELECT column_id, position FROM cards WHERE card_id = $1 FOR UPDATE",
      [card_id]
    );
    if (!card) throw new Error("Card not found");
    const old_column_id = card.column_id;
    const old_position = card.position;

    /* 2. Корректируем целевую позицию (если null → в конец) */
    const {
      rows: [{ max }],
    } = await client.query(
      "SELECT COALESCE(MAX(position), -1) AS max FROM cards WHERE column_id = $1",
      [new_column_id]
    );
    const targetPosition =
      new_position == null || new_position > max + 1
        ? max + 1
        : Math.max(0, new_position);

    /* 3. Если колонка *не* меняется, переставляем в пределах одной колонки */
    if (old_column_id === new_column_id) {
      if (targetPosition !== old_position) {
        if (targetPosition > old_position) {
          await client.query(
            `UPDATE cards
               SET position = position - 1
             WHERE column_id = $1
               AND position > $2 AND position <= $3`,
            [old_column_id, old_position, targetPosition]
          );
        } else {
          await client.query(
            `UPDATE cards
               SET position = position + 1
             WHERE column_id = $1
               AND position >= $2 AND position < $3`,
            [old_column_id, targetPosition, old_position]
          );
        }
      }
    } else {
      /* 4. Перемещение в другую колонку */
      // 4a. «Сжимаем» исходную колонку
      await client.query(
        `UPDATE cards
           SET position = position - 1
         WHERE column_id = $1 AND position > $2`,
        [old_column_id, old_position]
      );
      // 4b. «Раздвигаем» целевую колонку
      await client.query(
        `UPDATE cards
           SET position = position + 1
         WHERE column_id = $1 AND position >= $2`,
        [new_column_id, targetPosition]
      );
    }

    /* 5. Обновляем карточку и сразу возвращаем board_id через JOIN на board_columns */
    const {
      rows: [updated],
    } = await client.query(
      `
      UPDATE cards
         SET column_id = $2,
             position  = $3
        FROM board_columns AS bc
       WHERE cards.card_id   = $1
         AND bc.column_id     = $2
       RETURNING
         cards.card_id,
         cards.column_id,
         cards.position,
         bc.board_id AS board_id
      `,
      [card_id, new_column_id, targetPosition]
    );

    await client.query("COMMIT");
    return updated;
  } catch (err) {
    await client.query("ROLLBACK");
    throw err;
  } finally {
    client.release();
  }
};

/**
 * UPDATE карточки по полям, которые передали в dto.
 */
export const updateCard = async ({ card_id, user_id, ...fields }) => {
  const setters = [];
  const vals = [];
  let idx = 1;

  for (const [key, value] of Object.entries(fields)) {
    if (value === undefined) continue;
    setters.push(`${key} = $${idx++}`);
    vals.push(value);
  }
  if (!setters.length) {
    throw new Error("No fields to update");
  }

  const query = `
    WITH c AS (
      SELECT card_id, column_id
      FROM cards
      WHERE card_id = $${idx}
    ), b AS (
      SELECT b.board_id
      FROM board_columns col
      JOIN boards b ON b.board_id = col.board_id
      JOIN c ON c.column_id = col.column_id
      WHERE b.owner_id = $${idx + 1}
    )
    UPDATE cards
      SET ${setters.join(", ")}
    FROM c, b
    WHERE cards.card_id = c.card_id
    RETURNING cards.*;
  `;
  vals.push(card_id, user_id);

  const { rows } = await pool.query(query, vals);
  return rows[0] || null;
};

/**
 * Мягкое удаление без проверки прав.
 * Возвращает { success, board_id }.
 */
export const deleteCard = async ({ card_id }) => {
  const res = await pool.query(`DELETE FROM cards WHERE card_id = $1;`, [
    card_id,
  ]);
  console.log("deleted:", res.rowCount);
  return { success: res.rowCount > 0 };
};
