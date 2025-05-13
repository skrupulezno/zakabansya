import * as repo from "../repositories/cardRepo.js";

export const addCard = repo.createCard;
export const moveCard = repo.moveCard;
export const getCardsByColumn = repo.listCardsByColumn;
