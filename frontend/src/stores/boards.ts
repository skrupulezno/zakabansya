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
    async createBoard(title: string) {
      const res = await api.post('/boards', { title, visibility: 'public' })
      this.boards.push(res.data)
    },
    localMoveCard(card: Card, toColumnId: number, newIndex: number) {
      if (!this.board) return
      for (const col of this.board.columns) {
        const idx = col.cards.findIndex((c) => c.card_id === card.card_id)
        if (idx !== -1) {
          col.cards.splice(idx, 1)
          break
        }
      }
      const dest = this.board.columns.find((c) => c.column_id === toColumnId)
      dest?.cards.splice(newIndex, 0, card)
    },
    localMoveColumn(fromIdx: number, toIdx: number) {
      if (!this.board) return
      const cols = this.board.columns
      const [moved] = cols.splice(fromIdx, 1)
      cols.splice(toIdx, 0, moved)
      cols.forEach((c, i) => (c.position = i))
    },
    async syncColumnsOrder() {
      if (!this.board) return
      const body = this.board.columns.map(({ column_id, position }) => ({
        column_id,
        position,
      }))
      await api.patch('/columns/reorder', body)
    },
    addLocalColumn(col: Column) {
      this.board?.columns.push(col)
    },
    removeLocalColumn(id: number) {
      if (!this.board) return
      this.board.columns = this.board.columns.filter((c) => c.column_id !== id)
      this.board.columns.forEach((c, i) => (c.position = i))
    },
    updateLocalColumn(upd: Partial<Column> & { column_id: number }) {
      const col = this.board?.columns.find((c) => c.column_id === upd.column_id)
      if (col) Object.assign(col, upd)
    },
    async createColumn(name: string, position: number) {
      if (!this.board) return
      const { data } = await api.post('/columns', {
        board_id: this.board.board.board_id,
        name,
        position,
      })
      return data
    },
    addLocalCard(card: Card, columnId: number, position?: number) {
      if (!this.board) return

      const column = this.board.columns.find((c) => c.column_id === columnId)
      if (!column) return // колонка не найдена – выходим

      const insertPos = position ?? column.cards.length
      column.cards.splice(insertPos, 0, card) // вставляем карточку

      // обновляем поле position у всех карточек колонки
      column.cards.forEach((c, i) => (c.position = i))
    },

    removeLocalCard(cardId: number) {
      if (!this.board) return
      for (const col of this.board.columns) {
        const idx = col.cards.findIndex((c) => c.card_id === cardId)
        if (idx !== -1) {
          col.cards.splice(idx, 1)
          col.cards.forEach((c, i) => (c.position = i))
          break
        }
      }
    },

    async editColumn(column_id: number, payload: { name?: string; position?: number }) {
      const { data } = await api.put(`/columns/${column_id}`, payload)
      this.updateLocalColumn(data)
      return data
    },
    async deleteColumn(column_id: number) {
      await api.delete(`/columns/${column_id}`)
      this.removeLocalColumn(column_id)
    },
  },
})
