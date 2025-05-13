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
