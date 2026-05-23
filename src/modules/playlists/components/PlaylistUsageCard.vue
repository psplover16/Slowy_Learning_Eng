<template>
  <div
    :id="id"
    data-testid="special-usage-item"
    class="bg-paper-3 border border-line border-l-4 border-l-sage rounded-xl p-4 mb-3"
    :class="active ? 'playlist-learning-item--active' : ''"
  >
    <div class="flex items-start gap-3">
      <div class="min-w-0 flex-1">
        <div class="font-newsreader font-medium text-lg text-sage-deep">{{ word }}</div>
        <div class="text-xs text-ink-faint mt-0.5">熟悉意思：{{ familiarMeaning }}</div>
      </div>
      <button
        v-if="returnTestId"
        type="button"
        class="shrink-0 text-xs font-medium text-sage-deep border border-sage/50 rounded-md px-2 py-1 hover:bg-sage/10"
        :data-testid="returnTestId"
        @click="$emit('return-to-marker')"
      >
        回原文
      </button>
    </div>

    <div class="font-medium text-ink my-2 before:content-['→_'] before:text-sage-deep">{{ usage }}</div>
    <div class="text-sm text-ink-soft">{{ translation }}</div>
    <div
      v-for="(example, index) in normalizedExamples"
      :key="index"
      class="mt-2 bg-paper-2 rounded-lg px-3 py-2 text-sm"
    >
      <div class="font-newsreader italic text-ink">{{ example.en }}</div>
      <div v-if="example.tc" class="text-ink-faint text-xs mt-0.5">{{ example.tc }}</div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps<{
  id: string
  word: string
  familiarMeaning: string
  usage: string
  translation: string
  examples: Array<string | { en: string; tc: string }>
  active?: boolean
  returnTestId?: string
}>()

defineEmits<{
  (e: 'return-to-marker'): void
}>()

const normalizedExamples = computed(() => props.examples.map((example) => {
  if (typeof example === 'string') return { en: example, tc: '' }
  return example
}))
</script>
