<!-- src/views/LoginView.vue -->
<template>
  <div class="card login-card">
    <div class="card-body">
      <h2 class="card-title text-center mb-4">Вход</h2>
      <form @submit.prevent="onSubmit">
        <div class="mb-3">
          <label for="email" class="form-label">Email</label>
          <input
            type="email"
            id="email"
            v-model="form.email"
            class="form-control"
            placeholder="Email"
            required
          />
        </div>
        <div class="mb-3">
          <label for="password" class="form-label">Пароль</label>
          <input
            type="password"
            id="password"
            v-model="form.password"
            class="form-control"
            placeholder="Пароль"
            required
          />
        </div>
        <button type="submit" class="btn btn-primary w-100">Войти</button>
        <a href="/register">Регистрация</a>
      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { reactive } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { useToast } from 'vue-toastification'

const form = reactive({ email: '', password: '' })
const auth = useAuthStore()
const router = useRouter()
const toast = useToast()

async function onSubmit() {
  try {
    await auth.login(form)
    toast.success('Вход выполнен')
    router.push('/')
  } catch (err) {
    toast.error('Ошибка при входе')
  }
}
</script>

<style scoped>
.login-card {
  max-width: 400px;
  margin: 50px auto;
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
}
</style>
