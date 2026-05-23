import { describe, it, expect } from 'vitest'
import { mount, flushPromises } from '@vue/test-utils'
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

describe('NavBar — base structure', () => {
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
})

describe('NavBar — content dropdown', () => {
  it('renders nav-content-trigger with text "內容" and aria-haspopup="menu"', async () => {
    const router = makeRouter('/')
    await router.isReady()
    const wrapper = mount(NavBar, { global: { plugins: [router] } })
    const trigger = wrapper.find('[data-testid="nav-content-trigger"]')
    expect(trigger.exists()).toBe(true)
    expect(trigger.text()).toContain('內容')
    expect(trigger.attributes('aria-haspopup')).toBe('menu')
  })

  it('menu is not rendered before trigger is clicked', async () => {
    const router = makeRouter('/')
    await router.isReady()
    const wrapper = mount(NavBar, { global: { plugins: [router] } })
    expect(wrapper.find('[data-testid="nav-content-menu"]').exists()).toBe(false)
  })

  it('clicking trigger opens menu with one button per chapter', async () => {
    const router = makeRouter('/')
    await router.isReady()
    const wrapper = mount(NavBar, { global: { plugins: [router] } })
    await wrapper.find('[data-testid="nav-content-trigger"]').trigger('click')
    expect(wrapper.find('[data-testid="nav-content-menu"]').exists()).toBe(true)
    const ch1Btn = wrapper.find('[data-testid="nav-content-ch1"]')
    expect(ch1Btn.exists()).toBe(true)
    expect(ch1Btn.text()).toContain('我的紐約之旅')
  })

  it('clicking a chapter item navigates to its path and closes the menu', async () => {
    const router = makeRouter('/')
    await router.isReady()
    const wrapper = mount(NavBar, { global: { plugins: [router] } })
    await wrapper.find('[data-testid="nav-content-trigger"]').trigger('click')
    await wrapper.find('[data-testid="nav-content-ch1"]').trigger('click')
    await flushPromises()
    expect(router.currentRoute.value.path).toBe('/ch1')
    expect(wrapper.find('[data-testid="nav-content-menu"]').exists()).toBe(false)
  })

  it('trigger has active classes when current route matches a chapter path', async () => {
    const router = makeRouter('/ch1')
    await router.isReady()
    const wrapper = mount(NavBar, { global: { plugins: [router] } })
    const trigger = wrapper.find('[data-testid="nav-content-trigger"]')
    expect(trigger.classes()).toContain('bg-terracotta')
    expect(trigger.classes()).toContain('text-white')
  })

  it('trigger does NOT have active classes on / or /grammar routes', async () => {
    const router = makeRouter('/grammar')
    await router.isReady()
    const wrapper = mount(NavBar, { global: { plugins: [router] } })
    const trigger = wrapper.find('[data-testid="nav-content-trigger"]')
    expect(trigger.classes()).not.toContain('bg-terracotta')
  })

  it('clicking outside the dropdown container closes the menu', async () => {
    const router = makeRouter('/')
    await router.isReady()
    const wrapper = mount(NavBar, { attachTo: document.body, global: { plugins: [router] } })
    await wrapper.find('[data-testid="nav-content-trigger"]').trigger('click')
    expect(wrapper.find('[data-testid="nav-content-menu"]').exists()).toBe(true)
    // dispatch a click on document body outside the dropdown
    document.body.dispatchEvent(new MouseEvent('click', { bubbles: true }))
    await flushPromises()
    expect(wrapper.find('[data-testid="nav-content-menu"]').exists()).toBe(false)
    wrapper.unmount()
  })

  it('pressing Escape closes the menu', async () => {
    const router = makeRouter('/')
    await router.isReady()
    const wrapper = mount(NavBar, { attachTo: document.body, global: { plugins: [router] } })
    await wrapper.find('[data-testid="nav-content-trigger"]').trigger('click')
    expect(wrapper.find('[data-testid="nav-content-menu"]').exists()).toBe(true)
    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }))
    await flushPromises()
    expect(wrapper.find('[data-testid="nav-content-menu"]').exists()).toBe(false)
    wrapper.unmount()
  })

  it('renders the four NavBar items in DOM order: home, content-trigger, misshoney-trigger, grammar', async () => {
    const router = makeRouter('/')
    await router.isReady()
    const wrapper = mount(NavBar, { global: { plugins: [router] } })
    const items = wrapper.findAll('[data-testid="nav-home"], [data-testid="nav-content-trigger"], [data-testid="nav-misshoney-trigger"], [data-testid="nav-grammar"]')
    expect(items.length).toBe(4)
    expect(items[0].attributes('data-testid')).toBe('nav-home')
    expect(items[1].attributes('data-testid')).toBe('nav-content-trigger')
    expect(items[2].attributes('data-testid')).toBe('nav-misshoney-trigger')
    expect(items[3].attributes('data-testid')).toBe('nav-grammar')
  })
})

