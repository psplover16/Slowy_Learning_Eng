<template>
  <div
    class="flex items-center gap-3 p-4 bg-paper-2 rounded-lg border border-line cursor-pointer hover:border-line-soft transition-colors"
    @click="emit('navigate')"
  >
    <div class="flex-1 min-w-0">
      <p class="font-fraunces text-ink font-semibold leading-snug">{{ title }}</p>
      <p v-if="subtitle" class="text-sm text-ink-soft mt-0.5">{{ subtitle }}</p>
    </div>
    <button
      class="shrink-0 text-terracotta hover:text-terracotta-deep transition-colors p-1"
      :aria-label="completed ? '標記為未完成' : '標記為完成'"
      data-testid="completion-toggle"
      @click.stop="emit('toggle-completion')"
    >
      <svg v-if="completed" xmlns="http://www.w3.org/2000/svg" class="w-6 h-6" viewBox="0 0 24 24" fill="currentColor">
        <circle cx="12" cy="12" r="10" />
      </svg>
      <svg v-else xmlns="http://www.w3.org/2000/svg" class="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <circle cx="12" cy="12" r="10" />
      </svg>
    </button>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  title: string
  subtitle?: string
  completed: boolean
}>()

const emit = defineEmits<{
  navigate: []
  'toggle-completion': []
}>()
</script>
