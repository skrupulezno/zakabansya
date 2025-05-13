import pool from "../config/db.js";

export const createColumn = async ({ board_id, name, position }) => {
  const { rows } = await pool.query(
    `INSERT INTO board_columns (board_id, name, position) VALUES ($1,$2,$3) RETURNING *`,
    [board_id, name, position]
  );
  return rows[0];
};

export const listColumns = async (board_id) => {
  const { rows } = await pool.query(
    `SELECT * FROM board_columns WHERE board_id = $1 ORDER BY position`,
    [board_id]
  );
  return rows;
};

/* ---------- ОБНОВЛЕНИЕ КОЛОНКИ ---------- */
/**
 * @param {Object} dto
 * @param {number} dto.column_id          – обязательный
 * @param {string=} dto.name              – новое имя (опц.)
 * @param {number=} dto.position          – новая позиция (0‑based, опц.)
 * @returns {Promise<Object>} обновлённая колонка
 */
export const updateColumn = async ({ column_id, name, position }) => {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    /* 1. Блокируем колонку, получаем её board_id и старую позицию */
    const {
      rows: [col],
    } = await client.query(
      `SELECT board_id, position
         FROM board_columns
        WHERE column_id = $1
        FOR UPDATE`, // ! блокируем на время транзакции
      [column_id]
    );
    if (!col) throw new Error("Column not found");
    const board_id = col.board_id;
    const oldPosition = col.position;

    /* 2. Определяем targetPosition */
    let targetPosition = position;
    if (targetPosition === undefined || targetPosition === null) {
      // если не передали – остаётся как было
      targetPosition = oldPosition;
    }

    /* 2a. Корректируем: не меньше 0, не больше max+1 */
    const {
      rows: [{ max }],
    } = await client.query(
      `SELECT COALESCE(MAX(position), -1) AS max
         FROM board_columns
        WHERE board_id = $1`,
      [board_id]
    );
    targetPosition =
      targetPosition > max + 1 ? max + 1 : Math.max(0, targetPosition);

    /* 3. Если позиция меняется – «сжимаем» и «раздвигаем» */
    if (targetPosition !== oldPosition) {
      if (targetPosition > oldPosition) {
        // тянем вправо
        await client.query(
          `UPDATE board_columns
              SET position = position - 1
            WHERE board_id = $1
              AND position > $2 AND position <= $3`,
          [board_id, oldPosition, targetPosition]
        );
      } else {
        // тянем влево
        await client.query(
          `UPDATE board_columns
              SET position = position + 1
            WHERE board_id = $1
              AND position >= $2 AND position < $3`,
          [board_id, targetPosition, oldPosition]
        );
      }
    }

    /* 4. Апдейт самой колонки */
    const setters = [];
    const vals = [];
    let idx = 1;

    if (name !== undefined) {
      setters.push(`name     = $${++idx}`);
      vals.push(name);
    }
    if (targetPosition !== oldPosition) {
      setters.push(`position  = $${++idx}`);
      vals.push(targetPosition);
    }
    if (!setters.length) {
      // ничего не меняли
      await client.query("COMMIT");
      return { column_id, board_id, name, position: oldPosition };
    }

    const {
      rows: [updated],
    } = await client.query(
      `UPDATE board_columns
          SET ${setters.join(", ")}
        WHERE column_id = $1
      RETURNING *`,
      [column_id, ...vals]
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
 * Транзакционно удаляет колонку и «сжимает» позиции остальных.
 * @returns {Promise<{ column_id:number, board_id:number }>}
 */
export const deleteColumn = async ({ column_id }) => {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    // 1. Берём данные колонки под FOR UPDATE
    const {
      rows: [col],
    } = await client.query(
      `SELECT board_id, position
         FROM board_columns
        WHERE column_id = $1
        FOR UPDATE`,
      [column_id]
    );
    if (!col) throw new Error("Column not found");

    const { board_id, position: oldPos } = col;

    // 2. Удаляем колонку (жёстко; замените на soft‑delete при необходимости)
    await client.query(
      `DELETE FROM board_columns
        WHERE column_id = $1`,
      [column_id]
    );

    // 3. Сдвигаем позиции оставшихся столбцов
    await client.query(
      `UPDATE board_columns
          SET position = position - 1
        WHERE board_id = $1
          AND position  > $2`,
      [board_id, oldPos]
    );

    await client.query("COMMIT");
    return { column_id, board_id };
  } catch (err) {
    await client.query("ROLLBACK");
    throw err;
  } finally {
    client.release();
  }
};

/**
 * Массовая перестановка столбцов.
 * @param {Array<{ column_id:number, position:number }>} list
 * @returns {Promise<Array>} обновлённые строки
 */
export const reorderColumns = async (list) => {
  if (!Array.isArray(list) || !list.length)
    throw new Error("Empty reorder payload");

  // Проверка на дубликаты/некорректные позиции по‑желанию
  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    /* 1. Определяем board_id первой колонки и проверяем,
          что все остальные принадлежат той же доске */
    const ids = list.map((r) => r.column_id);
    const { rows: boards } = await client.query(
      `SELECT DISTINCT board_id FROM board_columns WHERE column_id = ANY($1)`,
      [ids]
    );
    if (boards.length !== 1)
      throw new Error("Columns belong to different boards");

    const board_id = boards[0].board_id;

    /* 2. Массовый UPDATE через VALUES … FOR UPDATE … */
    // формируем (VALUES (id,pos),…)
    const valuesSql = list
      .map(
        (r, i) => `($${i * 2 + 1}::int, $${i * 2 + 2}::int)` // (id,position)
      )
      .join(", ");

    const params = list.flatMap((r) => [r.column_id, r.position]);

    // блокируем строки, затем обновляем
    const updateSql = `
      WITH new_pos (column_id, position) AS (VALUES ${valuesSql})
      UPDATE board_columns AS bc
         SET position = np.position
        FROM new_pos AS np
       WHERE bc.column_id = np.column_id
       RETURNING bc.*;
    `;

    const { rows: updated } = await client.query(updateSql, params);

    await client.query("COMMIT");
    return updated.sort((a, b) => a.position - b.position);
  } catch (err) {
    await client.query("ROLLBACK");
    throw err;
  } finally {
    client.release();
  }
};
