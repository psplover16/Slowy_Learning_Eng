import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import { createRouter, createMemoryHistory } from 'vue-router'
import NavBar from '../shared/components/NavBar.vue'

function makeRouter(path: string) {
  const r = createRouter({
    history: createMemoryHistory(),
    routes: [
      { path: '/', component: { template: '<div />' } },
      { path: '/grammar', component: { template: '<div />' } },
      { path: '/ch1', component: { template: '<div />' } },
    ],
  })
  r.push(path)
  return r
}

describe('NavBar', () => {
  it('renders 首頁 and 文法 buttons', async () => {
    const router = makeRouter('/')
    await router.isReady()
    const wrapper = mount(NavBar, { global: { plugins: [router] } })
    expect(wrapper.text()).toContain('首頁')
    expect(wrapper.text()).toContain('文法')
  })

  it('highlights 首頁 button when on / route', async () => {
    const router = makeRouter('/')
    await router.isReady()
    const wrapper = mount(NavBar, { global: { plugins: [router] } })
    const homeBtn = wrapper.find('[data-testid="nav-home"]')
    expect(homeBtn.classes()).toContain('bg-terracotta')
    expect(homeBtn.classes()).toContain('text-white')
  })

  it('highlights 文法 button when on /grammar route', async () => {
    const router = makeRouter('/grammar')
    await router.isReady()
    const wrapper = mount(NavBar, { global: { plugins: [router] } })
    const grammarBtn = wrapper.find('[data-testid="nav-grammar"]')
    expect(grammarBtn.classes()).toContain('bg-terracotta')
    expect(grammarBtn.classes()).toContain('text-white')
  })

  it('highlights neither button on /ch1 route', async () => {
    const router = makeRouter('/ch1')
    await router.isReady()
    const wrapper = mount(NavBar, { global: { plugins: [router] } })
    const homeBtn = wrapper.find('[data-testid="nav-home"]')
    const grammarBtn = wrapper.find('[data-testid="nav-grammar"]')
    expect(homeBtn.classes()).not.toContain('bg-terracotta')
    expect(grammarBtn.classes()).not.toContain('bg-terracotta')
  })

  it('does not contain a direct /ch1 link', async () => {
    const router = makeRouter('/')
    await router.isReady()
    const wrapper = mount(NavBar, { global: { plugins: [router] } })
    const links = wrapper.findAll('a[href="/ch1"]')
    expect(links.length).toBe(0)
  })
})
