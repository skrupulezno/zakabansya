import express from "express";
import { auth } from "../middleware/auth.js";
import * as service from "../services/cardService.js";

const router = express.Router();

router.post("/", auth, async (req, res) => {
  try {
    const card = await service.addCard(req.body);
    req.app.get("io").emit("cardCreated", card);
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
    req.app.get("io").emit("cardMoved", card);
    res.json(card);
  } catch (e) {
    res.status(400).json({ error: e.message });
  }
});

export default router;
