import { describe, it, expect, beforeEach, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import { createRouter, createMemoryHistory } from 'vue-router'
import Ch1View from '../modules/ch1/views/Ch1View.vue'

const router = createRouter({
  history: createMemoryHistory(),
  routes: [{ path: '/', component: Ch1View }],
})

function mountCh1() {
  return mount(Ch1View, {
    global: { plugins: [router] },
  })
}

beforeEach(() => {
  localStorage.clear()
  vi.spyOn(window, 'scrollTo').mockImplementation(() => {})
  vi.spyOn(window, 'scrollY', 'get').mockReturnValue(0)
})

describe('Ch1View — scene blocks', () => {
  it('renders 15 scene blocks', () => {
    const wrapper = mountCh1()
    expect(wrapper.findAll('[data-testid^="scene-"]').length).toBe(15)
  })

  it('scene-01 has bilingual title', () => {
    const wrapper = mountCh1()
    const scene = wrapper.find('[data-testid="scene-01"]')
    expect(scene.text()).toContain('凌晨出發')
    expect(scene.text()).toContain('An early start')
  })
})

describe('Ch1View — explanation card anchor ids', () => {
  it('has id="vocab-layover"', () => {
    const wrapper = mountCh1()
    expect(wrapper.find('#vocab-layover').exists()).toBe(true)
  })

  it('has id="vocab-to-have-had"', () => {
    const wrapper = mountCh1()
    expect(wrapper.find('#vocab-to-have-had').exists()).toBe(true)
  })

  it('has id="vocab-used-to"', () => {
    const wrapper = mountCh1()
    expect(wrapper.find('#vocab-used-to').exists()).toBe(true)
  })

  it('has id="vocab-bring-back"', () => {
    const wrapper = mountCh1()
    expect(wrapper.find('#vocab-bring-back').exists()).toBe(true)
  })
})

describe('Ch1View — WordTag count', () => {
  it('renders at least 60 WordTag components', () => {
    const wrapper = mountCh1()
    // WordTag renders with data-testid="word-tag"
    expect(wrapper.findAll('[data-testid="word-tag"]').length).toBeGreaterThanOrEqual(60)
  })
})

describe('Ch1View — underlined vocab', () => {
  it('article text contains underlined words', () => {
    const wrapper = mountCh1()
    expect(wrapper.findAll('[data-target]').length).toBeGreaterThan(0)
  })
})

describe('Ch1View — sentence breakdown cards', () => {
  it('renders at least 29 sentence breakdown cards', () => {
    const wrapper = mountCh1()
    expect(wrapper.findAll('[data-testid="sentence-breakdown"]').length).toBeGreaterThanOrEqual(29)
  })
})
