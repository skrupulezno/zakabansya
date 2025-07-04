import pool from "../config/db.js";

export const getBoardsForUser = async (user_id) => {
  const { rows } = await pool.query(
    `SELECT b.*,
            (SELECT role FROM board_members bm WHERE bm.board_id = b.board_id AND bm.user_id = $1) AS role
     FROM boards b
     WHERE b.owner_id = $1
        OR EXISTS (SELECT 1 FROM board_members bm WHERE bm.board_id = b.board_id AND bm.user_id = $1)`,
    [user_id]
  );
  return rows;
};

export const getFullBoard = async (board_id, user_id) => {
  // 1) проверяем доступ (владелец или участник)
  const access = await pool.query(
    `SELECT 1
       FROM boards b
       LEFT JOIN board_members bm ON bm.board_id = b.board_id AND bm.user_id = $2
      WHERE b.board_id = $1 AND (b.owner_id = $2 OR bm.user_id IS NOT NULL)`,
    [board_id, user_id]
  );
  if (!access.rowCount) return null;

  // 2) сама доска
  const {
    rows: [board],
  } = await pool.query("SELECT * FROM boards WHERE board_id = $1", [board_id]);

  // 3) колонки + вложенные карточки
  const { rows: columns } = await pool.query(
    `
    SELECT col.*,
           COALESCE(
             json_agg(
               json_build_object(
                 'card_id',   c.card_id,
                 'title',     c.title,
                 'description',c.description,
                 'position',  c.position,
                 'due_date',  c.due_date,
                 'priority',  c.priority
               )
               ORDER BY c.position
             ) FILTER (WHERE c.card_id IS NOT NULL),
             '[]'
           ) AS cards
      FROM board_columns col
LEFT JOIN cards c ON c.column_id = col.column_id
     WHERE col.board_id = $1
  GROUP BY col.column_id
  ORDER BY col.position;
  `,
    [board_id]
  );

  // 4) участники
  const { rows: members } = await pool.query(
    `
    SELECT u.user_id, u.name, u.avatar_url, 'owner' as role
      FROM boards b
      JOIN users u ON u.user_id = b.owner_id
     WHERE b.board_id = $1
    UNION
    SELECT u.user_id, u.name, u.avatar_url, bm.role
      FROM board_members bm
      JOIN users u ON u.user_id = bm.user_id
     WHERE bm.board_id = $1
  `,
    [board_id]
  );

  return { board, columns, members };
};

export const createBoard = async ({
  title,
  description,
  owner_id,
  visibility,
}) => {
  const { rows } = await pool.query(
    `INSERT INTO boards (title, description, owner_id, visibility)
     VALUES ($1,$2,$3,$4) RETURNING *`,
    [title, description, owner_id, visibility]
  );
  return rows[0];
};

export const updateBoard = async ({
  board_id,
  owner_id,
  title,
  description,
  visibility,
}) => {
  const fields = [];
  const vals = [];
  let idx = 1;

  if (title !== undefined) {
    fields.push(`title = $${idx++}`);
    vals.push(title);
  }
  if (description !== undefined) {
    fields.push(`description = $${idx++}`);
    vals.push(description);
  }
  if (visibility !== undefined) {
    fields.push(`visibility = $${idx++}`);
    vals.push(visibility);
  }
  if (fields.length === 0) {
    throw new Error("No fields to update");
  }

  vals.push(board_id, owner_id);

  const query = `
    UPDATE boards
       SET ${fields.join(", ")}
     WHERE board_id = $${idx++} AND owner_id = $${idx}
  RETURNING *;
  `;
  const { rows } = await pool.query(query, vals);
  return rows[0] || null;
};

export const deleteBoard = async (board_id, owner_id) => {
  const { rowCount } = await pool.query(
    `UPDATE boards
        SET archived_at = NOW()
      WHERE board_id = $1 AND owner_id = $2;`,
    [board_id, owner_id]
  );
  return rowCount > 0;
};
