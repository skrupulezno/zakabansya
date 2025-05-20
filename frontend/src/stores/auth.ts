import { defineStore } from 'pinia'
import api from '@/api/http'
import router from '@/router'

interface User {
  id: string
  name: string
}

export const useAuthStore = defineStore('auth', {
  state: () => ({
    token: localStorage.getItem('token') || '',
    userId: localStorage.getItem('userId') || (null as string | null),
  }),
  getters: {
    isAuthenticated: (state) => !!state.token,
  },
  actions: {
    async init() {
      if (this.token) {
        await this.fetchUser()
      }
    },
    async login(credentials: { email: string; password: string }) {
      const res = await api.post('/auth/login', credentials)
      this.token = res.data.token
      localStorage.setItem('token', this.token)

      await this.fetchUser()
      router.push('/')
    },
    async register(credentials: { name: string; email: string; password: string }) {
      const res = await api.post('/auth/register', credentials)
      this.token = res.data.token
      localStorage.setItem('token', this.token)

      await this.fetchUser()
      router.push('/')
    },
    async fetchUser() {
      try {
        const res = await api.get('/users/me', {
          headers: {
            Authorization: `Bearer ${this.token}`,
          },
        })
        this.userId = res.data.id
        localStorage.setItem('userId', this.userId || '')
      } catch (err) {
        console.error('Failed to fetch user:', err)
        this.logout()
      }
    },
    logout() {
      this.token = ''
      this.userId = null
      localStorage.removeItem('token')
      localStorage.removeItem('userId')
      router.push('/login')
    },
  },
})
