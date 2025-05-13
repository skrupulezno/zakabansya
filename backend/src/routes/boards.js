import express from "express";
import { auth } from "../middleware/auth.js";
import * as service from "../services/boardService.js";

const router = express.Router();

router.post("/", auth, async (req, res) => {
  try {
    const board = await service.createBoard({
      ...req.body,
      owner_id: req.user.user_id,
    });
    res.status(201).json(board);
  } catch (e) {
    res.status(400).json({ error: e.message });
  }
});

router.get("/", auth, async (req, res) => {
  const boards = await service.listBoards(req.user.user_id);
  res.json(boards);
});

router.get("/:boardId/full", auth, async (req, res) => {
  try {
    const data = await service.getFullBoard(
      req.params.boardId,
      req.user.user_id
    );
    if (!data)
      return res.status(404).json({ error: "Board not found or no access" });
    res.json(data);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

export default router;
