import { describe, it, expect, beforeEach, vi } from 'vitest'
import { mount, flushPromises } from '@vue/test-utils'
import { createRouter, createMemoryHistory } from 'vue-router'
import { nextTick } from 'vue'
import ChapterView from '../modules/chapters/ChapterView.vue'
import type { ChapterData } from '../modules/chapters/types'

// ---------------------------------------------------------------------------
// Mock chapters config so these tests don't depend on real chapter data files
// ---------------------------------------------------------------------------
const noScenesData: ChapterData = {
  headerTitleZh: '測試無全文',
  headerTitleEn: 'Test No Scenes',
  headerPodcastLabel: 'Test Podcast',
  headerLevelTag: '',
  headerTopicTag: '',
  mp3Src: null,
  scenes: [],
  vocabGroups: [
    {
      title: '單字組',
      items: [{ english: 'test', pos: 'n.', meaning: '測試' }],
    },
  ],
  phrases: [
    { id: 'ph1', phrase: 'test phrase', meaning: '測試片語', note: '', example: '', exampleTc: '' },
  ],
  breakdowns: [
    { id: 'bd1', sentence: 'Test.', translation: '測試。', chunks: [] },
  ],
}

const fullChapterData: ChapterData = {
  headerTitleZh: '完整章節',
  headerTitleEn: 'Full Chapter',
  headerPodcastLabel: 'Full Podcast',
  headerLevelTag: '程度 B1',
  headerTopicTag: '主題：測試',
  mp3Src: null,
  scenes: [
    {
      id: 'scene-01',
      no: '01',
      titleZh: '場景一',
      titleEn: 'Scene One',
      sentences: [{ en: 'Hello.', tc: '你好。' }],
      tags: [],
    },
  ],
  vocabGroups: [
    {
      title: '單字組',
      items: [{ english: 'hello', pos: 'interj.', meaning: '你好' }],
    },
  ],
  phrases: [
    { id: 'ph1', phrase: 'full phrase', meaning: '完整片語', note: '', example: '', exampleTc: '' },
  ],
  breakdowns: [
    { id: 'bd1', sentence: 'Full sentence.', translation: '完整句子。', chunks: [] },
  ],
}

vi.mock('../shared/config/chapters', () => ({
  chapters: [
    {
      id: 'no-scenes-ch',
      path: '/no-scenes-ch',
      shortLabel: 'NoScenes',
      titleZh: '測試無全文',
      titleEn: 'Test No Scenes',
      dataLoader: () => Promise.resolve({ default: noScenesData }),
    },
    {
      id: 'full-chapter',
      path: '/full-chapter',
      shortLabel: 'Full',
      titleZh: '完整章節',
      titleEn: 'Full Chapter',
      dataLoader: () => Promise.resolve({ default: fullChapterData }),
    },
  ],
}))

// ---------------------------------------------------------------------------
// Router + IntersectionObserver stub
// ---------------------------------------------------------------------------
class MockIntersectionObserver {
  observe = vi.fn()
  unobserve = vi.fn()
  disconnect = vi.fn()
  constructor(_cb: IntersectionObserverCallback) {}
}

const router = createRouter({
  history: createMemoryHistory(),
  routes: [{ path: '/', component: ChapterView }],
})

async function mountChapter(id: string) {
  const wrapper = mount(ChapterView, {
    props: { id },
    global: { plugins: [router] },
  })
  await new Promise((resolve) => setTimeout(resolve, 0))
  await flushPromises()
  await nextTick()
  return wrapper
}

beforeEach(() => {
  localStorage.clear()
  vi.spyOn(window, 'scrollTo').mockImplementation(() => {})
  vi.spyOn(window, 'scrollY', 'get').mockReturnValue(0)
  ;(globalThis as unknown as { IntersectionObserver: typeof MockIntersectionObserver }).IntersectionObserver =
    MockIntersectionObserver
})

