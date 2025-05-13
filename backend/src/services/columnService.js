import * as repo from "../repositories/columnRepo.js";

export const addColumn = repo.createColumn;
export const getColumns = repo.listColumns;
export const updateColumn = repo.updateColumn;
export const deleteColumn = repo.deleteColumn;
export const reorderColumns = repo.reorderColumns;