describe('NavBar — MissHoney dropdown', () => {
  it('renders nav-misshoney-trigger with text "MissHoney" and aria-haspopup="menu"', async () => {
    const router = makeRouter('/')
    await router.isReady()
    const wrapper = mount(NavBar, { global: { plugins: [router] } })
    const trigger = wrapper.find('[data-testid="nav-misshoney-trigger"]')
    expect(trigger.exists()).toBe(true)
    expect(trigger.text()).toContain('MissHoney')
    expect(trigger.attributes('aria-haspopup')).toBe('menu')
  })

  it('MissHoney menu is not rendered before trigger is clicked', async () => {
    const router = makeRouter('/')
    await router.isReady()
    const wrapper = mount(NavBar, { global: { plugins: [router] } })
    expect(wrapper.find('[data-testid="nav-misshoney-menu"]').exists()).toBe(false)
  })

  it('clicking trigger opens MissHoney menu with A1, A2, B1, B2 items in order', async () => {
    const router = makeRouter('/')
    await router.isReady()
    const wrapper = mount(NavBar, { global: { plugins: [router] } })
    await wrapper.find('[data-testid="nav-misshoney-trigger"]').trigger('click')
    const menu = wrapper.find('[data-testid="nav-misshoney-menu"]')
    expect(menu.exists()).toBe(true)
    const items = menu.findAll('[data-testid^="nav-misshoney-"]').filter(el =>
      el.attributes('data-testid') !== 'nav-misshoney-trigger' &&
      el.attributes('data-testid') !== 'nav-misshoney-menu'
    )
    expect(items.length).toBe(4)
    expect(items[0].text()).toContain('A1')
    expect(items[1].text()).toContain('A2')
    expect(items[2].text()).toContain('B1')
    expect(items[3].text()).toContain('B2')
  })

  it('clicking a MissHoney item navigates and closes the menu', async () => {
    const r = createRouter({
      history: createMemoryHistory(),
      routes: [
        { path: '/', component: { template: '<div />' } },
        { path: '/a1', component: { template: '<div />' } },
        { path: '/grammar', component: { template: '<div />' } },
      ],
    })
    r.push('/')
    await r.isReady()
    const wrapper = mount(NavBar, { global: { plugins: [r] } })
    await wrapper.find('[data-testid="nav-misshoney-trigger"]').trigger('click')
    await wrapper.find('[data-testid="nav-misshoney-a1"]').trigger('click')
    await flushPromises()
    expect(r.currentRoute.value.path).toBe('/a1')
    expect(wrapper.find('[data-testid="nav-misshoney-menu"]').exists()).toBe(false)
  })

  it('MissHoney trigger has active classes when on /a1 route', async () => {
    const r = createRouter({
      history: createMemoryHistory(),
      routes: [
        { path: '/a1', component: { template: '<div />' } },
        { path: '/grammar', component: { template: '<div />' } },
      ],
    })
    r.push('/a1')
    await r.isReady()
    const wrapper = mount(NavBar, { global: { plugins: [r] } })
    const trigger = wrapper.find('[data-testid="nav-misshoney-trigger"]')
    expect(trigger.classes()).toContain('bg-terracotta')
    expect(trigger.classes()).toContain('text-white')
  })

  it('MissHoney trigger does NOT have active classes on / or /grammar', async () => {
    const router = makeRouter('/grammar')
    await router.isReady()
    const wrapper = mount(NavBar, { global: { plugins: [router] } })
    const trigger = wrapper.find('[data-testid="nav-misshoney-trigger"]')
    expect(trigger.classes()).not.toContain('bg-terracotta')
  })

  it('MissHoney menu has overflow prevention class max-w-[calc(100vw-11rem)]', async () => {
    const router = makeRouter('/')
    await router.isReady()
    const wrapper = mount(NavBar, { global: { plugins: [router] } })
    await wrapper.find('[data-testid="nav-misshoney-trigger"]').trigger('click')
    const menu = wrapper.find('[data-testid="nav-misshoney-menu"]')
    expect(menu.classes()).toContain('max-w-[calc(100vw-11rem)]')
  })

  it('pressing Escape closes the MissHoney menu', async () => {
    const router = makeRouter('/')
    await router.isReady()
    const wrapper = mount(NavBar, { attachTo: document.body, global: { plugins: [router] } })
    await wrapper.find('[data-testid="nav-misshoney-trigger"]').trigger('click')
    expect(wrapper.find('[data-testid="nav-misshoney-menu"]').exists()).toBe(true)
    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }))
    await flushPromises()
    expect(wrapper.find('[data-testid="nav-misshoney-menu"]').exists()).toBe(false)
    wrapper.unmount()
  })

  it('clicking outside closes the MissHoney menu', async () => {
    const router = makeRouter('/')
    await router.isReady()
    const wrapper = mount(NavBar, { attachTo: document.body, global: { plugins: [router] } })
    await wrapper.find('[data-testid="nav-misshoney-trigger"]').trigger('click')
    expect(wrapper.find('[data-testid="nav-misshoney-menu"]').exists()).toBe(true)
    document.body.dispatchEvent(new MouseEvent('click', { bubbles: true }))
    await flushPromises()
    expect(wrapper.find('[data-testid="nav-misshoney-menu"]').exists()).toBe(false)
    wrapper.unmount()
  })
})
