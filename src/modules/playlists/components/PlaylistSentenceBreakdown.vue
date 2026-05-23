<template>
  <div :id="id" data-testid="sentence-breakdown" class="bg-paper-3 border border-line rounded-xl p-5 mb-4 shadow-sm">
    <div class="font-newsreader text-base text-ink border-l-4 border-terracotta pl-3 mb-2 leading-relaxed">{{ sentence }}</div>
    <div class="text-ink-soft text-sm mb-3">{{ translation }}</div>
    <div
      v-for="(point, index) in points"
      :key="index"
      class="flex gap-3 py-2 border-t border-dashed border-line"
    >
      <span class="font-newsreader font-medium text-terracotta-deep shrink-0 w-2/5">{{ point.label }}</span>
      <span class="text-ink-soft text-sm">
        <span class="text-ink">{{ point.text }}</span>
        <span class="block">{{ point.note }}</span>
      </span>
    </div>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  id?: string
  sentence: string
  translation: string
  points: Array<{ label: string; text: string; note: string }>
}>()
</script>
