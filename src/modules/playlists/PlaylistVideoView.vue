<template>
  <main class="max-w-2xl mx-auto px-4 py-8">
    <!-- Not found -->
    <div v-if="!loading && !video" class="text-center py-16 text-ink-soft">
      找不到此影片
    </div>

    <!-- Pending transcript -->
    <div v-else-if="!loading && video?.status === 'pendingTranscript'" class="text-center py-16 text-ink-soft">
      內容整理中
    </div>

    <!-- Ready: full content -->
    <template v-else-if="!loading && video?.status === 'ready' && content">
      <h1 class="font-fraunces text-2xl font-bold text-ink mb-2">{{ content.title }}</h1>
      <a
        :href="content.youtubeUrl"
        target="_blank"
        rel="noopener noreferrer"
        class="text-sm text-ink-soft underline mb-8 block"
      >YouTube</a>

      <!-- Scenes -->
      <section v-if="content.scenes.length" class="mb-10">
        <h2 class="font-fraunces text-lg font-semibold text-ink mb-4">對話內容</h2>
        <div v-for="scene in content.scenes" :key="scene.id" class="mb-6">
          <div v-for="(sent, i) in scene.sentences" :key="i" class="mb-2">
            <p class="text-ink font-medium">{{ sent.en }}</p>
            <p class="text-ink-soft text-sm">{{ sent.tc }}</p>
          </div>
        </div>
      </section>

      <!-- VocabGroups -->
      <section v-if="content.vocabGroups.length" class="mb-10">
        <h2 class="font-fraunces text-lg font-semibold text-ink mb-4">單字</h2>
        <div v-for="group in content.vocabGroups" :key="group.label" class="mb-4">
          <h3 class="text-sm font-semibold text-ink-soft uppercase tracking-wide mb-2">{{ group.label }}</h3>
          <div class="flex flex-wrap gap-2">
            <span
              v-for="item in group.items"
              :key="item.word"
              :data-testid="item.highlight ? 'vocab-item-highlight' : 'vocab-item'"
              class="px-2 py-1 rounded text-sm"
              :class="item.highlight ? 'bg-accent text-paper font-semibold' : 'bg-paper-2 text-ink'"
            >
              {{ item.word }}
              <span class="text-xs opacity-70 ml-1">{{ item.pos }}</span>
              <span class="ml-1">{{ item.meaning }}</span>
            </span>
          </div>
        </div>
      </section>

      <!-- Phrases -->
      <section v-if="content.phrases.length" class="mb-10">
        <h2 class="font-fraunces text-lg font-semibold text-ink mb-4">片語</h2>
        <div v-for="phrase in content.phrases" :key="phrase.id" class="mb-6 p-4 bg-paper-2 rounded-lg">
          <p class="font-semibold text-ink mb-1">{{ phrase.phrase }}</p>
          <p class="text-sm text-ink-soft mb-3">{{ phrase.meaning }}</p>
          <div v-for="(ex, i) in phrase.examples" :key="i" class="mb-1">
            <p class="text-ink text-sm">{{ ex.en }}</p>
            <p class="text-ink-soft text-xs">{{ ex.tc }}</p>
          </div>
        </div>
      </section>
    </template>

    <!-- Loading -->
    <div v-else-if="loading" class="text-center py-16 text-ink-soft">載入中...</div>
  </main>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import type { PlaylistData, PlaylistVideoEntry, PlaylistVideoData } from './types'

const props = defineProps<{ level: string; videoSlug: string }>()

const loading = ref(true)
const video = ref<PlaylistVideoEntry | null>(null)
const content = ref<PlaylistVideoData | null>(null)

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
    if (!loader) {
      loading.value = false
      return
    }

    const mod = await loader()
    const playlistData = mod.default
    const found = playlistData.videos.find(v => v.slug === props.videoSlug) ?? null
    video.value = found

    if (found?.status === 'ready' && found.contentLoader) {
      const contentMod = await found.contentLoader()
      content.value = contentMod.default
    }
  } catch {
    // leave video null → shows not-found
  } finally {
    loading.value = false
  }
})
</script>
