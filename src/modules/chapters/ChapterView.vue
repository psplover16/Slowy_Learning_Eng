<template>
  <div>
    <p v-if="!chapterData && !notFound" class="max-w-3xl mx-auto px-4 py-6 text-ink-soft">載入中…</p>
    <p v-else-if="notFound" data-testid="chapter-not-found" class="max-w-3xl mx-auto px-4 py-6 text-ink-soft">找不到此章節</p>

    <template v-else-if="chapterData">
      <Mp3Player :mp3Src="chapterData.mp3Src ?? null" />

      <main class="max-w-3xl mx-auto px-4 pb-10">
        <header class="my-6 bg-paper-3 border border-line rounded-2xl p-6 shadow-sm">
          <p class="font-newsreader italic text-terracotta text-sm mb-1">{{ chapterData.headerPodcastLabel }}</p>
          <h1 class="font-fraunces font-semibold text-2xl leading-tight">{{ chapterData.headerTitleZh }}
            <span class="block font-newsreader italic text-base font-normal text-ink-soft mt-1">{{ chapterData.headerTitleEn }}</span>
          </h1>
          <div class="flex flex-wrap gap-2 mt-3">
            <span class="text-xs px-3 py-1 rounded-full bg-terracotta text-white">{{ chapterData.headerLevelTag }}</span>
            <span class="text-xs px-3 py-1 rounded-full bg-paper border border-line text-ink-soft">{{ chapterData.headerTopicTag }}</span>
          </div>
        </header>

        <SectionQuickNav ref="quickNavRef" :sections="quickNavSections" />

        <section :id="`${id}-section-bilingual`" class="mb-10">
          <div class="flex items-baseline gap-3 border-b-2 border-ink pb-2 mb-6">
            <span class="font-fraunces text-4xl font-semibold text-terracotta">1</span>
            <span class="font-fraunces text-xl font-semibold">中英對照全文
              <span class="block font-newsreader italic text-sm font-normal text-ink-faint">Bilingual Full Text</span>
            </span>
          </div>

          <div @click.capture="handleVocabClick">
            <SceneBlock
              v-for="scene in chapterData.scenes"
              :key="scene.id"
              :scene-id="scene.id"
              :scene-number="scene.no"
              :title-zh="scene.titleZh"
              :title-en="scene.titleEn"
              :chapter-id="id"
            >
              <div v-for="(sent, si) in scene.sentences" :key="si" class="mb-3 last:mb-0">
                <span class="block font-newsreader text-base text-ink leading-relaxed" v-html="sent.en" />
                <span class="block text-ink-soft text-sm leading-relaxed pl-3 border-l-2 border-line mt-1">↳ {{ sent.tc }}</span>
              </div>
              <div v-if="scene.tags.length" class="mt-4 pt-3 border-t border-dashed border-line flex flex-wrap gap-2">
                <WordTag v-for="tag in scene.tags" :key="tag.english" v-bind="tag" />
              </div>
            </SceneBlock>
          </div>
        </section>

        <section :id="`${id}-section-vocabulary`" class="mb-10">
          <div class="flex items-baseline gap-3 border-b-2 border-ink pb-2 mb-6">
            <span class="font-fraunces text-4xl font-semibold text-terracotta">2</span>
            <span class="font-fraunces text-xl font-semibold">重點單字
              <span class="block font-newsreader italic text-sm font-normal text-ink-faint">Key Vocabulary</span>
            </span>
          </div>

          <div v-for="group in chapterData.vocabGroups" :key="group.title" class="mb-6">
            <h3 class="font-fraunces text-base font-semibold text-sage-deep mb-3 flex items-center gap-2">
              <span class="w-2 h-2 rounded-sm bg-sage inline-block" />
              {{ group.title }}
            </h3>
            <div class="bg-paper-3 border border-line rounded-xl divide-y divide-line-soft">
              <WordTag v-for="v in group.items" :key="v.english" v-bind="v" class="px-3" />
            </div>
          </div>
        </section>

        <section :id="`${id}-section-phrases`" class="mb-10">
          <div class="flex items-baseline gap-3 border-b-2 border-ink pb-2 mb-6">
            <span class="font-fraunces text-4xl font-semibold text-terracotta">3</span>
            <span class="font-fraunces text-xl font-semibold">重點片語與慣用語
              <span class="block font-newsreader italic text-sm font-normal text-ink-faint">Key Phrases &amp; Idioms</span>
            </span>
          </div>

          <PhraseCard v-for="p in chapterData.phrases" :key="p.id" v-bind="p" />
        </section>

        <section :id="`${id}-section-breakdown`" class="mb-10">
          <div class="flex items-baseline gap-3 border-b-2 border-ink pb-2 mb-6">
            <span class="font-fraunces text-4xl font-semibold text-terracotta">4</span>
            <span class="font-fraunces text-xl font-semibold">句型解析
              <span class="block font-newsreader italic text-sm font-normal text-ink-faint">Sentence Breakdown</span>
            </span>
          </div>

          <SentenceBreakdown v-for="bd in chapterData.breakdowns" :key="bd.id || bd.sentence" v-bind="bd" />
        </section>
      </main>

      <BackToWordFab :source-scroll-y="sourceScrollY" @return-to-source="returnToSource" />
      <BackToTopFab :anchor-el="quickNavRootEl" :offset-bottom="sourceScrollY !== null ? 60 : 0" />
    </template>
  </div>
