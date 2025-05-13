import express from "express";
import { auth } from "../middleware/auth.js";
import * as userService from "../services/userService.js";

const router = express.Router();

/**
 * GET /api/users/me
 * Возвращает информацию о текущем пользователе (по JWT).
 */
router.get("/me", auth, async (req, res) => {
  try {
    const user = await userService.getMe(req.user.user_id);
    res.json(user);
  } catch (e) {
    res.status(404).json({ error: e.message });
  }
});

export default router;
