import pool from "../config/db.js";

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
