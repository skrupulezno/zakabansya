<template>
  <div class="d-flex vh-100">
    <!-- Sidebar -->
    <nav
      :class="[
        'bg-light border-end p-3 d-flex flex-column',
        isCollapsed ? 'sidebar-collapsed' : 'sidebar-expanded',
      ]"
    >
      <div class="d-flex align-items-center mb-4 position-relative">
        <img :src="avatarUrl" alt="Avatar" class="rounded-circle" width="32" height="32" />
        <transition name="fade">
          <span v-if="!isCollapsed" class="ms-2 fw-medium">{{ workspaceName }}</span>
        </transition>
        <button
          class="btn btn-sm btn-outline-secondary position-absolute top-0 end-0"
          @click="toggleCollapse"
        >
          <font-awesome-icon :icon="isCollapsed ? 'chevron-right' : 'bars'" />
        </button>
      </div>

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
            <span v-if="!isCollapsed">Все проекты</span>
          </a>
        </li>
        <li>
          <a
            href="#"
            class="nav-link text-dark d-flex align-items-center"
            @click.prevent="toggleSubmenu = !toggleSubmenu"
          >
            <font-awesome-icon icon="folder" class="me-2" />
            <span v-if="!isCollapsed">Проекты</span>
            <font-awesome-icon
              :icon="toggleSubmenu ? 'chevron-up' : 'chevron-down'"
              class="ms-auto"
            />
          </a>
          <ul v-if="toggleSubmenu" class="nav flex-column ms-4 mt-1">
            <li>
              <a href="#" class="nav-link text-dark d-flex align-items-center">
                <font-awesome-icon icon="file" class="me-2" />
                <span v-if="!isCollapsed">Проект</span>
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

    <!-- Main Area -->
    <div class="flex-grow-1 d-flex flex-column">
      <!-- Header -->
      <header
        class="d-flex justify-content-between align-items-center px-3 bg-white border-bottom"
        style="height: 56px"
      >
        <div class="d-flex align-items-center">
          <button class="btn btn-outline-secondary me-2" @click="toggleCollapse">
            <font-awesome-icon icon="bars" />
          </button>
          <button class="btn btn-outline-secondary me-2">
            <font-awesome-icon icon="th" />
          </button>
          <button class="btn btn-primary">
            <font-awesome-icon icon="tasks" class="me-1" /> Задачи
          </button>
        </div>
        <div class="d-flex align-items-center">
          <button class="btn btn-link me-2">
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
          <img :src="userAvatar" alt="Avatar" class="rounded-circle" width="32" height="32" />
        </div>
      </header>

      <!-- Content -->
      <main class="flex-grow-1 bg-light overflow-auto">
        <slot />
      </main>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'

const isCollapsed = ref(false)
const toggleSubmenu = ref(false)
const workspaceName = 'байтбригада'
const avatarUrl = '' // URL аватара
const userAvatar = ''
const search = ref('')

function toggleCollapse() {
  isCollapsed.value = !isCollapsed.value
}
</script>

<style scoped>
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
