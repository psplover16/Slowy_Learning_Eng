import { describe, it, expect, beforeEach } from 'vitest'
import { mount, flushPromises } from '@vue/test-utils'
import { createRouter, createMemoryHistory } from 'vue-router'
import HomeView from '../modules/home/views/HomeView.vue'

function makeRouter() {
  const r = createRouter({
    history: createMemoryHistory(),
    routes: [
      { path: '/', component: HomeView },
      { path: '/a1', component: { template: '<div />' } },
      { path: '/a2', component: { template: '<div />' } },
      { path: '/b1', component: { template: '<div />' } },
      { path: '/b2', component: { template: '<div />' } },
      { path: '/ch1', component: { template: '<div />' } },
    ],
  })
  r.push('/')
  return r
}

beforeEach(() => {
  localStorage.clear()
})

describe('HomeView — MissHoney section', () => {
  it('shows a MissHoney section heading', async () => {
    const router = makeRouter()
    const wrapper = mount(HomeView, { global: { plugins: [router] } })
    await flushPromises()
    expect(wrapper.text()).toContain('MissHoney')
  })

  it('renders four MissHoney playlist cards in A1/A2/B1/B2 order', async () => {
    const router = makeRouter()
    const wrapper = mount(HomeView, { global: { plugins: [router] } })
    await flushPromises()
    const cards = wrapper.findAll('[data-testid^="misshoney-playlist-"]')
    expect(cards.length).toBe(4)
    expect(cards[0].attributes('data-testid')).toBe('misshoney-playlist-a1')
    expect(cards[1].attributes('data-testid')).toBe('misshoney-playlist-a2')
    expect(cards[2].attributes('data-testid')).toBe('misshoney-playlist-b1')
    expect(cards[3].attributes('data-testid')).toBe('misshoney-playlist-b2')
  })

  it('MissHoney cards do not have completion circles (showCompletion=false)', async () => {
    const router = makeRouter()
    const wrapper = mount(HomeView, { global: { plugins: [router] } })
    await flushPromises()
    // Each MissHoney card section should have no completion-toggle buttons
    const misshoneySection = wrapper.find('[data-testid="misshoney-section"]')
    expect(misshoneySection.exists()).toBe(true)
    const circles = misshoneySection.findAll('[data-testid="completion-toggle"]')
    expect(circles.length).toBe(0)
  })

  it('existing ch1-ch4 article cards still have completion circles', async () => {
    const router = makeRouter()
    const wrapper = mount(HomeView, { global: { plugins: [router] } })
    await flushPromises()
    const chapterCircles = wrapper.findAll('[data-testid^="article-"] [data-testid="completion-toggle"]')
    expect(chapterCircles.length).toBeGreaterThan(0)
  })

  it('existing article list is still present above MissHoney section', async () => {
    const router = makeRouter()
    const wrapper = mount(HomeView, { global: { plugins: [router] } })
    await flushPromises()
    const html = wrapper.html()
    const articleIndex = html.indexOf('data-testid="article-ch1"')
    const missHoneyIndex = html.indexOf('data-testid="misshoney-section"')
    expect(articleIndex).toBeGreaterThan(-1)
    expect(missHoneyIndex).toBeGreaterThan(-1)
    expect(articleIndex).toBeLessThan(missHoneyIndex)
  })
})
