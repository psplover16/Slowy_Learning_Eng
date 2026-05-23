<template>
  <div
    :id="id"
    class="bg-paper-3 border border-line border-l-4 border-l-ochre rounded-xl p-4 mb-3"
    :class="active ? 'playlist-learning-item--active' : ''"
  >
    <div class="flex items-start gap-3">
      <div class="font-newsreader font-medium text-lg text-ochre-deep flex-1">{{ phrase }}</div>
      <button
        v-if="returnTestId"
        type="button"
        class="shrink-0 text-xs font-medium text-ochre-deep border border-ochre/50 rounded-md px-2 py-1 hover:bg-ochre/10"
        :data-testid="returnTestId"
        @click="$emit('return-to-marker')"
      >
        回原文
      </button>
    </div>
    <div class="font-medium text-ink my-1 before:content-['→_'] before:text-ochre">{{ meaning }}</div>
    <div v-for="(example, index) in examples" :key="index" class="mt-2 bg-paper-2 rounded-lg px-3 py-2 text-sm">
      <div class="font-newsreader italic text-ink">{{ example.en }}</div>
      <div class="text-ink-faint text-xs mt-0.5">{{ example.tc }}</div>
    </div>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  id?: string
  phrase: string
  meaning: string
  examples: Array<{ en: string; tc: string }>
  active?: boolean
  returnTestId?: string
}>()

defineEmits<{
  (e: 'return-to-marker'): void
}>()
</script>
