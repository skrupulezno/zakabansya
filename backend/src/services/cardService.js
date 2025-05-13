import * as repo from "../repositories/cardRepo.js";

export const addCard = async (payload) => {
  // payload: { column_id, title, description?, priority?, due_date?, position? }
  return repo.createCard(payload);
};
export const moveCard = repo.moveCard;
export const getCardsByColumn = repo.listCardsByColumn;
