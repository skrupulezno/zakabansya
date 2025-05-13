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
    const { new_column_id, new_position, socketId } = req.body;

    // Проверяем, что пришли оба параметра
    if (new_column_id == null || new_position == null) {
      return res
        .status(400)
        .json({ error: "Нужно передать и new_column_id, и new_position" });
    }

    // Обновляем позицию карточки в БД
    const card = await service.moveCard({
      card_id: Number(req.params.id),
      new_column_id: new_column_id,
      new_position: new_position,
    });

    const io = req.app.get("io");
    const room = `board-${card.board_id}`;

    if (socketId) {
      console.log("card:move:", room);

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

    return res.json(card);
  } catch (e) {
    return res.status(400).json({ error: e.message });
  }
});

router.put("/:id", auth, async (req, res) => {
  try {
    const dto = {
      card_id: Number(req.params.id),
      user_id: req.user.user_id,
      ...req.body,
    };
    const card = await service.updateCard(dto);
    if (!card) {
      return res.status(404).json({ error: "Card not found or no access" });
    }
    req.app
      .get("io")
      .to(`board-${card.board_id}`)
      .emit("card:update", { card_id: card.card_id, card });
    res.json(card);
  } catch (e) {
    res.status(400).json({ error: e.message });
  }
});

// Удаление карточки (soft delete через archived_at)
router.delete("/:id", auth, async (req, res) => {
  try {
    const dto = {
      card_id: Number(req.params.id),
      user_id: req.user.user_id,
    };
    const success = await service.deleteCard(dto);
    if (!success) {
      return res.status(404).json({ error: "Card not found or no access" });
    }
    // уведомляем по WebSocket
    req.app
      .get("io")
      .to(`board-${req.body.board_id}`) // или храните board_id в DTO/сервисе
      .emit("card:delete", { card_id: dto.card_id });
    res.status(204).end();
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

export default router;
