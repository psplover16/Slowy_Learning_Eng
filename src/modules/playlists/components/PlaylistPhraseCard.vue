<template>
  <div :id="id" class="bg-paper-3 border border-line border-l-4 border-l-ochre rounded-xl p-4 mb-3">
    <div class="font-newsreader font-medium text-lg text-ochre-deep">{{ phrase }}</div>
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
}>()
</script>
