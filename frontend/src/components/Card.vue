<!-- src/components/Card.vue -->
<template>
  <el-card class="kanban-card">{{ card.title }}</el-card>
</template>

<script setup lang="ts">
const props = defineProps<{ card: { card_id: number; title: string } }>()
</script>

<style scoped>
.kanban-card {
  margin-bottom: 4px;
  cursor: pointer;
}
</style>
