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
          @update:list="(newList) => (col.cards = newList)"
          @change="(evt) => onCardChange(evt, col.column_id)"
        >
          <template #item="{ element }">
            <div class="draggable-card">
              <Card :card="element" />
            </div>
          </template>
        </draggable>

        <el-button size="small" @click="addCard(col.column_id)">+ Добавить</el-button>
      </div>
    </div>
  </div>
  <div v-else class="loading">
    <el-icon><Loading /></el-icon> Загружаем…
  </div>
</template>

<script setup lang="ts">
import { onMounted, onBeforeUnmount } from 'vue'
import { useRoute } from 'vue-router'
import { socket } from '@/api/socket'
import Card from '@/components/Card.vue'
import { useBoardsStore } from '@/stores/boards'
import { Loading } from '@element-plus/icons-vue'
import draggable from 'vuedraggable'

declare module 'vue' {
  export interface GlobalComponents {
    draggable: typeof draggable
  }
}

const boardStore = useBoardsStore()
const route = useRoute()
const boardId = route.params.id as string

onMounted(async () => {
  await boardStore.fetchBoard(boardId)
  console.log(boardStore.board)

  socket.connect()
  socket.emit('joinBoard', boardId)

  socket.on('cardMoved', (data: any) => {
    if (!boardStore.board) return
    const moved = boardStore.board.columns
      .flatMap((c) => c.cards)
      .find((c) => c.card_id === data.id)
    if (moved) boardStore.localMoveCard(moved, data.toColumnId, data.newIndex)
  })

  socket.on('cardCreated', (data: any) => {
    if (data.boardId === Number(boardId)) {
      boardStore.addLocalCard(data.card, data.columnId)
    }
  })
})

onBeforeUnmount(() => {
  socket.emit('leaveBoard', boardId)
  socket.off('cardMoved')
  socket.off('cardCreated')
  socket.disconnect()
})

function onCardChange(evt: any, toColumnId: number) {
  const { added, moved, removed } = evt

  if (added) {
    const card = added.element
    const newIndex = added.newIndex
    socket.emit('cardMoved', {
      id: card.card_id,
      toColumnId,
      newIndex,
    })
  }

  if (moved) {
    const card = moved.element
    const newIndex = moved.newIndex
    const oldIndex = moved.oldIndex
    socket.emit('cardMoved', {
      id: card.card_id,
      toColumnId,
      newIndex,
      oldIndex,
    })
  }
}

async function addCard(columnId: number) {
  const title = prompt('Название карточки')
  if (!title) return

  const tempCard = {
    card_id: Date.now(),
    title,
    description: '',
    position: 0,
    due_date: null,
    priority: null,
  }
  boardStore.addLocalCard(tempCard, columnId)
  this.$toast.success('Карточка добавлена (локально)')
  socket.emit('cardCreated', {
    boardId: Number(boardId),
    columnId,
    card: tempCard,
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
