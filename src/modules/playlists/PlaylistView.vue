<template>
  <main class="max-w-3xl mx-auto px-4 py-6">
    <h1 class="font-fraunces text-2xl font-bold text-ink mb-6">{{ playlistData?.title }}</h1>
    <div data-testid="playlist-video-list" class="space-y-3">
      <div class="space-y-3">
        <ArticleListItem
          v-for="video in incompleteVideos"
          :key="video.videoId"
          :to="`/${level}/${video.slug}`"
          :title="videoTitle(video)"
          :subtitle="videoSubtitle(video)"
          :completed="isCompleted(video.videoId)"
          data-testid="playlist-video-card"
          @toggle-completion="toggleCompletion(video.videoId)"
        />
      </div>
      <div v-if="completedVideos.length > 0" class="space-y-3 pt-2">
        <ArticleListItem
          v-for="video in completedVideos"
          :key="video.videoId"
          :to="`/${level}/${video.slug}`"
          :title="videoTitle(video)"
          :subtitle="videoSubtitle(video)"
          :completed="isCompleted(video.videoId)"
          data-testid="playlist-video-card"
          @toggle-completion="toggleCompletion(video.videoId)"
        />
      </div>
    </div>
  </main>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import type { PlaylistData, PlaylistVideoEntry } from './types'
import ArticleListItem from '../home/components/ArticleListItem.vue'
import { useMissHoneyCompletion } from '../home/composables/useMissHoneyCompletion'

const props = defineProps<{ level: string }>()

const playlistData = ref<PlaylistData | null>(null)

const { isCompleted, toggleCompletion } = useMissHoneyCompletion()

const sortedVideos = computed<PlaylistVideoEntry[]>(() => {
  if (!playlistData.value) return []
  return [...playlistData.value.videos].sort((a, b) => a.displayOrder - b.displayOrder)
})

const incompleteVideos = computed<PlaylistVideoEntry[]>(() => {
  return sortedVideos.value.filter(video => !isCompleted(video.videoId))
})

const completedVideos = computed<PlaylistVideoEntry[]>(() => {
  return sortedVideos.value.filter(video => isCompleted(video.videoId))
})

function videoSubtitle(video: PlaylistVideoEntry): string | undefined {
  const parts: string[] = []
  if (video.titleZh) parts.push(video.title)
  if (video.subtitle) parts.push(video.subtitle)
  if (video.status === 'pendingTranscript') parts.push('內容整理中')
  return parts.length > 0 ? parts.join(' · ') : undefined
}

function videoTitle(video: PlaylistVideoEntry): string {
  return video.titleZh || video.title
}

async function loadPlaylist(level: string): Promise<void> {
  try {
    const playlistLevel = level as 'a1' | 'a2' | 'b1' | 'b2'
    const modules: Record<string, () => Promise<{ default: PlaylistData }>> = {
      a1: () => import('./data/a1'),
      a2: () => import('./data/a2'),
      b1: () => import('./data/b1'),
      b2: () => import('./data/b2'),
    }
    const loader = modules[playlistLevel]
    if (loader) {
      const mod = await loader()
      if (props.level === level) {
        playlistData.value = mod.default
      }
    } else if (props.level === level) {
      playlistData.value = null
    }
  } catch {
    if (props.level === level) {
      playlistData.value = null
    }
  }
}

watch(() => props.level, loadPlaylist, { immediate: true })
</script>
