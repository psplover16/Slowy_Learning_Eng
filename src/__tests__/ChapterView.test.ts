import { describe, it, expect, beforeAll, beforeEach, vi } from 'vitest'
import { mount, flushPromises } from '@vue/test-utils'
import { createRouter, createMemoryHistory } from 'vue-router'
import { nextTick } from 'vue'
import ChapterView from '../modules/chapters/ChapterView.vue'
import { chapters } from '../shared/config/chapters'

class MockIntersectionObserver {
  observe = vi.fn()
  unobserve = vi.fn()
  disconnect = vi.fn()
  constructor(_cb: IntersectionObserverCallback) {}
}

const router = createRouter({
  history: createMemoryHistory(),
  routes: [{ path: '/', component: ChapterView }],
})

async function mountChapter(id: string) {
  const wrapper = mount(ChapterView, {
    props: { id },
    global: { plugins: [router] },
  })
  // The component's onMounted awaits a dynamic `import()`. Vitest's
  // `flushPromises` does NOT advance such promises (Vite-transformed dynamic
  // import goes through additional asynchronicity that needs a real macrotask
  // — the dataLoader is pre-warmed in beforeAll so the import is cached, but
  // we still need to yield once to let the resolved value reach the reactive ref).
  await new Promise((resolve) => setTimeout(resolve, 0))
  await flushPromises()
  await nextTick()
  return wrapper
}

beforeAll(async () => {
  // Pre-warm dynamic import so the first test does not pay the cold-start
  // cost (which can exceed the single setTimeout(0) tick in mountChapter).
  for (const entry of chapters) {
    await entry.dataLoader()
  }
})

beforeEach(() => {
  localStorage.clear()
  vi.spyOn(window, 'scrollTo').mockImplementation(() => {})
  vi.spyOn(window, 'scrollY', 'get').mockReturnValue(0)
  ;(globalThis as unknown as { IntersectionObserver: typeof MockIntersectionObserver }).IntersectionObserver =
    MockIntersectionObserver
})

describe('ChapterView (id="ch1") — scene blocks', () => {
  it('renders 15 scene blocks', async () => {
    const wrapper = await mountChapter('ch1')
    expect(wrapper.findAll('[data-testid^="scene-"]').length).toBe(15)
  })

  it('scene-01 has bilingual title 凌晨出發 / An early start', async () => {
    const wrapper = await mountChapter('ch1')
    const scene = wrapper.find('[data-testid="scene-01"]')
    expect(scene.text()).toContain('凌晨出發')
    expect(scene.text()).toContain('An early start')
  })
})

describe('ChapterView (id="ch1") — explanation card anchor ids', () => {
  it('has id="vocab-layover"', async () => {
    const wrapper = await mountChapter('ch1')
    expect(wrapper.find('#vocab-layover').exists()).toBe(true)
  })

  it('has id="vocab-to-have-had"', async () => {
    const wrapper = await mountChapter('ch1')
    expect(wrapper.find('#vocab-to-have-had').exists()).toBe(true)
  })

  it('has id="vocab-used-to"', async () => {
    const wrapper = await mountChapter('ch1')
    expect(wrapper.find('#vocab-used-to').exists()).toBe(true)
  })

  it('has id="vocab-bring-back"', async () => {
    const wrapper = await mountChapter('ch1')
    expect(wrapper.find('#vocab-bring-back').exists()).toBe(true)
  })
})

describe('ChapterView (id="ch1") — WordTag count', () => {
  it('renders at least 60 WordTag components', async () => {
    const wrapper = await mountChapter('ch1')
    expect(wrapper.findAll('[data-testid="word-tag"]').length).toBeGreaterThanOrEqual(60)
  })
})

describe('ChapterView (id="ch1") — underlined vocab', () => {
  it('article text contains underlined words', async () => {
    const wrapper = await mountChapter('ch1')
    expect(wrapper.findAll('[data-target]').length).toBeGreaterThan(0)
  })
})

describe('ChapterView (id="ch1") — sentence breakdown cards', () => {
  it('renders at least 29 sentence breakdown cards', async () => {
    const wrapper = await mountChapter('ch1')
    expect(wrapper.findAll('[data-testid="sentence-breakdown"]').length).toBeGreaterThanOrEqual(29)
  })
})

describe('ChapterView (id="ch1") — section anchor ids', () => {
  it('has exactly one section with id="ch1-section-bilingual"', async () => {
    const wrapper = await mountChapter('ch1')
    expect(wrapper.findAll('#ch1-section-bilingual').length).toBe(1)
  })

  it('has exactly one section with id="ch1-section-vocabulary"', async () => {
    const wrapper = await mountChapter('ch1')
    expect(wrapper.findAll('#ch1-section-vocabulary').length).toBe(1)
  })

  it('has exactly one section with id="ch1-section-phrases"', async () => {
    const wrapper = await mountChapter('ch1')
    expect(wrapper.findAll('#ch1-section-phrases').length).toBe(1)
  })

  it('has exactly one section with id="ch1-section-breakdown"', async () => {
    const wrapper = await mountChapter('ch1')
    expect(wrapper.findAll('#ch1-section-breakdown').length).toBe(1)
  })

  it('ch1-section-bilingual contains the bilingual scene blocks', async () => {
    const wrapper = await mountChapter('ch1')
    const section = wrapper.find('#ch1-section-bilingual')
    expect(section.text()).toContain('中英對照全文')
    expect(section.findAll('[data-testid^="scene-"]').length).toBe(15)
  })

  it('ch1-section-vocabulary contains the vocabulary header', async () => {
    const wrapper = await mountChapter('ch1')
    const section = wrapper.find('#ch1-section-vocabulary')
    expect(section.text()).toContain('重點單字')
  })

  it('ch1-section-phrases contains the phrases header', async () => {
    const wrapper = await mountChapter('ch1')
    const section = wrapper.find('#ch1-section-phrases')
    expect(section.text()).toContain('重點片語與慣用語')
  })

  it('ch1-section-breakdown contains the breakdown header', async () => {
    const wrapper = await mountChapter('ch1')
    const section = wrapper.find('#ch1-section-breakdown')
    expect(section.text()).toContain('句型解析')
  })
})