</template>

<script setup lang="ts">
import { onMounted, nextTick, ref, computed } from 'vue'
import Mp3Player from '../../shared/components/Mp3Player.vue'
import BackToWordFab from '../../shared/components/BackToWordFab.vue'
import BackToTopFab from '../../shared/components/BackToTopFab.vue'
import SectionQuickNav from '../../shared/components/SectionQuickNav.vue'
import SceneBlock from './components/SceneBlock.vue'
import WordTag from './components/WordTag.vue'
import PhraseCard from './components/PhraseCard.vue'
import SentenceBreakdown from './components/SentenceBreakdown.vue'
import { useReadingBookmark } from '../../shared/composables/useReadingBookmark'
import { useUnderlinkBacklink } from '../../shared/composables/useUnderlinkBacklink'
import { chapters } from '../../shared/config/chapters'
import type { ChapterData } from './types'

const props = defineProps<{ id: string }>()

const chapterData = ref<ChapterData | null>(null)
const notFound = ref(false)

const { getBookmark } = useReadingBookmark()
const { sourceScrollY, triggerScroll, returnToSource } = useUnderlinkBacklink()

const quickNavSections = computed(() => [
  { id: `${props.id}-section-bilingual`, label: '全文' },
  { id: `${props.id}-section-vocabulary`, label: '單字' },
  { id: `${props.id}-section-phrases`, label: '片語' },
  { id: `${props.id}-section-breakdown`, label: '句型' },
])

const quickNavRef = ref<{ rootEl: HTMLElement | null } | null>(null)
const quickNavRootEl = ref<HTMLElement | null>(null)

onMounted(async () => {
  const entry = chapters.find((c) => c.id === props.id)
  if (!entry) {
    notFound.value = true
    return
  }

  const module = await entry.dataLoader()
  chapterData.value = module.default

  await nextTick()
  quickNavRootEl.value = quickNavRef.value?.rootEl ?? null

  const bookmarkedId = getBookmark(props.id)
  if (bookmarkedId) {
    const el = document.getElementById(bookmarkedId)
    el?.scrollIntoView({ behavior: 'smooth' })
  }
})

function handleVocabClick(e: Event) {
  const target = e.target as HTMLElement
  const vocabId = target.getAttribute('data-target')
  if (vocabId) {
    e.preventDefault()
    triggerScroll(vocabId)
  }
}
</script>
