<template>
  <main class="max-w-2xl mx-auto px-4 py-8">
    <h1 class="font-fraunces text-2xl font-bold text-ink mb-6">{{ playlistData?.title }}</h1>
    <div class="flex flex-col gap-3">
      <RouterLink
        v-for="video in sortedVideos"
        :key="video.videoId"
        :to="`/${level}/${video.slug}`"
        data-testid="playlist-video-card"
        class="flex items-center gap-3 p-4 bg-paper-2 rounded-lg hover:bg-paper-3 transition-colors"
      >
        <div class="flex-1 min-w-0">
          <p class="font-fraunces text-ink font-semibold leading-snug">{{ video.title }}</p>
          <p v-if="video.subtitle" class="text-sm text-ink-soft mt-0.5">{{ video.subtitle }}</p>
          <p v-if="video.status === 'pendingTranscript'" class="text-sm text-ink-soft mt-0.5">
            內容整理中
          </p>
        </div>
        <button
          data-testid="completion-toggle"
          class="shrink-0 w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors"
          :class="isCompleted(video.videoId) ? 'border-ink bg-ink' : 'border-ink-soft'"
          @click.prevent.stop="toggleCompletion(video.videoId)"
          aria-label="標記完成"
        >
          <svg
            v-if="isCompleted(video.videoId)"
            class="w-3 h-3 text-paper"
            viewBox="0 0 12 12"
            fill="currentColor"
          >
            <path d="M10 3L5 8.5 2 5.5" stroke="currentColor" stroke-width="1.5" fill="none" stroke-linecap="round" stroke-linejoin="round" />
          </svg>
        </button>
      </RouterLink>
    </div>
  </main>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { RouterLink } from 'vue-router'
import type { PlaylistData, PlaylistVideoEntry } from './types'
import { useMissHoneyCompletion } from '../home/composables/useMissHoneyCompletion'

const props = defineProps<{ level: string }>()

const playlistData = ref<PlaylistData | null>(null)

const { isCompleted, toggleCompletion } = useMissHoneyCompletion()

const sortedVideos = computed<PlaylistVideoEntry[]>(() => {
  if (!playlistData.value) return []
  return [...playlistData.value.videos].sort((a, b) => a.displayOrder - b.displayOrder)
})

onMounted(async () => {
  try {
    const level = props.level as 'a1' | 'a2' | 'b1' | 'b2'
    const modules: Record<string, () => Promise<{ default: PlaylistData }>> = {
      a1: () => import('./data/a1'),
      a2: () => import('./data/a2'),
      b1: () => import('./data/b1'),
      b2: () => import('./data/b2'),
    }
    const loader = modules[level]
    if (loader) {
      const mod = await loader()
      playlistData.value = mod.default
    }
  } catch {
    // level not found — leave playlistData null
  }
})
</script>
