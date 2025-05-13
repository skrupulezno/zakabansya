<!-- src/views/BoardView.vue -->
<template>
  <h2>{{ cardsStore.currentBoard.name }}</h2>
  <div class="board-columns" style="display: flex; gap: 24px">
    <div v-for="col in cardsStore.currentBoard.columns" :key="col.id" class="column">
      <h3>{{ col.name }}</h3>
      <draggable
        v-model="col.cards"
        :item-key="'id'"
        group="cards"
        @change="(evt) => onCardDrop(col.id, evt)"
      >
        <template #item="{ element }">
          <Card :card="element" />
        </template>
      </draggable>
      <el-button size="small" @click="addCard(col.id)">+ Добавить</el-button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, onBeforeUnmount } from 'vue'
import { useRoute } from 'vue-router'
import { useToast } from 'vue-toastification'
import { useCardsStore } from '@/stores/cards'
import { socket } from '@/api/socket'
import Card from '@/components/Card.vue'

const cardsStore = useCardsStore()
const toast = useToast()
const route = useRoute()
const boardId = route.params.id as string

onMounted(async () => {
  await cardsStore.fetchBoard(boardId)
  // Подключаем сокет и присоединяемся к комнате доски
  socket.connect()
  socket.emit('joinBoard', boardId)
  // Слушаем события от сервера
  socket.on('cardMoved', (data: any) => {
    // data: { id, toColumnId, newIndex }
    cardsStore.moveCard(data.id, data.toColumnId, data.newIndex)
  })
  socket.on('cardCreated', (data: any) => {
    // data: { boardId, columnId, card }
    if (data.boardId === boardId) {
      const col = cardsStore.currentBoard.columns.find((c) => c.id === data.columnId)
      col?.cards.push(data.card)
    }
  })
})

onBeforeUnmount(() => {
  socket.emit('leaveBoard', boardId)
  socket.off('cardMoved')
  socket.off('cardCreated')
  socket.disconnect()
})

// Обработчик перетаскивания карточки в новую колонку
function onCardDrop(toColumnId: string, evt: any) {
  if (evt.added) {
    const card = evt.added.element
    const newIndex = evt.added.newIndex
    cardsStore.moveCard(card.id, toColumnId, newIndex)
    // Можно оповестить сервер (если нужно)
    socket.emit('cardMoved', { id: card.id, toColumnId, newIndex })
  }
}

// Добавление новой карточки через prompt
async function addCard(columnId: string) {
  const title = prompt('Название карточки')
  if (title) {
    await cardsStore.createCard(columnId, { title })
    toast.success('Карточка добавлена')
    // Не забываем отправить серверу событие создания
    const card = cardsStore.currentBoard.columns.find((c) => c.id === columnId)?.cards.slice(-1)[0]
    socket.emit('cardCreated', { boardId, columnId, card })
  }
}
</script>

<style scoped>
.column {
  background: #f5f7fa;
  padding: 12px;
  border-radius: 4px;
  width: 250px;
}
.kanban-card {
  margin-bottom: 8px;
}
</style>
