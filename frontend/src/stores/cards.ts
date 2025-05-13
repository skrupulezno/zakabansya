import { defineStore } from 'pinia'
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

export const useCardsStore = defineStore('cards', {
  state: () => ({
    currentBoard: null as BoardDetail | null,
  }),

  actions: {
    /* получить доску с колонками и карточками */
    async fetchBoard(boardId: number | string) {
      const { data } = await api.get(`/boards/${boardId}/full`)
      this.currentBoard = {
        board_id: data.board.board_id,
        title: data.board.title,
        columns: data.columns,
      }
    },

    /* создать карточку */
    async createCard(columnId: number, payload: { title: string }) {
      const { data } = await api.post('/cards', {
        column_id: columnId,
        ...payload,
      })
      const col = this.currentBoard?.columns.find((c) => c.column_id === columnId)
      col?.cards.push(data)
      return data
    },

    /* переместить карточку */
    async moveCard(cardId: number, toColumnId: number, newIndex: number) {
      await api.put(`/cards/${cardId}/move`, {
        new_column_id: toColumnId,
        new_position: newIndex,
      })

      if (!this.currentBoard) return
      let moved: Card | undefined

      for (const col of this.currentBoard.columns) {
        const idx = col.cards.findIndex((c) => c.card_id === cardId)
        if (idx !== -1) {
          ;[moved] = col.cards.splice(idx, 1)
          break
        }
      }
      if (moved) {
        const dest = this.currentBoard.columns.find((c) => c.column_id === toColumnId)
        dest?.cards.splice(newIndex, 0, moved)
      }
    },
  },
})
