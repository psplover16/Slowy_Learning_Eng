<template>
  <div>
    <main class="max-w-3xl mx-auto px-4 pb-10">
      <div v-if="!loading && !video" class="text-center py-16 text-ink-soft">
        找不到此影片
      </div>

      <div v-else-if="!loading && video?.status === 'pendingTranscript'" class="text-center py-16 text-ink-soft">
        內容整理中
      </div>

      <template v-else-if="!loading && video?.status === 'ready' && content">
        <PlaylistReadingHeader :header="header" :youtube-url="content.youtubeUrl" />

        <SectionQuickNav :chapter-id="baseId" :sections="quickNavSections" />

        <section v-if="content.scenes.length" :id="`${baseId}-section-bilingual`" class="mb-10">
          <div class="flex items-baseline gap-3 border-b-2 border-ink pb-2 mb-6">
            <span class="font-fraunces text-4xl font-semibold text-terracotta">{{ sectionNums.bilingual }}</span>
            <span class="font-fraunces text-xl font-semibold">中英對照全文
              <span class="block font-newsreader italic text-sm font-normal text-ink-faint">Bilingual Full Text</span>
            </span>
          </div>

          <PlaylistSceneBlock
            v-for="(scene, sceneIndex) in content.scenes"
            :key="scene.id"
            :scene-id="scene.id"
            :scene-number="scene.no || String(sceneIndex + 1).padStart(2, '0')"
            :title-zh="scene.titleZh || `對話段落 ${sceneIndex + 1}`"
            :title-en="scene.titleEn || `Scene ${sceneIndex + 1}`"
          >
            <div v-for="(sent, si) in scene.sentences" :key="si" class="mb-3 last:mb-0">
              <span class="block font-newsreader text-base text-ink leading-relaxed">{{ sent.en }}</span>
              <span class="block text-ink-soft text-sm leading-relaxed pl-3 border-l-2 border-line mt-1">↳ {{ sent.tc }}</span>
            </div>
            <div v-if="scene.tags.length" class="mt-4 pt-3 border-t border-dashed border-line">
              <PlaylistWordTag
                v-for="tag in scene.tags"
                :key="tag.english"
                v-bind="tag"
              />
            </div>
          </PlaylistSceneBlock>
        </section>

        <section v-if="content.vocabGroups.length" :id="`${baseId}-section-vocabulary`" class="mb-10">
          <div class="flex items-baseline gap-3 border-b-2 border-ink pb-2 mb-6">
            <span class="font-fraunces text-4xl font-semibold text-terracotta">{{ sectionNums.vocabulary }}</span>
            <span class="font-fraunces text-xl font-semibold">重點單字
              <span class="block font-newsreader italic text-sm font-normal text-ink-faint">Key Vocabulary</span>
            </span>
          </div>

          <div v-for="group in content.vocabGroups" :key="group.title" class="mb-6">
            <h3 class="font-fraunces text-base font-semibold text-sage-deep mb-3 flex items-center gap-2">
              <span class="w-2 h-2 rounded-sm bg-sage inline-block" />
              {{ group.title }}
            </h3>
            <div class="bg-paper-3 border border-line rounded-xl divide-y divide-line-soft">
              <PlaylistWordTag
                v-for="item in group.items"
                :key="item.english"
                v-bind="item"
                class="px-3"
              />
            </div>
          </div>
        </section>

        <section v-if="content.phrases.length" :id="`${baseId}-section-phrases`" class="mb-10">
          <div class="flex items-baseline gap-3 border-b-2 border-ink pb-2 mb-6">
            <span class="font-fraunces text-4xl font-semibold text-terracotta">{{ sectionNums.phrases }}</span>
            <span class="font-fraunces text-xl font-semibold">重點片語與慣用語
              <span class="block font-newsreader italic text-sm font-normal text-ink-faint">Key Phrases &amp; Idioms</span>
            </span>
          </div>

          <PlaylistPhraseCard
            v-for="phrase in content.phrases"
            :key="phrase.id"
            v-bind="phrase"
          />
        </section>

        <section v-if="content.breakdowns.length" :id="`${baseId}-section-breakdown`" class="mb-10">
          <div class="flex items-baseline gap-3 border-b-2 border-ink pb-2 mb-6">
            <span class="font-fraunces text-4xl font-semibold text-terracotta">{{ sectionNums.breakdown }}</span>
            <span class="font-fraunces text-xl font-semibold">句型解析
              <span class="block font-newsreader italic text-sm font-normal text-ink-faint">Sentence Breakdown</span>
            </span>
          </div>

          <PlaylistSentenceBreakdown
            v-for="breakdown in content.breakdowns"
            :key="breakdown.id"
            v-bind="breakdown"
          />
        </section>
      </template>

      <div v-else-if="loading" class="text-center py-16 text-ink-soft">載入中...</div>
    </main>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'
import SectionQuickNav from '../../shared/components/SectionQuickNav.vue'
import PlaylistReadingHeader from './components/PlaylistReadingHeader.vue'
import PlaylistSceneBlock from './components/PlaylistSceneBlock.vue'
import PlaylistWordTag from './components/PlaylistWordTag.vue'
import PlaylistPhraseCard from './components/PlaylistPhraseCard.vue'
import PlaylistSentenceBreakdown from './components/PlaylistSentenceBreakdown.vue'
import type { PlaylistData, PlaylistVideoData, PlaylistVideoEntry, PlaylistVideoHeader } from './types'
import { buildPlaylistReadingSections, buildPlaylistSectionNums } from './composables/usePlaylistReadingSections'

