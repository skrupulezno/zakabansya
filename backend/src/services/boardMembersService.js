import pool from "../config/db.js";

export const checkOwner = async (boardId, userId) => {
  const { rows } = await pool.query(
    `SELECT 1 FROM boards WHERE board_id=$1 AND owner_id=$2`,
    [boardId, userId]
  );
  return rows.length > 0;
};

export const addMany = async (boardId, userIds) => {
  const values = userIds.map((id) => `(${boardId}, ${id}, 'member')`).join(",");
  if (!values) return;
  await pool.query(
    `INSERT INTO board_members (board_id, user_id, role)
     VALUES ${values}
     ON CONFLICT DO NOTHING`
  );
};

export const remove = async (boardId, userId) => {
  await pool.query(
    `DELETE FROM board_members WHERE board_id = $1 AND user_id = $2`,
    [boardId, userId],
  );
};
