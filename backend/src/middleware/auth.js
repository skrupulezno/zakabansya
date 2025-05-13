import jwt from "jsonwebtoken";
import dotenv from "dotenv";
dotenv.config();

export const auth = (req, res, next) => {
  const header = req.headers.authorization;
  if (!header) return res.status(401).json({ message: "Missing token" });
  try {
    const token = header.split(" ")[1];
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    req.user = payload;
    next();
  } catch (e) {
    res.status(403).json({ message: "Invalid token" });
  }
};
