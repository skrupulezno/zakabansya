<template>
  <div v-if="boardStore.board" class="board-view">
    <h2>{{ boardStore.board.board.title }}</h2>

    <div class="board-columns">
      <div v-for="col in boardStore.board.columns" :key="col.column_id" class="column">
        <h3>{{ col.name }}</h3>

        <draggable
          class="card-list"
          :list="col.cards"
          :group="{ name: 'cards', pull: true, put: true }"
          item-key="card_id"
          @change="(evt) => onCardChange(evt, col.column_id)"
        >
          <template #item="{ element }">
            <div class="draggable-card">
              <Card :card="element" />
            </div>
          </template>
        </draggable>

        <el-button size="small" @click="addCard(col.column_id)"> + Добавить </el-button>
      </div>
    </div>
  </div>

  <div v-else class="loading">
    <el-icon><Loading /></el-icon>&nbsp;Загружаем…
  </div>
</template>

<script setup lang="ts">
import { onMounted, onBeforeUnmount } from 'vue'
import { useRoute } from 'vue-router'
import draggable from 'vuedraggable'

import Card from '@/components/Card.vue'
import { socket } from '@/api/socket'
import { useBoardsStore } from '@/stores/boards'
import { useCardsStore } from '@/stores/cards'
import { Loading } from '@element-plus/icons-vue'

/* ——— stores & route ——— */
const boardStore = useBoardsStore()
const cardsStore = useCardsStore()
const boardId = Number(useRoute().params.id)

/* ——— lifecycle ——— */
onMounted(async () => {
  await boardStore.fetchBoard(boardId)
  await cardsStore.fetchBoard(boardId)

  socket.connect()
  socket.emit('joinBoard', boardId)

  /* realtime: новый столбец */
  socket.on('column:add', (p: any) => {
    boardStore.addLocalColumn(p.column)
  })

  /* realtime: новая карточка */
  socket.on('card:add', (p: any) => {
    boardStore.addLocalCard(p.card, p.column_id)
  })

  /* realtime: перемещение карточки */
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

  // карточка перемещена или добавлена
  const info = added || moved
  if (!info) return

  const card = info.element
  const newPos = info.newIndex
  cardsStore.moveCard(card.card_id, toColumnId, newPos)

  socket.emit('card:move', {
    card_id: card.card_id,
    to_column_id: toColumnId,
    new_position: newPos,
  })
}

/* ——— add card ——— */
async function addCard(this: any, columnId: number) {
  const title = prompt('Название карточки')
  if (!title) return

  const newCard = await cardsStore.createCard(columnId, { title })
  boardStore.addLocalCard(newCard, columnId)
  this.$toast.success('Карточка создана')

  socket.emit('card:add', {
    column_id: columnId,
    card: newCard,
  })
}
</script>

<style scoped>
.board-columns {
  display: flex;
  gap: 24px;
}
.column {
  background: #f5f7fa;
  padding: 12px;
  border-radius: 4px;
  width: 250px;
}
.loading {
  text-align: center;
  padding: 40px;
}
.card-list {
  min-height: 60px;
}
.draggable-card {
  margin-bottom: 8px;
  cursor: move;
}
</style>
