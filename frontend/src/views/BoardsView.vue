<template>
<div class="boards-view p-4">
    <h2>Мои доски</h2>
    <button class="btn btn-primary mb-3" @click="addBoard">
      <font-awesome-icon icon="plus" class="me-1" /> Создать доску
    </button>
    <hr />
    <ul class="boards-list list-unstyled d-flex flex-wrap gap-3">
      <li v-for="board in boardsStore.boards" :key="board.board_id" style="width: 200px">
        <router-link :to="`/boards/${board.board_id}`" class="text-decoration-none">
          <div class="card h-100">
            <div class="card-body">
              <h5 class="card-title text-truncate">{{ board.title }}</h5>
            </div>
          </div>
        </router-link>
      </li>
    </ul>
  </div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue'
import { useBoardsStore } from '@/stores/boards'

const boardsStore = useBoardsStore()

onMounted(() => {
  boardsStore.fetchBoards()
})

async function addBoard(this: any) {
  const name = prompt('Название доски')
  if (!name) return

  try {
    await boardsStore.createBoard(name)
    this.$toast.success('Доска создана')
  } catch {
    this.$toast.error('Ошибка создания доски')
  }
}
</script>

<style scoped>
.boards-view {
  min-height: 100vh;
  background: linear-gradient(180deg, #f9fafb, #e9ecef);
}
.boards-list {
  gap: 16px;
}
.card {
  cursor: pointer;
  transition: transform 0.1s, box-shadow 0.1s;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}
.card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.15);
}
</style>
