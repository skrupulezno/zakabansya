import { defineStore } from 'pinia'
import api from '@/api/http'

export interface Card {
  card_id: number
  title: string
  description: string
  position: number
  due_date: string | null
  priority: string | null
}

export interface Column {
  column_id: number
  board_id: number
  name: string
  position: number
  cards: Card[]
}

export interface BoardMeta {
  board_id: number
  title: string
  description: string
  owner_id: number
  visibility: string
  created_at: string
  archived_at: string | null
}

export interface FullBoard {
  board: BoardMeta
  columns: Column[]
  members: unknown[]
}

export const useBoardsStore = defineStore('boards', {
  state: () => ({
    boards: [] as BoardMeta[],
    board: null as FullBoard | null,
  }),
  actions: {
    async fetchBoards() {
      const res = await api.get('/boards')
      this.boards = res.data
    },
    async fetchBoard(board_id: string | number) {
      const res = await api.get(`/boards/${board_id}/full`)
      this.board = res.data
    },
    async createBoard(name: string) {
      const res = await api.post('/boards', { name })
      this.boards.push(res.data)
    },

    /** локальное перемещение карточки (без запроса) */
    localMoveCard(card: Card, toColumnId: number, newIndex: number) {
      if (!this.board) return
      // удалить из старой колонки
      for (const col of this.board.columns) {
        const idx = col.cards.findIndex((c) => c.card_id === card.card_id)
        if (idx !== -1) {
          col.cards.splice(idx, 1)
          break
        }
      }
      // вставить в целевую
      const dest = this.board.columns.find((c) => c.column_id === toColumnId)
      dest?.cards.splice(newIndex, 0, card)
    },
    addLocalColumn(column: Column) {
      this.board?.columns.push(column)
    },
    addLocalCard(card: Card, columnId: number) {
      this.board?.columns.find((c) => c.column_id === columnId)?.cards.push(card)
    },
  },
})
