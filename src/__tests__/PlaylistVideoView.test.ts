import { describe, it, expect, beforeEach, vi } from 'vitest'
import { mount, flushPromises } from '@vue/test-utils'
import { createRouter, createMemoryHistory } from 'vue-router'
import PlaylistVideoView from '../modules/playlists/PlaylistVideoView.vue'
import type { PlaylistData, PlaylistVideoData } from '../modules/playlists/types'

const mockContent: PlaylistVideoData = {
  videoId: 'vid001',
  slug: 'ch1-hello',
  level: 'a1',
  title: 'Hello World',
  youtubeUrl: 'https://www.youtube.com/watch?v=vid001',
  header: {
    podcastLabel: 'MissHoney A1',
    titleZh: '打招呼練習',
    titleEn: 'Hello World',
    levelTag: 'A1',
    topicTag: 'Greetings',
  },
  scenes: [
    {
      id: 'scene-01',
      no: '01',
      titleZh: '開場問候',
      titleEn: 'Opening Greeting',
      sentences: [
        {
          en: 'Hello there, apple.',
          tc: '嗨，你好，蘋果。',
          englishTokens: [
            { type: 'word', text: 'Hello', targetId: 'word-hello', instanceId: 'marker-hello-1' },
            { type: 'text', text: ' there, ' },
            { type: 'word', text: 'apple', targetId: 'word-apple', instanceId: 'marker-apple-1' },
            { type: 'text', text: '. ' },
            { type: 'word', text: 'apple', targetId: 'word-apple', instanceId: 'marker-apple-2' },
            { type: 'text', text: ' can ' },
            { type: 'phrase', text: 'take on', targetId: 'phrase-take-on', instanceId: 'marker-phrase-1' },
            { type: 'text', text: ' a new role, and I can ' },
            { type: 'usage', text: 'run', targetId: 'usage-run-business', instanceId: 'marker-usage-1' },
            { type: 'text', text: ' a business.' },
          ],
        },
      ],
      tags: [
        { id: 'word-hello', english: 'hello', kk: '/həˈloʊ/', partOfSpeech: 'interj.', meaning: '你好', highlight: true },
      ],
    },
  ],
  vocabGroups: [
    {
      title: 'Greetings',
      items: [
        { id: 'word-hello', english: 'hello', kk: '/həˈloʊ/', partOfSpeech: 'interj.', meaning: '你好', highlight: true },
        { id: 'word-apple', english: 'apple', kk: '/ˈæpəl/', partOfSpeech: 'n.', meaning: '蘋果', highlight: false },
      ],
    },
  ],
  phrases: [
    {
      id: 'phrase-take-on',
      phrase: 'take on',
      meaning: '承擔、開始有某種角色',
      examples: [{ en: 'Apple can take on a new role.', tc: 'Apple 可以承擔新的角色。' }],
    },
  ],
  usages: [
    {
      id: 'usage-run-business',
      word: 'run',
      familiarMeaning: '跑',
      usage: '經營、管理',
      translation: '經營一家生意',
      examples: ['I run a small business.'],
    },
  ],
  breakdowns: [
    {
      id: 'breakdown-01',
      sentence: 'Hello there.',
      translation: '嗨，你好。',
      points: [
        { label: 'Hello', text: 'Hello', note: '最常見的打招呼方式。' },
      ],
    },
  ],
}

const legacyContent = {
  videoId: 'vid003',
  slug: 'ch3-legacy',
  level: 'a1',
  title: 'Legacy English Title',
  youtubeUrl: 'https://www.youtube.com/watch?v=vid003',
  scenes: [
    {
      id: 'scene-01',
      sentences: [{ en: 'This is an old schema sentence.', tc: '這是舊格式句子。' }],
    },
  ],
  vocabGroups: [
    {
      label: 'Legacy words',
      items: [{ word: 'legacy', pos: 'n.', meaning: '舊格式', highlight: true }],
    },
  ],
  phrases: [],
}

