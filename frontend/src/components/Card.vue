<template>
  <div class="card kanban-card mb-2">
    <div class="card-body p-2 d-flex flex-column" style="min-height: 100px">
      <!-- Title and Priority at the top -->
      <div class="d-flex justify-content-between align-items-start">
        <h6 class="card-title p-2">{{ card.title }}</h6>
      </div>

      <!-- Author and Priority on first row, Date at bottom -->
      <div class="mt-auto text-muted fs-7">
        <div class="d-flex align-items-center justify-content-between">
          <div class="d-flex justify-content-between align-items-center">
            <div class="avatar">
              {{ card.author }}
            </div>
          </div>
          <div class="d-flex gap align-items-end">
            <div class="me-2 date">{{ formattedDate }}</div>
            <span v-if="card.priority" :class="['badge', 'bg-' + priorityVariant]">
              {{ card.priority }}
            </span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

interface Card {
  card_id: number
  title: string
  author?: string
  date?: string
  priority?: 'Low' | 'Medium' | 'High' | string
}

const props = defineProps<{ card: Card }>()

const formattedDate = computed(() => {
  if (!props.card.date) return ''
  const d = new Date(props.card.date)
  return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })
})

const priorityVariant = computed(() => {
  switch (props.card.priority) {
    case 'High':
      return 'danger'
    case 'Medium':
      return 'warning'
    case 'Low':
      return 'secondary'
    default:
      return 'primary'
  }
})
</script>

<style scoped>
.avatar {
  width: 24px;
  height: 24px;
  border-radius: 50%;
  background-color: #e7e7e7;
}

.date {
  font-size: 14px;
  margin-bottom: 1px;
}
.kanban-card {
  cursor: grab;
  transition: box-shadow 0.1s;
}
.kanban-card:hover {
  box-shadow: 0 2px #cacad2;
}
.card-title {
  font-size: 1rem;
  font-weight: 500;
}
.badge {
  font-size: 0.75rem;
}
</style>
