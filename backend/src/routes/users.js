import express from "express";
import { auth } from "../middleware/auth.js";
import * as userService from "../services/userService.js";

const router = express.Router();

router.get("/me", auth, async (req, res) => {
  try {
    const user = await userService.getById(req.user.user_id);
    res.json(user);
  } catch (e) {
    res.status(404).json({ error: e.message });
  }
});

router.get("/:id", auth, async (req, res) => {
  try {
    const user = await userService.getById(Number(req.params.id));
    if (!user) return res.status(404).json({ error: "User not found" });
    res.json(user);
  } catch (e) {
    res.status(400).json({ error: e.message });
  }
});

router.get("/", auth, async (_req, res) => {
  try {
    const users = await userService.getAll();
    res.json(users);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

export default router;