const mockA1: PlaylistData = {
  level: 'a1',
  title: 'MissHoney A1',
  youtubePlaylistUrl: '',
  videos: [
    {
      videoId: 'vid001',
      slug: 'ch1-hello',
      title: 'Hello World',
      displayOrder: 1,
      originalIndex: 3,
      status: 'ready',
      contentLoader: () => Promise.resolve({ default: mockContent }),
    },
    {
      videoId: 'vid002',
      slug: 'ch2-pending',
      title: 'Pending Video',
      displayOrder: 2,
      originalIndex: 2,
      status: 'pendingTranscript',
      contentLoader: null,
    },
    {
      videoId: 'vid003',
      slug: 'ch3-legacy',
      title: 'Legacy English Title',
      titleZh: '舊格式中文標題',
      displayOrder: 3,
      originalIndex: 1,
      status: 'ready',
      contentLoader: () => Promise.resolve({ default: legacyContent as unknown as PlaylistVideoData }),
    },
  ],
  skippedVideos: [],
}

vi.mock('../modules/playlists/data/a1', () => ({ default: mockA1 }))

function makeRouter(level: string, videoSlug: string) {
  const router = createRouter({
    history: createMemoryHistory(),
    routes: [
      { path: '/:level/:videoSlug', component: PlaylistVideoView, props: true },
    ],
  })
  router.push(`/${level}/${videoSlug}`)
  return router
}

beforeEach(() => {
  localStorage.clear()
  Element.prototype.scrollIntoView = vi.fn()
})

