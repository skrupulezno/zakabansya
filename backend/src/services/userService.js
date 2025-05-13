import * as repo from "../repositories/userRepo.js";
import * as pw from "../utils/passwords.js";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";

dotenv.config();

export const register = async ({ name, email, password }) => {
  const exists = await repo.findByEmail(email);
  if (exists) throw new Error("Email already in use");
  const passwordHash = await pw.hash(password);
  const user = await repo.create({ name, email, passwordHash });
  return issueToken(user);
};

export const login = async ({ email, password }) => {
  const user = await repo.findByEmail(email);
  if (!user) throw new Error("Bad credentials");
  const ok = await pw.compare(password, user.password_hash);
  if (!ok) throw new Error("Bad credentials");
  return issueToken(user);
};

const issueToken = (user) =>
  jwt.sign(
    {
      user_id: user.user_id,
      email: user.email,
      name: user.name,
    },
    process.env.JWT_SECRET,
    { expiresIn: "1d" }
  );

export const getMe = async (user_id) => {
  const user = await userRepo.findById(user_id);
  if (!user) throw new Error("User not found");
  return user;
};
