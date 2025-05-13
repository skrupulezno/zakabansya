import express from "express";
import { auth } from "../middleware/auth.js";
import * as service from "../services/columnService.js";

const router = express.Router();

router.post("/", auth, async (req, res) => {
  try {
    const col = await service.addColumn(req.body);
    req.app
      .get("io")
      .to(`board-${col.board_id}`)
      .emit("column:add", { column: col });
    res.status(201).json(col);
  } catch (e) {
    res.status(400).json({ error: e.message });
  }
});

router.get("/:boardId", auth, async (req, res) => {
  const columns = await service.getColumns(req.params.boardId);
  res.json(columns);
});

router.get("/:columnId/cards", auth, async (req, res) => {
  try {
    const cards = await cardService.getCardsByColumn(req.params.columnId);
    if (!cards) return res.status(404).json({ error: "Column not found" });
    res.json(cards);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

export default router;