describe('PlaylistVideoView', () => {
  it('renders scenes for a ready video', async () => {
    const router = makeRouter('a1', 'ch1-hello')
    const wrapper = mount(PlaylistVideoView, {
      props: { level: 'a1', videoSlug: 'ch1-hello' },
      global: { plugins: [router] },
    })
    await flushPromises()
    expect(wrapper.text()).toContain('Hello there, apple.')
    expect(wrapper.text()).toContain('嗨，你好。')
  })

  it('renders a polished reading header and quick nav', async () => {
    const router = makeRouter('a1', 'ch1-hello')
    const wrapper = mount(PlaylistVideoView, {
      props: { level: 'a1', videoSlug: 'ch1-hello' },
      global: { plugins: [router] },
    })
    await flushPromises()
    expect(wrapper.find('[data-testid="playlist-reading-header"]').exists()).toBe(true)
    expect(wrapper.text()).toContain('打招呼練習')
    expect(wrapper.text()).toContain('A1')
    expect(wrapper.find('[data-testid="a1-ch1-hello-quick-nav"]').exists()).toBe(true)
  })

  it('uses metadata titleZh for old schema video content without a translated header', async () => {
    const router = makeRouter('a1', 'ch3-legacy')
    const wrapper = mount(PlaylistVideoView, {
      props: { level: 'a1', videoSlug: 'ch3-legacy' },
      global: { plugins: [router] },
    })
    await flushPromises()

    expect(wrapper.find('[data-testid="playlist-reading-header"]').text()).toContain('舊格式中文標題')
    expect(wrapper.find('[data-testid="playlist-reading-header"]').text()).toContain('Legacy English Title')
  })

  it('renders numbered polished sections for bilingual text, vocabulary, phrases, and breakdowns', async () => {
    const router = makeRouter('a1', 'ch1-hello')
    const wrapper = mount(PlaylistVideoView, {
      props: { level: 'a1', videoSlug: 'ch1-hello' },
      global: { plugins: [router] },
    })
    await flushPromises()
    expect(wrapper.find('#a1-ch1-hello-section-bilingual').exists()).toBe(true)
    expect(wrapper.find('#a1-ch1-hello-section-vocabulary').exists()).toBe(true)
    expect(wrapper.find('#a1-ch1-hello-section-phrases').exists()).toBe(true)
    expect(wrapper.find('#a1-ch1-hello-section-breakdown').exists()).toBe(true)
    expect(wrapper.text()).toContain('句型解析')
    expect(wrapper.text()).toContain('最常見的打招呼方式。')
  })

  it('renders vocabGroups for a ready video', async () => {
    const router = makeRouter('a1', 'ch1-hello')
    const wrapper = mount(PlaylistVideoView, {
      props: { level: 'a1', videoSlug: 'ch1-hello' },
      global: { plugins: [router] },
    })
    await flushPromises()
    expect(wrapper.text()).toContain('hello')
    expect(wrapper.text()).toContain('你好')
  })

  it('applies distinct CSS class to highlighted vocab items', async () => {
    const router = makeRouter('a1', 'ch1-hello')
    const wrapper = mount(PlaylistVideoView, {
      props: { level: 'a1', videoSlug: 'ch1-hello' },
      global: { plugins: [router] },
    })
    await flushPromises()
    const highlighted = wrapper.find('[data-testid="vocab-item-highlight"]')
    expect(highlighted.exists()).toBe(true)
    expect(highlighted.text()).toContain('hello')
    expect(highlighted.text()).toContain('/həˈloʊ/')
  })

  it('renders phrases for a ready video', async () => {
    const router = makeRouter('a1', 'ch1-hello')
    const wrapper = mount(PlaylistVideoView, {
      props: { level: 'a1', videoSlug: 'ch1-hello' },
      global: { plugins: [router] },
    })
    await flushPromises()
    expect(wrapper.text()).toContain('take on')
    expect(wrapper.text()).toContain('承擔、開始有某種角色')
  })

  it('renders only English inline markers for words, phrases, and usages', async () => {
    const router = makeRouter('a1', 'ch1-hello')
    const wrapper = mount(PlaylistVideoView, {
      props: { level: 'a1', videoSlug: 'ch1-hello' },
      global: { plugins: [router] },
    })
    await flushPromises()

    expect(wrapper.find('[data-testid="playlist-marker-word"]').text()).toBe('Hello')
    expect(wrapper.find('[data-testid="playlist-marker-phrase"]').text()).toBe('take on')
    expect(wrapper.find('[data-testid="playlist-marker-usage"]').text()).toBe('run')
    expect(wrapper.find('[data-testid="playlist-marker-grammar"]').exists()).toBe(false)
    expect(wrapper.find('[data-testid="playlist-translation-marker"]').exists()).toBe(false)
  })

  it('scrolls to the matching learning item, centers it, and highlights it', async () => {
    const router = makeRouter('a1', 'ch1-hello')
    const wrapper = mount(PlaylistVideoView, {
      props: { level: 'a1', videoSlug: 'ch1-hello' },
      attachTo: document.body,
      global: { plugins: [router] },
    })
    await flushPromises()

    await wrapper.find('[data-marker-instance="marker-apple-1"]').trigger('click')
    await flushPromises()

    expect(Element.prototype.scrollIntoView).toHaveBeenCalledWith({ behavior: 'smooth', block: 'center' })
    expect(wrapper.find('#word-apple').classes()).toContain('playlist-learning-item--active')
  })

  it.each([
    ['word', 'marker-apple-1', '#word-apple'],
    ['phrase', 'marker-phrase-1', '#phrase-take-on'],
    ['usage', 'marker-usage-1', '#usage-run-business'],
  ])('scrolls %s markers to the matching learning item and highlights it', async (_kind, markerInstance, targetSelector) => {
    const router = makeRouter('a1', 'ch1-hello')
    const wrapper = mount(PlaylistVideoView, {
      props: { level: 'a1', videoSlug: 'ch1-hello' },
      attachTo: document.body,
      global: { plugins: [router] },
    })
    await flushPromises()

    await wrapper.find(`[data-marker-instance="${markerInstance}"]`).trigger('click')
    await flushPromises()

    expect(Element.prototype.scrollIntoView).toHaveBeenCalledWith({ behavior: 'smooth', block: 'center' })
    expect(wrapper.find(targetSelector).classes()).toContain('playlist-learning-item--active')
  })

  it('returns from a learning item to the source marker instance', async () => {
    const router = makeRouter('a1', 'ch1-hello')
    const wrapper = mount(PlaylistVideoView, {
      props: { level: 'a1', videoSlug: 'ch1-hello' },
      attachTo: document.body,
      global: { plugins: [router] },
    })
    await flushPromises()

    await wrapper.find('[data-marker-instance="marker-apple-2"]').trigger('click')
    await flushPromises()
    const floatingReturn = wrapper.find('[data-testid="back-to-word-fab"]')
    expect(floatingReturn.exists()).toBe(true)
    expect(floatingReturn.text()).toContain('回原文')
    await floatingReturn.trigger('click')

    const marker = wrapper.find('[data-marker-instance="marker-apple-2"]')
    expect(marker.attributes('data-last-return-target')).toBe('true')
    expect(Element.prototype.scrollIntoView).toHaveBeenLastCalledWith({ behavior: 'smooth', block: 'center' })
  })

  it('keeps return-to-source and back-to-top controls fixed in the bottom-right FAB stack', async () => {
    const router = makeRouter('a1', 'ch1-hello')
    const wrapper = mount(PlaylistVideoView, {
      props: { level: 'a1', videoSlug: 'ch1-hello' },
      attachTo: document.body,
      global: { plugins: [router] },
    })
    await flushPromises()

    await wrapper.find('[data-marker-instance="marker-apple-1"]').trigger('click')
    await flushPromises()

    const returnFab = wrapper.find('[data-testid="back-to-word-fab"]')
    const topFab = wrapper.find('[data-testid="back-to-top-fab"]')
    expect(returnFab.classes()).toContain('fixed')
    expect(returnFab.classes()).toContain('right-6')
    expect(returnFab.classes()).toContain('bottom-6')
    expect(topFab.classes()).toContain('fixed')
    expect(topFab.classes()).toContain('right-6')
    expect(topFab.attributes('style')).toContain('60px')
    expect(wrapper.find('[data-testid="return-to-marker-word-apple"]').exists()).toBe(false)
  })

  it('renders special usages as an independent quick-nav section', async () => {
    const router = makeRouter('a1', 'ch1-hello')
    const wrapper = mount(PlaylistVideoView, {
      props: { level: 'a1', videoSlug: 'ch1-hello' },
      global: { plugins: [router] },
    })
    await flushPromises()

    expect(wrapper.find('#a1-ch1-hello-section-usages').exists()).toBe(true)
    expect(wrapper.find('[data-testid="special-usage-item"]').text()).toContain('經營、管理')
    expect(wrapper.find('[data-testid="a1-ch1-hello-quick-nav"]').text()).toContain('用法')
  })

  it('keeps grammar reachable through section navigation without creating inline grammar markers', async () => {
    const router = makeRouter('a1', 'ch1-hello')
    const wrapper = mount(PlaylistVideoView, {
      props: { level: 'a1', videoSlug: 'ch1-hello' },
      global: { plugins: [router] },
    })
    await flushPromises()

    expect(wrapper.find('#a1-ch1-hello-section-breakdown').exists()).toBe(true)
    expect(wrapper.find('[data-testid="a1-ch1-hello-quick-nav"]').text()).toContain('句型')
    expect(wrapper.find('[data-testid="playlist-marker-grammar"]').exists()).toBe(false)
  })

  it('shows placeholder for pendingTranscript video', async () => {
    const router = makeRouter('a1', 'ch2-pending')
    const wrapper = mount(PlaylistVideoView, {
      props: { level: 'a1', videoSlug: 'ch2-pending' },
      global: { plugins: [router] },
    })
    await flushPromises()
    expect(wrapper.text()).toContain('內容整理中')
  })

  it('shows not-found message for unknown slug', async () => {
    const router = makeRouter('a1', 'ch99-unknown')
    const wrapper = mount(PlaylistVideoView, {
      props: { level: 'a1', videoSlug: 'ch99-unknown' },
      global: { plugins: [router] },
    })
    await flushPromises()
    expect(wrapper.text()).toContain('找不到此影片')
  })
})