// ---------------------------------------------------------------------------
// Test A — Navigation buttons reflect only sections with data (task 1)
// ---------------------------------------------------------------------------
describe('ChapterViewDynamic — Task 1: dynamic quick nav buttons', () => {
  it('no-scenes-ch: quick nav has exactly 3 buttons (單字/片語/句型, no 全文)', async () => {
    const wrapper = await mountChapter('no-scenes-ch')
    const nav = wrapper.find('[data-testid="no-scenes-ch-quick-nav"]')
    expect(nav.exists()).toBe(true)
    const buttons = nav.findAll('button')
    expect(buttons.length).toBe(3)
    expect(buttons[0].text()).toBe('單字')
    expect(buttons[1].text()).toBe('片語')
    expect(buttons[2].text()).toBe('句型')
  })

  it('full-chapter: quick nav has exactly 4 buttons (全文/單字/片語/句型)', async () => {
    const wrapper = await mountChapter('full-chapter')
    const nav = wrapper.find('[data-testid="full-chapter-quick-nav"]')
    expect(nav.exists()).toBe(true)
    const buttons = nav.findAll('button')
    expect(buttons.length).toBe(4)
    expect(buttons[0].text()).toBe('全文')
    expect(buttons[1].text()).toBe('單字')
    expect(buttons[2].text()).toBe('片語')
    expect(buttons[3].text()).toBe('句型')
  })
})

// ---------------------------------------------------------------------------
// Test B — Section blocks render only when data is present (task 2)
// ---------------------------------------------------------------------------
describe('ChapterViewDynamic — Task 2: conditional section rendering', () => {
  it('no-scenes-ch: bilingual section is NOT in DOM', async () => {
    const wrapper = await mountChapter('no-scenes-ch')
    expect(wrapper.find('#no-scenes-ch-section-bilingual').exists()).toBe(false)
  })

  it('no-scenes-ch: vocabulary section IS in DOM', async () => {
    const wrapper = await mountChapter('no-scenes-ch')
    expect(wrapper.find('#no-scenes-ch-section-vocabulary').exists()).toBe(true)
  })
})

// ---------------------------------------------------------------------------
// Test C — Section numbers auto-increment from 1 (task 3)
// ---------------------------------------------------------------------------
describe('ChapterViewDynamic — Task 3: dynamic section numbers', () => {
  it('no-scenes-ch (scenes=[]): vocabulary=1, phrases=2, breakdown=3', async () => {
    const wrapper = await mountChapter('no-scenes-ch')

    const vocabSection = wrapper.find('#no-scenes-ch-section-vocabulary')
    expect(vocabSection.exists()).toBe(true)
    const vocabNum = vocabSection.find('.font-fraunces.text-4xl')
    expect(vocabNum.text()).toBe('1')

    const phrasesSection = wrapper.find('#no-scenes-ch-section-phrases')
    expect(phrasesSection.exists()).toBe(true)
    const phrasesNum = phrasesSection.find('.font-fraunces.text-4xl')
    expect(phrasesNum.text()).toBe('2')

    const breakdownSection = wrapper.find('#no-scenes-ch-section-breakdown')
    expect(breakdownSection.exists()).toBe(true)
    const breakdownNum = breakdownSection.find('.font-fraunces.text-4xl')
    expect(breakdownNum.text()).toBe('3')
  })

  it('full-chapter: full-text=1, vocabulary=2', async () => {
    const wrapper = await mountChapter('full-chapter')

    const bilingualSection = wrapper.find('#full-chapter-section-bilingual')
    expect(bilingualSection.exists()).toBe(true)
    const bilingualNum = bilingualSection.find('.font-fraunces.text-4xl')
    expect(bilingualNum.text()).toBe('1')

    const vocabSection = wrapper.find('#full-chapter-section-vocabulary')
    expect(vocabSection.exists()).toBe(true)
    const vocabNum = vocabSection.find('.font-fraunces.text-4xl')
    expect(vocabNum.text()).toBe('2')
  })
})

// ---------------------------------------------------------------------------
// Test D — Header tag badges conditionally rendered (task 4)
// ---------------------------------------------------------------------------
describe('ChapterViewDynamic — Task 4: conditional header badges', () => {
  it('no-scenes-ch (headerLevelTag=""): no bg-terracotta badge in header', async () => {
    const wrapper = await mountChapter('no-scenes-ch')
    const header = wrapper.find('header')
    expect(header.exists()).toBe(true)
    // The level tag badge uses bg-terracotta; it should NOT be present when headerLevelTag is empty
    expect(header.find('.bg-terracotta').exists()).toBe(false)
  })

  it('full-chapter (headerLevelTag="程度 B1"): bg-terracotta badge IS visible and contains "程度 B1"', async () => {
    const wrapper = await mountChapter('full-chapter')
    const header = wrapper.find('header')
    expect(header.exists()).toBe(true)
    const badge = header.find('.bg-terracotta')
    expect(badge.exists()).toBe(true)
    expect(badge.text()).toContain('程度 B1')
  })
})
