import pool from "../config/db.js";

export const createCard = async ({
  column_id,
  title,
  position,
  description,
  priority,
  due_date,
}) => {
  const { rows } = await pool.query(
    `INSERT INTO cards (column_id, title, position, description, priority, due_date)
     VALUES ($1,$2,$3,$4,$5,$6) RETURNING *`,
    [column_id, title, position, description, priority, due_date]
  );
  return rows[0];
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

    /* 3. Если колонка *не* меняется, просто переставляем в пределах одной колонки */
    if (old_column_id === new_column_id) {
      if (targetPosition !== old_position) {
        if (targetPosition > old_position) {
          // сдвигаем всё между old+1 … target вниз на 1
          await client.query(
            `UPDATE cards
               SET position = position - 1
             WHERE column_id = $1
               AND position > $2 AND position <= $3`,
            [old_column_id, old_position, targetPosition]
          );
        } else {
          // сдвигаем всё между target … old-1 вверх на 1
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

      // 4b. «Раздвигаем» целевую колонну
      await client.query(
        `UPDATE cards
           SET position = position + 1
         WHERE column_id = $1 AND position >= $2`,
        [new_column_id, targetPosition]
      );
    }

    /* 5. Сама карточка */
    const {
      rows: [updated],
    } = await client.query(
      `UPDATE cards
         SET column_id = $2,
             position  = $3
       WHERE card_id   = $1
       RETURNING *`,
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
