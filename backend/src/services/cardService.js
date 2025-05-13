import * as repo from "../repositories/cardRepo.js";

export const addCard = async (payload) => {
  // payload: { column_id, title, description?, priority?, due_date?, position? }
  return repo.createCard(payload);
};
export const moveCard = repo.moveCard;
export const getCardsByColumn = repo.listCardsByColumn;
/**
 * Обновляет карточку, только если пользователь — владелец доски или участник с правами.
 * dto: { card_id, user_id, title?, description?, due_date?, priority?, position?, ... }
 */
export const updateCard = async (dto) => {
  return repo.updateCard(dto);
};

/**
 * Soft delete: ставит archived_at = NOW()
 * dto: { card_id, user_id }
 */
export const deleteCard = async (dto) => {
  return repo.deleteCard(dto);
};
