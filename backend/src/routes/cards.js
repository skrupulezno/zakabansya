import express from "express";
import { auth } from "../middleware/auth.js";
import * as service from "../services/cardService.js";

const router = express.Router();

/* ───────────── ДОБАВИТЬ КАРТОЧКУ ───────────── */
router.post("/", auth, async (req, res) => {
  try {
    const socketId = req.body.socketId; // забираем socketId
    const card = await service.addCard(req.body);

    const io = req.app.get("io");
    const room = `board-${card.board_id}`;

    if (socketId) {
      console.log("card:add");

      io.to(room).except(socketId).emit("card:add", {
        column_id: card.column_id,
        card,
      });
    } else {
      io.to(room).emit("card:add", {
        column_id: card.column_id,
        card,
      });
    }

    res.status(201).json(card);
  } catch (e) {
    res.status(400).json({ error: e.message });
  }
});

/* ───────────── ПЕРЕМЕСТИТЬ КАРТОЧКУ ───────────── */
router.put("/:id/move", auth, async (req, res) => {
  try {
    const { new_column_id, new_position, socketId } = req.body;
    if (new_column_id == null || new_position == null) {
      return res
        .status(400)
        .json({ error: "Нужно передать и new_column_id, и new_position" });
    }

    const card = await service.moveCard({
      card_id: +req.params.id,
      new_column_id,
      new_position,
    });

    const io = req.app.get("io");
    const room = `board-${card.board_id}`;

    if (socketId) {
      io.to(room).except(socketId).emit("card:move", {
        card_id: card.card_id,
        to_column_id: card.column_id,
        new_position: card.position,
      });
    } else {
      io.to(room).emit("card:move", {
        card_id: card.card_id,
        to_column_id: card.column_id,
        new_position: card.position,
      });
    }

    res.json(card);
  } catch (e) {
    res.status(400).json({ error: e.message });
  }
});

/* ───────────── ОБНОВИТЬ КАРТОЧКУ ───────────── */
router.put("/:id", auth, async (req, res) => {
  try {
    const socketId = req.body.socketId;
    const dto = {
      card_id: +req.params.id,
      user_id: req.user.user_id,
      ...req.body,
    };
    const card = await service.updateCard(dto);
    if (!card) {
      return res.status(404).json({ error: "Card not found or no access" });
    }

    const io = req.app.get("io");
    const room = `board-${card.board_id}`;

    if (socketId) {
      io.to(room).except(socketId).emit("card:update", {
        card_id: card.card_id,
        card,
      });
    } else {
      io.to(room).emit("card:update", {
        card_id: card.card_id,
        card,
      });
    }

    res.json(card);
  } catch (e) {
    res.status(400).json({ error: e.message });
  }
});

router.delete("/:id", auth, async (req, res) => {
  try {
    const { success, board_id } = await service.deleteCard({
      card_id: +req.params.id,
    });

    if (!success) {
      return res.status(404).json({ error: "Card not found" });
    }

    const io = req.app.get("io");
    const room = `board-${board_id}`;
    const socketId = req.body?.socketId;

    socketId
      ? io
          .to(room)
          .except(socketId)
          .emit("card:delete", { card_id: +req.params.id })
      : io.to(room).emit("card:delete", { card_id: +req.params.id });

    res.status(204).end();
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

export default router;
