import express from "express";
import * as service from "../services/userService.js";
const router = express.Router();

router.post("/register", async (req, res) => {
  try {
    const token = await service.register(req.body);
    res.status(201).json({ token });
  } catch (e) {
    res.status(400).json({ error: e.message });
  }
});

router.post("/login", async (req, res) => {
  try {
    const token = await service.login(req.body);
    res.json({ token });
  } catch (e) {
    res.status(400).json({ error: e.message });
  }
});

export default router;
