import pool from "../config/db.js";

export const findByEmail = async (email) => {
  const { rows } = await pool.query(
    `SELECT user_id, name, email, avatar_url, password_hash
     FROM users WHERE email = $1`,
    [email]
  );
  return rows[0];
};

export const create = async ({ name, email, passwordHash }) => {
  const { rows } = await pool.query(
    `INSERT INTO users (name, email, password_hash)
     VALUES ($1,$2,$3) RETURNING user_id, name, email, avatar_url`,
    [name, email, passwordHash]
  );
  return rows[0];
};

export const findById = async (user_id) => {
  const { rows } = await pool.query(
    `SELECT user_id, name, email, avatar_url, created_at
       FROM users
      WHERE user_id = $1`,
    [user_id]
  );
  return rows[0];
};

/**
 * Получить пользователя по ID (без пароля!).
 */
export const getUserById = async (user_id) => {
  const { rows } = await pool.query(
    `SELECT user_id, name, email, avatar_url, created_at
       FROM users
      WHERE user_id = $1`,
    [user_id]
  );
  return rows[0] || null;
};

/**
 * Список всех пользователей (для упоминаний, шаринга и т.п.).
 */
export const getAllUsers = async () => {
  const { rows } = await pool.query(
    `SELECT user_id, name, email, avatar_url, created_at
       FROM users
      ORDER BY name`
  );
  return rows;
};
