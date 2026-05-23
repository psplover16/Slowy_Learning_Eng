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
      sentences: [{ en: 'Hello there.', tc: '嗨，你好。' }],
      tags: [
        { english: 'hello', kk: '/həˈloʊ/', partOfSpeech: 'interj.', meaning: '你好', highlight: true },
      ],
    },
  ],
  vocabGroups: [
    {
      title: 'Greetings',
      items: [
        { english: 'hello', kk: '/həˈloʊ/', partOfSpeech: 'interj.', meaning: '你好', highlight: true },
        { english: 'world', kk: '/wɝːld/', partOfSpeech: 'n.', meaning: '世界', highlight: false },
      ],
    },
  ],
  phrases: [
    {
      id: 'phrase-01',
      phrase: 'hello there',
      meaning: '嗨，你好',
      examples: [{ en: 'Hello there!', tc: '嗨，你好！' }],
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
})

describe('PlaylistVideoView', () => {
  it('renders scenes for a ready video', async () => {
    const router = makeRouter('a1', 'ch1-hello')
    const wrapper = mount(PlaylistVideoView, {
      props: { level: 'a1', videoSlug: 'ch1-hello' },
      global: { plugins: [router] },
    })
    await flushPromises()
    expect(wrapper.text()).toContain('Hello there.')
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
    expect(wrapper.text()).toContain('hello there')
    expect(wrapper.text()).toContain('嗨，你好')
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
