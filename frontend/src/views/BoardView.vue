<script setup lang="ts">
import { onMounted, onBeforeUnmount, ref } from 'vue'
import { useRoute } from 'vue-router'
import draggable from 'vuedraggable'

import Card from '@/components/Card.vue'
import Layout from '@/components/Layout.vue'
import { socket } from '@/api/socket'
import { useBoardsStore, type Column } from '@/stores/boards'
import { createCard, moveCard } from '@/services/card.service'

import { Modal } from 'bootstrap'

const boardStore = useBoardsStore()
const boardId = Number(useRoute().params.id)
const socketId = ref<string>()

const editingCol = ref<Column | null>(null)
const draftName = ref('')

const modalRef = ref<HTMLElement>()

onMounted(async () => {
  await boardStore.fetchBoard(boardId)

  socket.connect()
  socket.emit('joinBoard', boardId)

  socket.on('connect', () => (socketId.value = socket.id))

  socket.on('column:add', (p) => boardStore.addLocalColumn(p.column))
  socket.on('column:delete', (p) => boardStore.removeLocalColumn(p.column_id))
  socket.on('column:update', (p) => boardStore.updateLocalColumn(p.column))

  socket.on('card:add', (p) => boardStore.addLocalCard(p.card, p.column_id))
  socket.on('card:move', (d) => {
    const moved = boardStore.board?.columns
      .flatMap((c) => c.cards)
      .find((c) => c.card_id === d.card_id)
    if (moved) boardStore.localMoveCard(moved, d.to_column_id, d.new_position)
  })
})

onBeforeUnmount(() => {
  socket.emit('leaveBoard', boardId)
  socket.removeAllListeners()
  socket.disconnect()
})

function openEditModal(col: Column) {
  editingCol.value = col
  draftName.value = col.name
  const bsModal = Modal.getOrCreateInstance(modalRef.value!)
  bsModal.show()
}

async function saveColumn() {
  if (!editingCol.value) return
  const newName = draftName.value.trim()
  if (!newName) return

  await boardStore.editColumn(editingCol.value.column_id, { name: newName })
  Modal.getInstance(modalRef.value!)?.hide()
}

async function removeColumn() {
  if (!editingCol.value) return
  if (!confirm('Удалить колонку вместе со всеми карточками?')) return

  await boardStore.deleteColumn(editingCol.value.column_id)
  Modal.getInstance(modalRef.value!)?.hide()
}

function onCardChange(evt: any, toColumnId: number) {
  const info = evt.added || evt.moved
  if (!info) return
  moveCard(info.element.card_id, toColumnId, info.newIndex, socketId.value)
}

function onColumnChange(evt: any) {
  const info = evt.moved
  if (!info) return
  boardStore.localMoveColumn(info.oldIndex, info.newIndex)
  boardStore.syncColumnsOrder()
}

async function addCard(columnId: number) {
  const title = prompt('Название карточки')
  if (!title) return
  const newCard = await createCard(columnId, title, socketId.value)
  boardStore.addLocalCard(newCard, columnId)
}

async function addColumn() {
  const name = prompt('Название колонки')
  if (!name || !boardStore.board) return
  const position = boardStore.board.columns.length
  const newCol = await boardStore.createColumn(name, position)
  boardStore.addLocalColumn(newCol)
}
</script>

<template>
  <Layout>
    <div v-if="boardStore.board" class="board-view p-3">
      <!-- ===== СТОЛБЦЫ ===== -->
      <draggable
        class="board-columns d-flex gap-3"
        :list="boardStore.board.columns"
        item-key="column_id"
        direction="horizontal"
        :animation="200"
        @change="onColumnChange"
        :handle="'.drag-handle'"
      >
        <!-- Элемент‑шаблон столбца -->
        <template #item="{ element: col }">
          <div class="column" style="width: 268px">
            <h5 class="bg-white p-2 px-3 rounded mb-2 d-flex justify-content-between">
              <div class="d-flex gap-2 justify-content-center align-items-center">
                <font-awesome-icon icon="grip-vertical" class="drag-handle" style="cursor: grab" />
                <div class="mb-1">{{ col.name }}</div>
              </div>
              <font-awesome-icon
                icon="pen-to-square"
                style="cursor: pointer"
                @click.stop="openEditModal(col)"
              />
            </h5>

            <button class="btn btn-outline-primary w-100 mb-2" @click="addCard(col.column_id)">
              <font-awesome-icon icon="plus" /> Добавить
            </button>

            <!-- ===== КАРТОЧКИ ВНУТРИ СТОЛБЦА ===== -->
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
        </template>

        <!-- Кнопка «Добавить колонку» -->
        <template #footer>
          <div class="column">
            <div
              class="d-flex align-items-center justify-content-center p-2 rounded"
              style="width: 268px; background: #e9ecef; cursor: pointer"
              @click="addColumn"
            >
              <font-awesome-icon icon="plus" class="me-2" />
              Добавить колонку
            </div>
          </div>
        </template>
      </draggable>
    </div>

    <div v-else class="loading text-center py-5">
      <font-awesome-icon icon="spinner" spin />
    </div>
  </Layout>
  <div class="modal fade" tabindex="-1" ref="modalRef">
    <div class="modal-dialog">
      <div class="modal-content">
        <div class="modal-header">
          <h5 class="modal-title">Редактировать колонку</h5>
          <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
        </div>

        <div class="modal-body">
          <label class="form-label">Название</label>
          <input
            v-model="draftName"
            type="text"
            class="form-control"
            placeholder="Название колонки"
          />
        </div>

        <div class="modal-footer justify-content-between">
          <button class="btn btn-danger me-auto" @click="removeColumn">
            <font-awesome-icon icon="trash" /> Удалить
          </button>

          <button class="btn btn-secondary" data-bs-dismiss="modal">Отмена</button>
          <button class="btn btn-primary" @click="saveColumn">Сохранить</button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.button-drag {
  display: flex;
  flex-direction: row;
}
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

.modal .form-label {
  font-weight: 500;
}
</style>
