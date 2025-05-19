<!-- src/views/RegisterView.vue -->
<template>
  <div class="card login-card">
    <div class="card-body">
      <h2 class="card-title text-center mb-4">Регистрация</h2>
      <form @submit.prevent="onSubmit">
        <div class="mb-3">
          <label for="name" class="form-label">Имя</label>
          <input
            type="text"
            id="name"
            v-model="form.name"
            class="form-control"
            placeholder="Имя"
            required
          />
        </div>
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
        <button type="submit" class="btn btn-primary w-100">Зарегистрироваться</button>
        <a href="/login">Авторизация</a>
      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { reactive } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { useToast } from 'vue-toastification'

const form = reactive({ name: '', email: '', password: '' })
const auth = useAuthStore()
const router = useRouter()
const toast = useToast()

async function onSubmit() {
  try {
    await auth.register(form)
    toast.success('Регистрация прошла успешно')
    router.push('/')
  } catch (err) {
    toast.error('Ошибка при регистрации')
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
