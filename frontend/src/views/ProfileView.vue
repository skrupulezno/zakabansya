<template>
  <div class="container py-4">
    <button class="btn btn-link mb-3" @click="$router.back()">Назад</button>
    <div v-if="user" class="card mx-auto" style="max-width: 400px">
      <div class="card-body text-center">
        <img :src="user.avatar_url" class="rounded-circle mb-3" width="80" height="80" />
        <h5 class="card-title">{{ user.name }}</h5>
        <p class="text-muted">{{ user.email }}</p>
        <p class="text-muted">ID: {{ user.user_id }}</p>
        <button class="btn btn-danger" @click="logout">Выйти</button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { fetchCurrentUser } from '@/services/user.service'
import { useAuthStore } from '@/stores/auth'

const auth = useAuthStore()
const user = ref<any>(null)

onMounted(async () => {
  user.value = await fetchCurrentUser()
})

function logout() {
  auth.logout()
}
</script>

<style scoped>
.container {
  min-height: 100vh;
}
</style>
