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
  scenes: [
    {
      id: 'scene-01',
      sentences: [{ en: 'Hello there.', tc: '嗨，你好。' }],
    },
  ],
  vocabGroups: [
    {
      label: 'Greetings',
      items: [
        { word: 'hello', pos: 'interjection', meaning: '你好', highlight: true },
        { word: 'world', pos: 'noun', meaning: '世界', highlight: false },
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
