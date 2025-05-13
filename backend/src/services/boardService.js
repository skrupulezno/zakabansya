import * as repo from "../repositories/boardRepo.js";

export const createBoard = async (dto) => repo.createBoard(dto);
export const listBoards = async (user_id) => repo.getBoardsForUser(user_id);
export const getFullBoard = (board_id, user_id) =>
  repo.getFullBoard(board_id, user_id);
export const updateBoard = async ({
  board_id,
  owner_id,
  title,
  description,
  visibility,
}) => {
  return repo.updateBoard({
    board_id,
    owner_id,
    title,
    description,
    visibility,
  });
};

export const deleteBoard = async (board_id, owner_id) => {
  return repo.deleteBoard(board_id, owner_id);
};
