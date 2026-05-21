import { describe, it, expect, beforeEach, vi } from 'vitest'
import { mount, flushPromises } from '@vue/test-utils'
import { createRouter, createMemoryHistory } from 'vue-router'
import App from '../app/App.vue'
import HomeView from '../modules/home/views/HomeView.vue'
import GrammarView from '../modules/grammar/views/GrammarView.vue'
import ChapterView from '../modules/chapters/ChapterView.vue'

class MockIntersectionObserver {
  observe = vi.fn()
  unobserve = vi.fn()
  disconnect = vi.fn()
  constructor(_cb: IntersectionObserverCallback) {}
}

function makeRouter(path: string) {
  const router = createRouter({
    history: createMemoryHistory(),
    routes: [
      { path: '/', component: HomeView },
      { path: '/grammar', component: GrammarView },
      { path: '/ch1', component: ChapterView, props: { id: 'ch1' } },
    ],
  })
  router.push(path)
  return router
}

beforeEach(() => {
  localStorage.clear()
  vi.spyOn(window, 'scrollTo').mockImplementation(() => {})
  vi.spyOn(window, 'scrollY', 'get').mockReturnValue(0)
  ;(globalThis as unknown as { IntersectionObserver: typeof MockIntersectionObserver }).IntersectionObserver =
    MockIntersectionObserver
})

describe('Smoke tests', () => {
  it('/ — renders NavBar and main', async () => {
    const router = makeRouter('/')
    const wrapper = mount(App, { global: { plugins: [router] } })
    await flushPromises()
    expect(wrapper.find('[data-testid="nav-home"]').exists()).toBe(true)
    expect(wrapper.find('main').exists()).toBe(true)
  })

  it('/grammar — renders NavBar and main', async () => {
    const router = makeRouter('/grammar')
    const wrapper = mount(App, { global: { plugins: [router] } })
    await flushPromises()
    expect(wrapper.find('[data-testid="nav-home"]').exists()).toBe(true)
    expect(wrapper.find('main').exists()).toBe(true)
  })

  it('/ch1 — renders NavBar and main', async () => {
    const router = makeRouter('/ch1')
    const wrapper = mount(App, { global: { plugins: [router] } })
    await flushPromises()
    expect(wrapper.find('[data-testid="nav-home"]').exists()).toBe(true)
    expect(wrapper.find('main').exists()).toBe(true)
  })
})
