<template>
  <Layout>
    <div v-if="boardStore.board" class="board-view p-3">
      <div class="board-columns d-flex gap-3">
        <div
          v-for="col in boardStore.board.columns"
          :key="col.column_id"
          class="column"
          style="width: 268px"
        >
          <div class="">
            <h5 class="column bg-white p-2 px-3 w-100 rounded mb-2">{{ col.name }}</h5>
            <button
              class="btn btn-m btn-outline-primary w-100 mb-2"
              @click="addCard(col.column_id)"
            >
              <font-awesome-icon icon="plus" /> Добавить
            </button>
            <draggable
              class="card-list min-vh-50"
              :list="col.cards"
              :group="{ name: 'cards', pull: true, put: true }"
              item-key="card_id"
              @change="(evt) => onCardChange(evt, col.column_id)"
            >
              <template #item="{ element }">
                <div class="draggable-card mb-2">
                  <Card :card="element" />
                </div>
              </template>
            </draggable>
          </div>
        </div>
      </div>
    </div>

    <div v-else class="loading text-center py-5">
      <font-awesome-icon icon="spinner" spin />&nbsp;Загружаем…
    </div>
  </Layout>
</template>

<script setup lang="ts">
import { onMounted, onBeforeUnmount, ref } from 'vue'
import { useRoute } from 'vue-router'
import draggable from 'vuedraggable'

import Card from '@/components/Card.vue'
import { socket } from '@/api/socket'
import { useBoardsStore } from '@/stores/boards'
import { createCard, moveCard } from '@/services/card.service'

import Layout from '@/components/Layout.vue'

/* ——— stores & route ——— */
const boardStore = useBoardsStore()
const boardId = Number(useRoute().params.id)

const socketId = ref<string | undefined>('')

/* ——— lifecycle ——— */
onMounted(async () => {
  await boardStore.fetchBoard(boardId)

  socket.connect()
  socket.emit('joinBoard', boardId)

  socket.on('connect', () => {
    socketId.value = socket.id
  })

  socket.on('column:add', (p: any) => {
    boardStore.addLocalColumn(p.column)
  })

  socket.on('card:add', (p: any) => {
    boardStore.addLocalCard(p.card, p.column_id)
  })

  socket.on('card:move', (d: any) => {
    const moved = boardStore.board?.columns
      .flatMap((c) => c.cards)
      .find((c) => c.card_id === d.card_id)
    if (moved) boardStore.localMoveCard(moved, d.to_column_id, d.new_position)
  })
})

onBeforeUnmount(() => {
  socket.emit('leaveBoard', boardId)
  socket.off('column:add')
  socket.off('card:add')
  socket.off('card:move')
  socket.disconnect()
})

/* ——— drag & drop ——— */
function onCardChange(evt: any, toColumnId: number) {
  const { added, moved } = evt
  const info = added || moved
  if (!info) return

  const card = info.element
  const newPos = info.newIndex
  moveCard(card.card_id, toColumnId, newPos, socketId.value)
}

/* ——— add card ——— */
async function addCard(columnId: number) {
  const title = prompt('Название карточки')
  if (!title) return

  const newCard = await createCard(columnId, title, socketId.value)
  boardStore.addLocalCard(newCard, columnId)
  // Предполагается, что у вас есть toast-плагин
  this.$toast.success('Карточка создана')
}
</script>

<style scoped>
.board-columns {
  display: flex;
}
.column {
  background: #f8f9fa;
}
.loading {
  font-size: 1.2rem;
}
.draggable-card {
  cursor: grab;
}
</style>
