<template>
  <div data-testid="grammar-card" class="bg-paper-3 border border-line rounded-xl p-5 mb-4 shadow-sm">
    <h3 class="font-fraunces text-lg text-teal-eng-deep mb-3">
      <span class="font-newsreader italic text-xs text-white bg-teal-eng rounded px-2 py-0.5 mr-2 align-middle">{{ badge }}</span>
      {{ title }}
    </h3>
    <slot />
  </div>
</template>

<script setup lang="ts">
defineProps<{
  badge: string
  title: string
}>()
</script>
