import { describe, it, expect, beforeEach, vi } from 'vitest'
import { mount, flushPromises } from '@vue/test-utils'
import { createRouter, createMemoryHistory } from 'vue-router'
import PlaylistView from '../modules/playlists/PlaylistView.vue'
import type { PlaylistData } from '../modules/playlists/types'

const mockA1: PlaylistData = {
  level: 'a1',
  title: 'MissHoney A1',
  youtubePlaylistUrl: 'https://www.youtube.com/playlist?list=TESTLIST',
  videos: [
    {
      videoId: 'vid001',
      slug: 'ch1-hello',
      title: 'Hello',
      displayOrder: 1,
      originalIndex: 3,
      status: 'ready',
      contentLoader: () => Promise.resolve({ default: {} as never }),
    },
    {
      videoId: 'vid002',
      slug: 'ch2-goodbye',
      title: 'Goodbye',
      displayOrder: 2,
      originalIndex: 1,
      status: 'pendingTranscript',
      contentLoader: null,
    },
  ],
  skippedVideos: [
    {
      videoId: 'vid003',
      title: 'Skipped Video',
      youtubeUrl: 'https://www.youtube.com/watch?v=vid003',
      originalIndex: 2,
      reason: 'member-only',
    },
  ],
}

vi.mock('../modules/playlists/data/a1', () => ({ default: mockA1 }))
vi.mock('../modules/playlists/data/a2', () => ({ default: { ...mockA1, level: 'a2', title: 'MissHoney A2' } }))
vi.mock('../modules/playlists/data/b1', () => ({ default: { ...mockA1, level: 'b1', title: 'MissHoney B1' } }))
vi.mock('../modules/playlists/data/b2', () => ({ default: { ...mockA1, level: 'b2', title: 'MissHoney B2' } }))

function makeRouter(level: string) {
  const router = createRouter({
    history: createMemoryHistory(),
    routes: [
      { path: `/:level`, component: PlaylistView, props: true },
      { path: `/:level/:videoSlug`, component: { template: '<div />' } },
    ],
  })
  router.push(`/${level}`)
  return router
}

beforeEach(() => {
  localStorage.clear()
})

describe('PlaylistView', () => {
  it('renders for /a1 without errors', async () => {
    const router = makeRouter('a1')
    const wrapper = mount(PlaylistView, {
      props: { level: 'a1' },
      global: { plugins: [router] },
    })
    await flushPromises()
    expect(wrapper.exists()).toBe(true)
  })

  it('renders video cards sorted by displayOrder ascending', async () => {
    const router = makeRouter('a1')
    const wrapper = mount(PlaylistView, {
      props: { level: 'a1' },
      global: { plugins: [router] },
    })
    await flushPromises()
    const cards = wrapper.findAll('[data-testid="playlist-video-card"]')
    expect(cards.length).toBe(2)
    // displayOrder 1 first, 2 second
    expect(cards[0].text()).toContain('Hello')
    expect(cards[1].text()).toContain('Goodbye')
  })

  it('does not render skipped videos as cards', async () => {
    const router = makeRouter('a1')
    const wrapper = mount(PlaylistView, {
      props: { level: 'a1' },
      global: { plugins: [router] },
    })
    await flushPromises()
    const cards = wrapper.findAll('[data-testid="playlist-video-card"]')
    const allText = cards.map(c => c.text()).join(' ')
    expect(allText).not.toContain('Skipped Video')
  })

  it('card links point to /:level/:slug', async () => {
    const router = makeRouter('a1')
    const wrapper = mount(PlaylistView, {
      props: { level: 'a1' },
      global: { plugins: [router] },
    })
    await flushPromises()
    const firstCard = wrapper.find('[data-testid="playlist-video-card"]')
    expect(firstCard.attributes('href') ?? firstCard.find('a').attributes('href')).toContain('/a1/ch1-hello')
  })

  it('each card has a completion circle', async () => {
    const router = makeRouter('a1')
    const wrapper = mount(PlaylistView, {
      props: { level: 'a1' },
      global: { plugins: [router] },
    })
    await flushPromises()
    const circles = wrapper.findAll('[data-testid="completion-toggle"]')
    expect(circles.length).toBe(2)
  })
})
