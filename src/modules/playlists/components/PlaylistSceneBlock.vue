<template>
  <section :id="sceneId" :data-testid="sceneId" class="mb-10">
    <h2 class="font-fraunces text-lg font-semibold text-terracotta mb-3">
      <span class="text-sm text-ink-faint mr-2">{{ sceneNumber }}</span>
      {{ titleZh }}
      <span class="block text-sm font-normal text-ink-soft font-newsreader mt-0.5">{{ titleEn }}</span>
    </h2>
    <div class="space-y-2">
      <slot />
    </div>
  </section>
</template>

<script setup lang="ts">
defineProps<{
  sceneId: string
  sceneNumber: string
  titleZh: string
  titleEn: string
}>()
</script>