describe('ChapterView (id="ch1") — quick nav + back-to-top integration', () => {
  it('renders SectionQuickNav with 4 buttons in order 全文/單字/片語/句型', async () => {
    const wrapper = await mountChapter('ch1')
    const nav = wrapper.find('[data-testid="ch1-quick-nav"]')
    expect(nav.exists()).toBe(true)
    const buttons = nav.findAll('button')
    expect(buttons.length).toBe(4)
    expect(buttons[0].text()).toBe('全文')
    expect(buttons[1].text()).toBe('單字')
    expect(buttons[2].text()).toBe('片語')
    expect(buttons[3].text()).toBe('句型')
  })

  it('SectionQuickNav buttons target the 4 section ids derived from chapter id', async () => {
    const wrapper = await mountChapter('ch1')
    expect(wrapper.find('[data-testid="quick-nav-ch1-section-bilingual"]').exists()).toBe(true)
    expect(wrapper.find('[data-testid="quick-nav-ch1-section-vocabulary"]').exists()).toBe(true)
    expect(wrapper.find('[data-testid="quick-nav-ch1-section-phrases"]').exists()).toBe(true)
    expect(wrapper.find('[data-testid="quick-nav-ch1-section-breakdown"]').exists()).toBe(true)
  })

  it('renders BackToTopFab integration (quick nav is its anchor)', async () => {
    const wrapper = await mountChapter('ch1')
    expect(wrapper.find('[data-testid="ch1-quick-nav"]').exists()).toBe(true)
  })
})

describe('ChapterView (id="ch2") — dynamic sections (real data)', () => {
  it('quick nav has exactly 4 buttons: 全文, 單字, 片語, 句型', async () => {
    const wrapper = await mountChapter('ch2')
    const nav = wrapper.find('[data-testid="ch2-quick-nav"]')
    expect(nav.exists()).toBe(true)
    const buttons = nav.findAll('button')
    expect(buttons.length).toBe(4)
    expect(buttons[0].text()).toBe('全文')
    expect(buttons[1].text()).toBe('單字')
    expect(buttons[2].text()).toBe('片語')
    expect(buttons[3].text()).toBe('句型')
  })

  it('bilingual section IS in DOM', async () => {
    const wrapper = await mountChapter('ch2')
    expect(wrapper.find('#ch2-section-bilingual').exists()).toBe(true)
  })

  it('vocabulary section number=2, phrases=3, breakdown=4', async () => {
    const wrapper = await mountChapter('ch2')
    expect(wrapper.find('#ch2-section-vocabulary .font-fraunces.text-4xl').text()).toBe('2')
    expect(wrapper.find('#ch2-section-phrases .font-fraunces.text-4xl').text()).toBe('3')
    expect(wrapper.find('#ch2-section-breakdown .font-fraunces.text-4xl').text()).toBe('4')
  })

  it('renders 10 scene blocks', async () => {
    const wrapper = await mountChapter('ch2')
    expect(wrapper.findAll('[data-testid^="scene-"]').length).toBe(10)
  })

  it('header has no badge (empty headerLevelTag and headerTopicTag)', async () => {
    const wrapper = await mountChapter('ch2')
    expect(wrapper.find('header .bg-terracotta').exists()).toBe(false)
  })

  it('displays title 語言究竟是怎麼學會的', async () => {
    const wrapper = await mountChapter('ch2')
    expect(wrapper.text()).toContain('語言究竟是怎麼學會的')
  })
})

describe('ChapterView (id="ch3") — dynamic sections (real data)', () => {
  it('quick nav has exactly 3 buttons: 全文, 單字, 片語', async () => {
    const wrapper = await mountChapter('ch3')
    const nav = wrapper.find('[data-testid="ch3-quick-nav"]')
    expect(nav.exists()).toBe(true)
    const buttons = nav.findAll('button')
    expect(buttons.length).toBe(3)
    expect(buttons[0].text()).toBe('全文')
    expect(buttons[1].text()).toBe('單字')
    expect(buttons[2].text()).toBe('片語')
  })

  it('bilingual section IS in DOM', async () => {
    const wrapper = await mountChapter('ch3')
    expect(wrapper.find('#ch3-section-bilingual').exists()).toBe(true)
  })

  it('renders 10 scene blocks', async () => {
    const wrapper = await mountChapter('ch3')
    expect(wrapper.findAll('[data-testid^="scene-"]').length).toBe(10)
  })

  it('displays ch3 chapter title 傳統學習法為何無法帶來流暢', async () => {
    const wrapper = await mountChapter('ch3')
    expect(wrapper.text()).toContain('傳統學習法為何無法帶來流暢')
  })
})

describe('ChapterView — error states', () => {
  it('shows "找不到此章節" when id has no chapters config entry', async () => {
    const wrapper = await mountChapter('nonexistent-chapter')
    expect(wrapper.find('[data-testid="chapter-not-found"]').exists()).toBe(true)
    expect(wrapper.text()).toContain('找不到此章節')
  })

  it('does NOT render the chapter layout when not-found state is shown', async () => {
    const wrapper = await mountChapter('nonexistent-chapter')
    expect(wrapper.find('[data-testid^="scene-"]').exists()).toBe(false)
    expect(wrapper.find('[data-testid="ch1-quick-nav"]').exists()).toBe(false)
  })
})
