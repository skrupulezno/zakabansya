<!-- components/InviteModal.vue -->
<template>
  <!-- телепортируем модалку, чтобы она не была вложена в layout-контейнеры -->
  <teleport to="body">
    <transition name="fade">
      <!-- overlay + диалог показываем только когда show === true -->
      <div v-if="show" class="vuemodal-overlay" @keydown.esc="close" tabindex="0">
        <div class="vuemodal-dialog" @click.stop>
          <!-- Шапка -->
          <h5 class="fw-medium mb-3">Пригласить участников</h5>

          <!-- Поиск -->
          <input v-model="search" class="form-control mb-2" placeholder="Поиск" />

          <h6>Участники</h6>
          <ul class="list-group mb-3">
            <li
              v-for="m in members"
              :key="m.user_id"
              class="list-group-item d-flex justify-content-between align-items-center"
            >
              <div class="d-flex align-items-center">
                <img :src="m.avatar_url" class="rounded-circle me-2" width="32" height="32" />
                <span>{{ m.name }}</span>
                <small class="text-muted ms-2">{{ m.role === 'owner' ? 'админ' : 'участник' }}</small>
              </div>
              <button
                v-if="auth.userId === ownerId && m.user_id !== ownerId"
                class="btn btn-sm btn-outline-danger"
                @click="remove(m.user_id)"
              >
                удалить
              </button>
            </li>
          </ul>

          <!-- Список пользователей -->
          <div class="list-group overflow-auto mb-3" style="max-height: 300px">
            <label
              v-for="u in available"
              :key="u.user_id"
              class="list-group-item d-flex align-items-center"
            >
              <input
                type="checkbox"
                v-model="selected"
                :value="u.user_id"
                class="form-check-input me-2"
              />
              <img :src="u.avatar_url" class="rounded-circle me-2" width="32" height="32" />
              <span>{{ u.name }}</span>
              <small class="text-muted ms-2">{{ u.email }}</small>
            </label>
          </div>

          <!-- Футер -->
          <div class="d-flex justify-content-end gap-2">
            <button class="btn btn-secondary" @click="close">Отмена</button>
            <button class="btn btn-primary" :disabled="!selected.length" @click="invite">
              Пригласить
            </button>
          </div>
        </div>
      </div>
    </transition>
  </teleport>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { fetchUsers, inviteUsers, removeBoardMember } from '../services/user.service'
import { useBoardsStore } from '@/stores/boards'
import { useAuthStore } from '@/stores/auth'

/* -------- props & v-model -------- */
const props = defineProps<{ boardId: number; modelValue: boolean }>()
const emit = defineEmits<{
  (e: 'update:modelValue', value: boolean): void
}>()

const show = computed({
  get: () => props.modelValue,
  set: (v) => emit('update:modelValue', v),
})

/* -------- reactive state -------- */
const users = ref<{ user_id: number; name: string; email: string; avatar_url: string }[]>([])
const search = ref('')
const selected = ref<number[]>([])
const boardStore = useBoardsStore()
const auth = useAuthStore()

/* -------- computed -------- */
const members = computed(() => boardStore.board?.members || [])
const ownerId = computed(() => boardStore.board?.board.owner_id)
const available = computed(() =>
  users.value.filter(
    (u) =>
      u.user_id !== auth.userId &&
      !members.value.some((m: any) => m.user_id === u.user_id) &&
      u.name.toLowerCase().includes(search.value.toLowerCase()),
  ),
)

/* -------- methods -------- */
async function invite() {
  await inviteUsers(props.boardId, selected.value)
  await boardStore.fetchBoard(props.boardId)
  close()
}

async function remove(id: number) {
  await removeBoardMember(props.boardId, id)
  await boardStore.fetchBoard(props.boardId)
}

function close() {
  show.value = false
  selected.value = []
}

onMounted(async () => {
  users.value = await fetchUsers()
})
</script>

<style scoped>
/* overlay */
.vuemodal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.55); /* затемнение */
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1050; /* поверх остального контента */
}

/* диалог */
.vuemodal-dialog {
  background: #fff;
  border-radius: 0.5rem;
  padding: 1.5rem;
  width: 500px;
  max-width: calc(100% - 2rem);
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 0.5rem 1rem rgba(0, 0, 0, 0.15);
}

/* плавное появление / исчезновение */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
