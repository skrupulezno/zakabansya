<template>
  <div class="card kanban-card mb-2">
    <div class="card-body p-2">
      <div class="d-flex justify-content-between align-items-start">
        <h6 class="card-title mb-1">{{ card.title }}</h6>
        <span v-if="card.priority" class="badge bg-{{ priorityVariant }}">{{ card.priority }}</span>
      </div>
      <div class="d-flex justify-content-between text-muted fs-7">
        <div>
          <i class="fas fa-user-circle me-1"></i>
          {{ card.author }}
        </div>
        <div>
          <i class="fas fa-calendar-alt me-1"></i>
          {{ formattedDate }}
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
  return d.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })
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
.kanban-card {
  cursor: grab;
  transition: box-shadow 0.1s;
}
.kanban-card:hover {
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.1);
}
.card-title {
  font-size: 1rem;
  font-weight: 500;
}
.badge {
  font-size: 0.75rem;
}
</style>
