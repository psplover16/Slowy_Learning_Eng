<template>
  <section :id="sceneId" :data-testid="sceneId" class="mb-10">
    <h2
      class="font-fraunces text-lg font-semibold text-terracotta mb-3 cursor-pointer hover:underline decoration-terracotta underline-offset-4"
      @click="handleBookmark"
    >
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
import { useReadingBookmark } from '../../../shared/composables/useReadingBookmark'

const props = defineProps<{
  sceneId: string
  sceneNumber: string
  titleZh: string
  titleEn: string
  chapterId: string
}>()

const { setBookmark } = useReadingBookmark()

function handleBookmark() {
  setBookmark(props.chapterId, props.sceneId)
}
</script>
