<template>
  <header data-testid="playlist-reading-header" class="my-6 bg-paper-3 border border-line rounded-2xl p-6 shadow-sm">
    <p class="font-newsreader italic text-terracotta text-sm mb-1">{{ header.podcastLabel }}</p>
    <h1 class="font-fraunces font-semibold text-2xl leading-tight">
      {{ header.titleZh }}
      <span class="block font-newsreader italic text-base font-normal text-ink-soft mt-1">{{ header.titleEn }}</span>
    </h1>
    <div class="flex flex-wrap gap-2 mt-3">
      <span class="text-xs px-3 py-1 rounded-full bg-terracotta text-white">{{ header.levelTag }}</span>
      <span v-if="header.topicTag" class="text-xs px-3 py-1 rounded-full bg-paper border border-line text-ink-soft">
        {{ header.topicTag }}
      </span>
    </div>
    <a
      :href="youtubeUrl"
      target="_blank"
      rel="noopener noreferrer"
      class="inline-block mt-3 text-xs text-ink-faint hover:text-terracotta transition-colors"
    >▶ YouTube 原聲影片</a>
  </header>
</template>

<script setup lang="ts">
import type { PlaylistVideoHeader } from '../types'

defineProps<{
  header: PlaylistVideoHeader
  youtubeUrl: string
}>()
</script>
