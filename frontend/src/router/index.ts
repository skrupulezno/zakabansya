import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import LoginView from '@/views/LoginView.vue'
import RegisterView from '@/views/RegisterView.vue'
import BoardsView from '@/views/BoardsView.vue'
import BoardView from '@/views/BoardView.vue'

const routes = [
  { path: '/login', component: LoginView },
  { path: '/register', component: RegisterView },
  { path: '/', component: BoardsView, meta: { requiresAuth: true } },
  { path: '/boards/:id', component: BoardView, meta: { requiresAuth: true } },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

// Глобальный guard: если маршрут требует auth, но нет токена – редирект на /login
router.beforeEach((to, from, next) => {
  const auth = useAuthStore()
  const isAuth = !!auth.token
  if (to.meta.requiresAuth && !isAuth) {
    return next('/login')
  }
  // Если авторизован, перенаправляем со /login или /register на /boards
  if ((to.path === '/login' || to.path === '/register') && isAuth) {
    return next('/')
  }
  next()
})

export default router
