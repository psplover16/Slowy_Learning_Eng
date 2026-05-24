import { describe, it, expect, beforeEach } from 'vitest'
import { mount, flushPromises } from '@vue/test-utils'
import { createMemoryHistory, createRouter } from 'vue-router'
import HomeView from '../modules/home/views/HomeView.vue'

function makeRouter() {
  const router = createRouter({
    history: createMemoryHistory(),
    routes: [
      { path: '/', component: HomeView },
      { path: '/a1', component: { template: '<div>A1</div>' } },
      { path: '/a2', component: { template: '<div>A2</div>' } },
      { path: '/b1', component: { template: '<div>B1</div>' } },
      { path: '/b2', component: { template: '<div>B2</div>' } },
      { path: '/ch1', component: { template: '<div>Ch1</div>' } },
      { path: '/ch2', component: { template: '<div>Ch2</div>' } },
      { path: '/ch3', component: { template: '<div>Ch3</div>' } },
      { path: '/ch4', component: { template: '<div>Ch4</div>' } },
    ],
  })
  router.push('/')
  return router
}

async function mountHome() {
  const router = makeRouter()
  const wrapper = mount(HomeView, { global: { plugins: [router] } })
  await router.isReady()
  await flushPromises()
  return { wrapper, router }
}

beforeEach(() => {
  localStorage.clear()
})

describe('HomeView', () => {
  it('renders the MissHoney section after article cards with a stable card gap', async () => {
    const { wrapper } = await mountHome()

    const html = wrapper.html()
    expect(html.indexOf('data-testid="article-ch1"')).toBeGreaterThan(-1)
    expect(html.indexOf('data-testid="misshoney-section"')).toBeGreaterThan(-1)
    expect(html.indexOf('data-testid="article-ch1"')).toBeLessThan(
      html.indexOf('data-testid="misshoney-section"'),
    )

    const list = wrapper.find('[data-testid="misshoney-level-list"]')
    expect(list.exists()).toBe(true)
    expect(list.classes()).toContain('space-y-3')
    expect(list.findAll('[data-testid^="misshoney-playlist-"]')).toHaveLength(4)
  })

  it('omits completion controls from MissHoney navigation cards and routes to each level', async () => {
    const { wrapper, router } = await mountHome()
    const section = wrapper.find('[data-testid="misshoney-section"]')
    expect(section.find('[data-testid="completion-toggle"]').exists()).toBe(false)

    const cases = [
      ['misshoney-playlist-a1', '/a1'],
      ['misshoney-playlist-a2', '/a2'],
      ['misshoney-playlist-b1', '/b1'],
      ['misshoney-playlist-b2', '/b2'],
    ]

    for (const [testId, path] of cases) {
      await router.push('/')
      await flushPromises()
      await wrapper.find(`[data-testid="${testId}"]`).trigger('click')
      await flushPromises()
      expect(router.currentRoute.value.path).toBe(path)
    }
  })

  it('keeps chapter completion storage isolated from MissHoney storage', async () => {
    const { wrapper } = await mountHome()

    await wrapper.find('[data-testid="article-ch1"] [data-testid="completion-toggle"]').trigger('click')

    expect(JSON.parse(localStorage.getItem('slowy:completion') ?? '{}')).toEqual({ ch1: true })
    expect(localStorage.getItem('slowy:miss-honey-completion')).toBeNull()
  })
})
