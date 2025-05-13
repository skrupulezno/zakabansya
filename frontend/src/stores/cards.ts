// src/stores/cards.ts
import { defineStore } from 'pinia'
import api from '@/api/http'

interface Card {
  id: string
  title: string /* ...*/
}
interface Column {
  id: string
  name: string
  cards: Card[]
}
interface BoardDetail {
  id: string
  name: string
  columns: Column[]
}

export const useCardsStore = defineStore('cards', {
  state: () => ({
    currentBoard: { id: '', name: '', columns: [] as Column[] } as BoardDetail,
  }),
  actions: {
    async fetchBoard(id: string) {
      const res = await api.get(`/boards/${id}`)
      this.currentBoard = res.data
    },
    async createCard(columnId: string, cardData: { title: string }) {
      const res = await api.post(
        `/boards/${this.currentBoard.id}/columns/${columnId}/cards`,
        cardData,
      )
      const col = this.currentBoard.columns.find((c) => c.id === columnId)
      col?.cards.push(res.data)
    },
    async moveCard(cardId: string, toColumnId: string, newIndex: number) {
      await api.patch(`/cards/${cardId}`, { columnId: toColumnId })
      // Обновляем локальное состояние (удаляем из старой колонки и вставляем в новую)
      for (const col of this.currentBoard.columns) {
        const idx = col.cards.findIndex((c) => c.id === cardId)
        if (idx !== -1) {
          const [card] = col.cards.splice(idx, 1)
          const dest = this.currentBoard.columns.find((c) => c.id === toColumnId)
          dest?.cards.splice(newIndex, 0, card)
          break
        }
      }
    },
  },
})
