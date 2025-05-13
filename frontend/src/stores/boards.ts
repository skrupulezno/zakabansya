// src/stores/boards.ts
import { defineStore } from 'pinia'
import api from '@/api/http'

interface Board {
  id: string
  name: string /* ...*/
}

export const useBoardsStore = defineStore('boards', {
  state: () => ({
    boards: [] as Board[],
  }),
  actions: {
    async fetchBoards() {
      const res = await api.get('/boards')
      this.boards = res.data
    },
    async createBoard(name: string) {
      const res = await api.post('/boards', { name })
      this.boards.push(res.data)
    },
  },
})
