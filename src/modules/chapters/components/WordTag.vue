<template>
  <div :id="id" data-testid="word-tag" class="flex items-start gap-3 py-2 border-b border-line-soft last:border-0">
    <div class="min-w-0 flex-1">
      <span class="font-newsreader font-medium text-terracotta-deep">{{ english }}</span>
      <span v-if="kk" class="ml-2 text-xs text-ink-faint font-newsreader italic">{{ kk }}</span>
      <span class="ml-2 text-xs italic text-ink-faint font-newsreader">{{ pos }}</span>
      <span class="ml-1 text-ink-soft text-sm">{{ meaning }}</span>
    </div>
    <div v-if="example" class="text-xs text-ink-faint font-newsreader italic shrink-0 max-w-[45%] text-right">
      {{ example }}
    </div>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  id?: string
  english: string
  kk?: string
  pos: string
  meaning: string
  example?: string
}>()
</script>
