<!-- src/views/BoardsView.vue -->
<template>
  <h2>Мои доски</h2>
  <el-button type="primary" @click="addBoard">+ Создать доску</el-button>
  <el-divider></el-divider>
  <ul class="boards-list">
    <li v-for="board in boardsStore.boards" :key="board.id">
      <router-link :to="`/boards/${board.board_id}`">
        <el-card>{{ board.title }}</el-card>
      </router-link>
    </li>
  </ul>
</template>

<script setup lang="ts">
import { onMounted } from 'vue'
import { useBoardsStore } from '@/stores/boards'

const boardsStore = useBoardsStore()

onMounted(() => {
  boardsStore.fetchBoards()
})

async function addBoard() {
  const name = prompt('Название доски')
  if (name) {
    try {
      await boardsStore.createBoard(name)
      this.$toast.success('Доска создана')
    } catch {
      this.$toast.error('Ошибка создания доски')
    }
  }
}
</script>

<style scoped>
.boards-list {
  list-style: none;
  padding: 0;
  display: flex;
  gap: 16px;
  flex-wrap: wrap;
}
.boards-list li {
  width: 200px;
}
.boards-list li a {
  text-decoration: none;
  color: inherit;
}
</style>
