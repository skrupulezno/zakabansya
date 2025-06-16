<template>
  <InviteModal :board-id="currentBoardId" v-model="inviteOpen" />
  <div class="flex-grow-1 d-flex flex-column">
    <!-- Header -->
    <header
      class="d-flex justify-content-between align-items-center px-3 bg-white border-bottom"
      style="height: 58px"
    >
      <div class="d-flex align-items-center h-100 gap-3 space border-end position-relative">
        <router-link to="/" class="btn btn-link p-0 me-2">
          <font-awesome-icon icon="arrow-left" />
        </router-link>
        <img :src="avatarUrl" alt="Avatar" class="rounded" width="40" height="40" />
        <span class="ms-2 fw-medium workspacename">{{ workspaceName }}</span>
        <button
          class="btn btn-sm btn-outline-secondary position-absolute button-close"
          @click="toggleCollapse"
        >
          <font-awesome-icon :icon="isCollapsed ? 'chevron-right' : 'bars'" />
        </button>
      </div>
      <div class="d-flex align-items-center">
        <button class="btn btn-primary me-2" @click="openModal()">
          <font-awesome-icon icon="user-plus" class="me-1" /> Пригласить команду
        </button>
        <button class="btn btn-link me-2">
          <font-awesome-icon icon="bell" />
        </button>
        <button class="btn btn-link me-2">
          <font-awesome-icon icon="folder-open" />
        </button>
        <button class="btn btn-link me-2">
          <font-awesome-icon icon="question-circle" />
        </button>
        <button class="btn btn-link me-2">
          <font-awesome-icon icon="search" />
        </button>
        <button class="btn btn-link me-2">
          <font-awesome-icon icon="magic" />
        </button>
        <button class="btn btn-link me-2">
          <font-awesome-icon icon="th-large" />
        </button>
        <img
          :src="userAvatar"
          alt="Avatar"
          class="rounded-circle"
          width="32"
          height="32"
          style="cursor: pointer"
          @click="$router.push('/profile')"
        />
      </div>
    </header>
  </div>
  <div class="d-flex content">
    <nav
      :class="[
        'bg-light border-end p-3 d-flex flex-column sidebar',
        isCollapsed ? 'sidebar-collapsed' : 'sidebar-expanded',
      ]"
    >
      <div v-if="!isCollapsed" class="mb-3">
        <input v-model="search" class="form-control" placeholder="Поиск" />
      </div>

      <ul class="nav nav-pills flex-column mb-auto">
        <li class="nav-item">
          <a href="#" class="nav-link text-dark d-flex align-items-center">
            <font-awesome-icon icon="tasks" class="me-2" />
            <span v-if="!isCollapsed">Мои задачи</span>
          </a>
        </li>
        <li>
          <a href="#" class="nav-link text-dark d-flex align-items-center">
            <font-awesome-icon icon="list" class="me-2" />
            <span v-if="!isCollapsed">Все задачи</span>
          </a>
        </li>
        <li>
          <a href="#" class="nav-link text-dark d-flex align-items-center">
            <font-awesome-icon icon="folder-open" class="me-2" />
            <span v-if="!isCollapsed">Аналитика</span>
          </a>
        </li>
        <li>
          <a
            href="#"
            class="nav-link text-dark d-flex align-items-center"
            @click.prevent="toggleSubmenu = !toggleSubmenu"
          >
            <font-awesome-icon icon="folder" class="me-2" />
            <span v-if="!isCollapsed">Доски</span>
            <font-awesome-icon
              :icon="toggleSubmenu ? 'chevron-up' : 'chevron-down'"
              class="ms-auto"
            />
          </a>
          <ul v-if="toggleSubmenu" class="nav flex-column ms-4 mt-1">
            <li>
              <a href="#" class="nav text-dark d-flex align-items-center">
                <font-awesome-icon icon="file" class="me-2" />
                <span v-if="!isCollapsed">123</span>
              </a>
            </li>
          </ul>
        </li>
      </ul>

      <div v-if="!isCollapsed" class="mt-auto">
        <hr />
        <button class="btn btn-link d-flex align-items-center p-0 mb-2 text-decoration-none">
          <font-awesome-icon icon="plus-square" class="me-2" /> Шаблоны
        </button>
        <button class="btn btn-link d-flex align-items-center p-0 text-decoration-none">
          <font-awesome-icon icon="archive" class="me-2" /> Архивные
        </button>
      </div>
    </nav>

    <main class="d-flex flex-grow-1 bg-light main">
      <slot />
    </main>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRoute } from 'vue-router'
import InviteModal from '@/components/InviteModal.vue'

const inviteOpen = ref(false)

const currentBoardId = Number(useRoute().params.id)
const isCollapsed = ref(false)
const toggleSubmenu = ref(false)
// Props
interface Props {
  boardName: string
}
const props = defineProps<Props>()
const workspaceName = computed(() => props.boardName || 'Доска')
const avatarUrl =
  'https://upload.wikimedia.org/wikipedia/commons/a/a3/Image-not-found.png?20210521171500' // URL аватара
const userAvatar =
  'https://upload.wikimedia.org/wikipedia/commons/a/a3/Image-not-found.png?20210521171500'
const search = ref('')

function toggleCollapse() {
  isCollapsed.value = !isCollapsed.value
}

function openModal() {
  inviteOpen.value = true
}
</script>

<style scoped>
.workspacename {
  max-width: 100px;
  white-space: nowrap; /* запрещаем перенос строк */
  overflow: hidden; /* скрываем всё, что не влезает */
  text-overflow: ellipsis;
}

.sidebar {
  height: calc(100dvh - 58px);
  flex-shrink: 0;
}

.main {
  height: calc(100dvh - 58px);
  overflow-x: auto;
}

.button-close {
  position: relative;
  right: 16px;
  width: 30px;
  height: 30px;
  flex-shrink: 0;
}
.space {
  width: 224px;
  flex-shrink: 0;
}
.sidebar-expanded {
  width: 240px;
}
.sidebar-collapsed {
  width: 64px;
}
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
