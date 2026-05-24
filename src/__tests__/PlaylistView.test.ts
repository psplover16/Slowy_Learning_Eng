import { describe, it, expect, beforeEach, vi } from 'vitest'
import { mount, flushPromises } from '@vue/test-utils'
import { createRouter, createMemoryHistory } from 'vue-router'
import PlaylistView from '../modules/playlists/PlaylistView.vue'
import type { PlaylistData, PlaylistVideoEntry } from '../modules/playlists/types'

const mockA1: PlaylistData = {
  level: 'a1',
  title: 'MissHoney A1',
  youtubePlaylistUrl: 'https://www.youtube.com/playlist?list=TESTLIST',
  videos: [
    {
      videoId: 'vid001',
      slug: 'ch1-hello',
      title: 'Hello',
      titleZh: '你好練習',
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
  mockA1.videos = [
    {
      videoId: 'vid001',
      slug: 'ch1-hello',
      title: 'Hello',
      titleZh: '你好練習',
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
  ]
})

function makeVideo(displayOrder: number): PlaylistVideoEntry {
  return {
    videoId: `ch${displayOrder}`,
    slug: `ch${displayOrder}`,
    title: `Ch ${displayOrder}`,
    displayOrder,
    originalIndex: displayOrder,
    status: 'ready',
    contentLoader: () => Promise.resolve({ default: {} as never }),
  }
}

function renderedCardTitles(wrapper: ReturnType<typeof mount>): string[] {
  return wrapper
    .findAll('[data-testid="playlist-video-card"]')
    .map(card => card.text().match(/Ch \d/)?.[0] ?? '')
}

function findCardByTitle(wrapper: ReturnType<typeof mount>, title: string) {
  const card = wrapper.findAll('[data-testid="playlist-video-card"]').find(candidate => candidate.text().includes(title))
  if (!card) {
    throw new Error(`Could not find playlist card with title: ${title}`)
  }
  return card
}

async function toggleCardByTitle(wrapper: ReturnType<typeof mount>, title: string): Promise<void> {
  await findCardByTitle(wrapper, title).find('[data-testid="completion-toggle"]').trigger('click')
  await flushPromises()
}

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

  it.each(['a1', 'a2', 'b1', 'b2'])('renders playlist cards and ready detail links for /%s', async (level) => {
    const router = makeRouter(level)
    const wrapper = mount(PlaylistView, {
      props: { level },
      global: { plugins: [router] },
    })
    await flushPromises()

    expect(wrapper.find('h1').text()).toBe(`MissHoney ${level.toUpperCase()}`)
    expect(wrapper.findAll('[data-testid="playlist-video-card"]').length).toBeGreaterThan(0)
    const firstCard = wrapper.find('[data-testid="playlist-video-card"]')
    expect(firstCard.attributes('href') ?? firstCard.find('a').attributes('href')).toContain(`/${level}/ch1-hello`)
  })

  it('reloads playlist data when the route level changes on the reused view', async () => {
    const router = makeRouter('b1')
    const wrapper = mount(PlaylistView, {
      props: { level: 'b1' },
      global: { plugins: [router] },
    })
    await flushPromises()

    expect(wrapper.find('h1').text()).toBe('MissHoney B1')

    await wrapper.setProps({ level: 'a1' })
    await flushPromises()

    expect(wrapper.find('h1').text()).toBe('MissHoney A1')
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

  it('shows translated video titles first when titleZh is available', async () => {
    const router = makeRouter('a1')
    const wrapper = mount(PlaylistView, {
      props: { level: 'a1' },
      global: { plugins: [router] },
    })
    await flushPromises()

    const firstCard = wrapper.find('[data-testid="playlist-video-card"]')
    expect(firstCard.text()).toContain('你好練習')
    expect(firstCard.text()).toContain('Hello')
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

  it('uses the same article-list card shell and stable vertical gap', async () => {
    const router = makeRouter('a1')
    const wrapper = mount(PlaylistView, {
      props: { level: 'a1' },
      global: { plugins: [router] },
    })
    await flushPromises()

    const list = wrapper.find('[data-testid="playlist-video-list"]')
    expect(list.exists()).toBe(true)
    expect(list.classes()).toContain('space-y-3')

    const firstCard = wrapper.find('[data-testid="playlist-video-card"]')
    expect(firstCard.classes()).toEqual(expect.arrayContaining([
      'bg-paper-2',
      'rounded-lg',
      'border',
      'border-line',
    ]))
  })

  it('persists MissHoney completion without changing chapter completion storage', async () => {
    localStorage.setItem('slowy:completion', JSON.stringify({ ch1: true }))
    const router = makeRouter('a1')
    const wrapper = mount(PlaylistView, {
      props: { level: 'a1' },
      global: { plugins: [router] },
    })
    await flushPromises()

    await wrapper.find('[data-testid="completion-toggle"]').trigger('click')

    expect(JSON.parse(localStorage.getItem('slowy:miss-honey-completion') ?? '{}')).toEqual({ vid001: true })
    expect(JSON.parse(localStorage.getItem('slowy:completion') ?? '{}')).toEqual({ ch1: true })
  })

  it('renders incomplete videos before completed videos while preserving display order within each group', async () => {
    mockA1.videos = [
      makeVideo(4),
      makeVideo(1),
      makeVideo(3),
      makeVideo(2),
      makeVideo(5),
    ]
    localStorage.setItem('slowy:miss-honey-completion', JSON.stringify({
      ch1: true,
      ch3: true,
      ch5: true,
    }))
    const router = makeRouter('a1')
    const wrapper = mount(PlaylistView, {
      props: { level: 'a1' },
      global: { plugins: [router] },
    })
    await flushPromises()

    expect(renderedCardTitles(wrapper)).toEqual(['Ch 2', 'Ch 4', 'Ch 1', 'Ch 3', 'Ch 5'])
  })

  it('moves videos between incomplete and completed groups when completion is toggled', async () => {
    mockA1.videos = [
      makeVideo(1),
      makeVideo(2),
      makeVideo(3),
      makeVideo(4),
      makeVideo(5),
    ]
    localStorage.setItem('slowy:miss-honey-completion', JSON.stringify({
      ch2: true,
      ch4: true,
    }))
    const router = makeRouter('a1')
    const wrapper = mount(PlaylistView, {
      props: { level: 'a1' },
      global: { plugins: [router] },
    })
    await flushPromises()

    expect(renderedCardTitles(wrapper)).toEqual(['Ch 1', 'Ch 3', 'Ch 5', 'Ch 2', 'Ch 4'])

    await toggleCardByTitle(wrapper, 'Ch 1')

    expect(renderedCardTitles(wrapper)).toEqual(['Ch 3', 'Ch 5', 'Ch 1', 'Ch 2', 'Ch 4'])
    expect(findCardByTitle(wrapper, 'Ch 1').attributes('href')).toContain('/a1/ch1')

    await toggleCardByTitle(wrapper, 'Ch 1')

    expect(renderedCardTitles(wrapper)).toEqual(['Ch 1', 'Ch 3', 'Ch 5', 'Ch 2', 'Ch 4'])
  })
})
