// routes/board-members.js
import express from "express";
import { auth } from "../middleware/auth.js";
import * as members from "../services/boardMembersService.js";

const router = express.Router();

// POST /boards/:boardId/members  { user_ids: [2, 5, 7] }
router.post("/:boardId/members", auth, async (req, res) => {
  try {
    const boardId = +req.params.boardId;
    const { user_ids } = req.body; // массив id

    //–– проверка, что текущий пользователь-владелец доски
    const isOwner = await members.checkOwner(boardId, req.user.user_id);
    if (!isOwner) return res.status(403).json({ error: "No access" });

    await members.addMany(boardId, user_ids);
    res.status(204).end(); // успех без тела
  } catch (e) {
    res.status(400).json({ error: e.message });
  }
});

router.delete("/:boardId/members/:userId", auth, async (req, res) => {
  try {
    const boardId = +req.params.boardId;
    const userId = +req.params.userId;

    const isOwner = await members.checkOwner(boardId, req.user.user_id);
    if (!isOwner) return res.status(403).json({ error: "No access" });

    await members.remove(boardId, userId);
    res.status(204).end();
  } catch (e) {
    res.status(400).json({ error: e.message });
  }
});

export default router;
