<!-- src/views/RegisterView.vue -->
<template>
  <el-card class="login-card">
    <h2>Регистрация</h2>
    <el-form @submit.prevent="onSubmit">
      <el-form-item label="Имя">
        <el-input v-model="form.name" placeholder="Имя" />
      </el-form-item>
      <el-form-item label="Email">
        <el-input v-model="form.email" placeholder="Email" />
      </el-form-item>
      <el-form-item label="Пароль">
        <el-input type="password" v-model="form.password" placeholder="Пароль" />
      </el-form-item>
      <el-button type="primary" @click="onSubmit">Зарегистрироваться</el-button>
    </el-form>
  </el-card>
</template>

<script setup lang="ts">
import { reactive } from 'vue'
import { useRouter } from 'vue-router'
import { useToast } from 'vue-toastification'
import { useAuthStore } from '@/stores/auth'

const form = reactive({ name: '', email: '', password: '' })
const auth = useAuthStore()
const toast = useToast()
const router = useRouter()

async function onSubmit() {
  try {
    await auth.register(form)
    toast.success('Регистрация прошла успешно')
    router.push('/boards')
  } catch (err) {
    toast.error('Ошибка при регистрации')
  }
}
</script>

<style scoped>
.login-card {
  max-width: 400px;
  margin: 50px auto;
}
</style>
