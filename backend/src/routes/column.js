import express from "express";
import { auth } from "../middleware/auth.js";
import * as service from "../services/columnService.js";

const router = express.Router();

router.post("/", auth, async (req, res) => {
  try {
    const col = await service.addColumn(req.body);
    req.app.get("io").emit("columnCreated", col);
    res.status(201).json(col);
  } catch (e) {
    res.status(400).json({ error: e.message });
  }
});

router.get("/:boardId", auth, async (req, res) => {
  const columns = await service.getColumns(req.params.boardId);
  res.json(columns);
});

export default router;
