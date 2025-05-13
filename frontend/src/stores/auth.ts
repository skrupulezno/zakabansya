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
    /**
     * Инициализация при запуске приложения:
     * если есть токен, подгружаем данные пользователя
     */
    async init() {
      if (this.token) {
        await this.fetchUser()
      }
    },

    /**
     * Логин: сохраняем токен и подгружаем профиль
     */
    async login(credentials: { email: string; password: string }) {
      const res = await api.post('/auth/login', credentials)
      this.token = res.data.token
      localStorage.setItem('token', this.token)

      await this.fetchUser()
      router.push('/')
    },

    /**
     * Регистрация: сохраняем токен и подгружаем профиль
     */
    async register(credentials: { name: string; email: string; password: string }) {
      const res = await api.post('/auth/register', credentials)
      this.token = res.data.token
      localStorage.setItem('token', this.token)

      await this.fetchUser()
      router.push('/')
    },

    /**
     * Запрос профиля текущего пользователя
     */
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

    /**
     * Выход: очищаем хранилище и редирект на страницу логина
     */
    logout() {
      this.token = ''
      this.userId = null
      localStorage.removeItem('token')
      localStorage.removeItem('userId')
      router.push('/login')
    },
  },
})