const props = defineProps<{ level: string; videoSlug: string }>()

const loading = ref(true)
const video = ref<PlaylistVideoEntry | null>(null)
const content = ref<PlaylistVideoData | null>(null)

const baseId = computed(() => `${props.level}-${props.videoSlug}`)
const quickNavSections = computed(() => buildPlaylistReadingSections(content.value, baseId.value))
const sectionNums = computed(() => buildPlaylistSectionNums(quickNavSections.value))
const header = computed<PlaylistVideoHeader>(() => {
  const metadataTitleZh = video.value?.titleZh
  if (content.value?.header) {
    const rawHeader = content.value.header
    return {
      ...rawHeader,
      titleZh: chooseTitleZh(rawHeader.titleZh, metadataTitleZh, rawHeader.titleEn || content.value.title || video.value?.title),
      titleEn: rawHeader.titleEn || content.value.title || video.value?.title || 'MissHoney',
    }
  }
  return {
    podcastLabel: `MissHoney ${props.level.toUpperCase()}`,
    titleZh: chooseTitleZh(content.value?.title, metadataTitleZh, video.value?.title),
    titleEn: content.value?.title ?? video.value?.title ?? 'MissHoney',
    levelTag: props.level.toUpperCase(),
  }
})

onMounted(() => loadVideo())
watch(() => [props.level, props.videoSlug], () => loadVideo())

async function loadVideo() {
  loading.value = true
  video.value = null
  content.value = null

  try {
    const level = props.level as 'a1' | 'a2' | 'b1' | 'b2'
    const modules: Record<string, () => Promise<{ default: PlaylistData }>> = {
      a1: () => import('./data/a1'),
      a2: () => import('./data/a2'),
      b1: () => import('./data/b1'),
      b2: () => import('./data/b2'),
    }
    const loader = modules[level]
    if (!loader) return

    const mod = await loader()
    const playlistData = mod.default
    const found = playlistData.videos.find(v => v.slug === props.videoSlug) ?? null
    video.value = found

    if (found?.status === 'ready' && found.contentLoader) {
      const contentMod = await found.contentLoader()
      content.value = normalizePlaylistContent(contentMod.default, level)
    }
  } catch {
    video.value = null
    content.value = null
  } finally {
    loading.value = false
  }
}

function normalizePlaylistContent(raw: PlaylistVideoData, level: 'a1' | 'a2' | 'b1' | 'b2'): PlaylistVideoData {
  const loose = raw as unknown as Record<string, any>
  return {
    videoId: String(loose.videoId ?? ''),
    slug: String(loose.slug ?? ''),
    level,
    title: String(loose.title ?? ''),
    youtubeUrl: String(loose.youtubeUrl ?? ''),
    header: loose.header ?? {
      podcastLabel: `MissHoney ${level.toUpperCase()}`,
      titleZh: String(loose.title ?? ''),
      titleEn: String(loose.title ?? ''),
      levelTag: level.toUpperCase(),
    },
    scenes: Array.isArray(loose.scenes)
      ? loose.scenes.map((scene: Record<string, any>, index: number) => ({
          id: String(scene.id ?? `scene-${String(index + 1).padStart(2, '0')}`),
          no: String(scene.no ?? String(index + 1).padStart(2, '0')),
          titleZh: String(scene.titleZh ?? `對話段落 ${index + 1}`),
          titleEn: String(scene.titleEn ?? `Scene ${index + 1}`),
          sentences: Array.isArray(scene.sentences) ? scene.sentences : [],
          tags: normalizeVocabItems(scene.tags),
        }))
      : [],
    vocabGroups: Array.isArray(loose.vocabGroups)
      ? loose.vocabGroups.map((group: Record<string, any>) => ({
          title: String(group.title ?? group.label ?? 'Key Vocabulary'),
          items: normalizeVocabItems(group.items),
        }))
      : [],
    phrases: Array.isArray(loose.phrases) ? loose.phrases : [],
    breakdowns: Array.isArray(loose.breakdowns) ? loose.breakdowns : [],
  }
}

function normalizeVocabItems(items: unknown) {
  if (!Array.isArray(items)) return []
  return items.map((item: Record<string, any>) => ({
    english: String(item.english ?? item.word ?? ''),
    kk: String(item.kk ?? ''),
    partOfSpeech: String(item.partOfSpeech ?? item.pos ?? ''),
    meaning: String(item.meaning ?? ''),
    note: item.note ? String(item.note) : undefined,
    highlight: item.highlight === true,
  }))
}

function chooseTitleZh(candidate: unknown, metadataTitleZh: unknown, titleEn: unknown): string {
  const current = String(candidate ?? '').trim()
  const metadata = String(metadataTitleZh ?? '').trim()
  const english = String(titleEn ?? '').trim()

  if (metadata && (!current || current === english || !containsCjk(current))) return metadata
  return current || metadata || english || 'MissHoney'
}

function containsCjk(value: string): boolean {
  return /[\u3400-\u9fff]/.test(value)
}
</script>
