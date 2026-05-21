<template>
  <div
    ref="rootEl"
    data-testid="ch1-quick-nav"
    class="flex flex-nowrap gap-2 overflow-x-auto py-3"
  >
    <button
      v-for="section in sections"
      :key="section.id"
      :data-testid="`quick-nav-${section.id}`"
      class="shrink-0 px-3 py-1.5 rounded text-sm font-medium bg-paper-2 border border-line text-ink hover:bg-line transition-colors"
      @click="scrollToSection(section.id)"
    >{{ section.label }}</button>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

interface QuickNavSection {
  id: string
  label: string
}

defineProps<{
  sections: QuickNavSection[]
}>()

const rootEl = ref<HTMLElement | null>(null)

function scrollToSection(id: string) {
  document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' })
}

defineExpose({ rootEl })
</script>
