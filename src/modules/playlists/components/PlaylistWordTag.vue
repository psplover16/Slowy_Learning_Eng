<template>
  <div
    :id="id"
    :data-testid="highlight ? 'vocab-item-highlight' : 'vocab-item'"
    class="flex items-start gap-3 py-2 border-b border-line-soft last:border-0"
    :class="highlight ? 'bg-paper-2 px-3 rounded-lg border border-line' : ''"
  >
    <div class="min-w-0 flex-1">
      <span class="font-newsreader font-medium text-terracotta-deep">{{ english }}</span>
      <span v-if="kk" class="ml-2 text-xs text-ink-faint font-newsreader italic">{{ kk }}</span>
      <span class="ml-2 text-xs italic text-ink-faint font-newsreader">{{ partOfSpeech }}</span>
      <span class="ml-1 text-ink-soft text-sm">{{ meaning }}</span>
      <span v-if="note" class="block text-xs text-ink-faint mt-0.5">{{ note }}</span>
    </div>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  id?: string
  english: string
  kk?: string
  partOfSpeech: string
  meaning: string
  note?: string
  highlight?: boolean
}>()
</script>
