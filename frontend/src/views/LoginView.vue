V<!-- src/views/LoginView.vue -->
<template>
  <el-card class="login-card">
    <h2>Вход</h2>
    <el-form @submit.prevent="onSubmit">
      <el-form-item label="Email">
        <el-input v-model="form.email" placeholder="Email" />
      </el-form-item>
      <el-form-item label="Пароль">
        <el-input type="password" v-model="form.password" placeholder="Пароль" />
      </el-form-item>
      <el-button type="primary" @click="onSubmit">Войти</el-button>
    </el-form>
  </el-card>
</template>

<script setup lang="ts">
import { reactive } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const form = reactive({ email: '', password: '' })
const auth = useAuthStore()
const router = useRouter()

async function onSubmit() {
  try {
    await auth.login(form)
    this.$toast.success('Вход выполнен')
    router.push('/')
  } catch (err) {
    this.$toast.error('Ошибка при входе')
  }
}
</script>

<style scoped>
.login-card {
  max-width: 400px;
  margin: 50px auto;
}
</style>
