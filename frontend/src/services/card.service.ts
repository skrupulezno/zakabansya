import api from '@/api/http'

export interface Card {
  card_id: number
  title: string
  description?: string
  position: number
  due_date?: string | null
  priority?: string | null
}

export interface Column {
  column_id: number
  name: string
  cards: Card[]
}

export interface BoardDetail {
  board_id: number
  title: string
  columns: Column[]
}

// Получить доску с колонками и карточками
export async function fetchBoard(boardId: number | string): Promise<BoardDetail> {
  const { data } = await api.get(`/boards/${boardId}/full`)
  return {
    board_id: data.board.board_id,
    title: data.board.title,
    columns: data.columns,
  }
}

// Создать карточку
export async function createCard(columnId: number, title: string, socketId: string): Promise<Card> {
  const { data } = await api.post('/cards', {
    column_id: columnId,
    title,
    priority: 'low',
    socketId,
  })
  return data
}

// Переместить карточку
export async function moveCard(
  cardId: number,
  toColumnId: number,
  newIndex: number,
  socketId: string,
): Promise<void> {
  await api.put(`/cards/${cardId}/move`, {
    new_column_id: toColumnId,
    new_position: newIndex,
    socketId,
  })
}

export async function updateCard(
  cardId: number,
  payload: Record<string, unknown>,
  socketId: string,
): Promise<Card> {
  const { data } = await api.put(`/cards/${cardId}`, { ...payload, socketId })
  return data
}

export async function deleteCard(cardId: number, socketId: string): Promise<void> {
  await api.delete(`/cards/${cardId}`, {
    data: { socketId },
  })
}
