import express from "express";
import { auth } from "../middleware/auth.js";
import * as service from "../services/cardService.js";

const router = express.Router();

router.post("/", auth, async (req, res) => {
  try {
    const card = await service.addCard(req.body);
    req.app
      .get("io")
      .to(`board-${card.board_id}`)
      .emit("card:add", { column_id: card.column_id, card });
    res.status(201).json(card);
  } catch (e) {
    res.status(400).json({ error: e.message });
  }
});

router.put("/:id/move", auth, async (req, res) => {
  try {
    const card = await service.moveCard({
      card_id: req.params.id,
      ...req.body,
    });
    req.app.get("io").to(`board-${card.board_id}`).emit("card:move", {
      card_id: card.card_id,
      to_column_id: card.column_id,
      new_position: card.position,
    });
    res.json(card);
  } catch (e) {
    res.status(400).json({ error: e.message });
  }
});

export default router;
