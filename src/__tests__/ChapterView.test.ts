import { describe, it, expect, beforeAll, beforeEach, vi } from 'vitest'
import { mount, flushPromises } from '@vue/test-utils'
import { createRouter, createMemoryHistory } from 'vue-router'
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { nextTick } from 'vue'
import ChapterView from '../modules/chapters/ChapterView.vue'
import ch2 from '../modules/chapters/data/ch2'
import ch3 from '../modules/chapters/data/ch3'
import type { ChapterData } from '../modules/chapters/types'
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

function normalizeForCoverage(text: string) {
  return text
    .replace(/<[^>]+>/g, ' ')
    .replace(/\r?\n/g, ' ')
    .replace(/\s+([.,!?;:])/g, '$1')
    .replace(/\s+/g, ' ')
    .trim()
    .toLowerCase()
}

const normalizedDiscussTranscript = normalizeForCoverage(
  readFileSync(resolve(process.cwd(), '_private/discuss.txt'), 'utf-8'),
)

const ch2LineBreakNormalizedSourceSignals = [
  'many of them ask the same question. They ask, "What grammar should I study first?"',
  'They ask, "How many words should I memorize?"',
  'Think about driving a car. At first, it feels difficult. You think about every action, but after repetition, you drive without thinking. Speaking English works the same way.',
]

const ch3LineBreakNormalizedSourceSignals = [
  'English learners face every day. It is not grammar. It is not vocabulary. It is hesitation',
  'The goal is not perfect English. The goal is clear communication',
]

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

function chapterEnglishText(chapter: ChapterData) {
  return normalizeForCoverage(
    chapter.scenes
      .flatMap((scene) => scene.sentences.map((sentence) => sentence.en))
      .join(' '),
  )
}

function expectContentToIncludeAll(text: string, snippets: string[]) {
  for (const snippet of snippets) {
    expect(text).toContain(snippet.toLowerCase())
  }
}

function expectContentToExcludeAll(text: string, snippets: string[]) {
  for (const snippet of snippets) {
    expect(text).not.toContain(snippet.toLowerCase())
  }
}

function expectOccurrenceCountAtLeast(text: string, snippet: string, expectedCount: number) {
  const normalizedSnippet = snippet.toLowerCase()
  let count = 0
  let index = text.indexOf(normalizedSnippet)

  while (index !== -1) {
    count += 1
    index = text.indexOf(normalizedSnippet, index + normalizedSnippet.length)
  }

  expect(count).toBeGreaterThanOrEqual(expectedCount)
}

describe('ChapterView (id="ch2") content coverage', () => {
  it('checks omission-prone signals against the line-break-normalized source transcript', () => {
    const text = chapterEnglishText(ch2)

    expectContentToIncludeAll(normalizedDiscussTranscript, ch2LineBreakNormalizedSourceSignals)
    expectContentToIncludeAll(text, ch2LineBreakNormalizedSourceSignals)
  })

  it('keeps the corrected listening-first learning ideas', () => {
    const text = chapterEnglishText(ch2)

    expectContentToIncludeAll(text, [
      'many of them ask the same question. They ask, "What grammar should I study first?"',
      'They ask, "How many words should I memorize?"',
      'How many words should I memorize?',
      'Listening is the real beginning of language learning',
      'Your brain does not need full understanding to learn',
      'You are learning where words begin and where they end',
      'Speaking does not come from perfection',
      'This is why shadowing practice is powerful',
      'Understanding always comes before fluency',
      'Passive learning means learning without effort',
      'Later, when you want to speak, your mouth uses what your ears already know',
      'You are not translating. You are not thinking about rules. You are simply expressing ideas',
      'languages are not learned by force',
      'Nobody corrects them all the time. Nobody tells them to stop. They are allowed to try',
      'When you repeat something many times, it becomes lighter. It becomes easier. It becomes automatic',
      'You think about every action, but after repetition, you drive without thinking',
      'Memory is faster than thinking',
      'Many learners ask, "How many times should I repeat?"',
      'Repeat short sentences. Repeat easy sentences. Repeat sentences you hear often',
      'Do not chase difficult words. Do not chase advanced grammar',
      'Slow speaking is confident speaking',
      'You control your voice. You control your breath. You control your message',
      'Speaking is not a test. It is a habit, and habits are built through repetition',
      'They hear conversations. They hear stories. They hear questions',
      'They are not failing. They are preparing',
      'At first, English sounds fast. Words feel mixed together. Nothing feels clear',
      'Grammar books cannot teach this feeling. Only listening can',
      'You are not listening to memorize. You are listening to feel the language',
      'Active study has value, but it is not enough',
      'You are not afraid of English sounds anymore. They feel normal',
      'Even partial understanding is useful',
      'Listening is preparation. Understanding is preparation',
      'You are learning even when you feel silent. You are growing even when you feel slow',
      'Everyone learns at a different speed. Your journey is your own',
    ])
  })

  it('does not keep known raw subtitle fragments', () => {
    const text = chapterEnglishText(ch2)

    expectContentToExcludeAll(text, [
      'fram repeating more',
      'habits are built t proof repetition',
      'The I push themselves',
      'You are not afraid of English. H sounds anymore',
    ])
  })
})

describe('ChapterView (id="ch3") content coverage', () => {
  it('checks repeated signals against the line-break-normalized source transcript', () => {
    const text = chapterEnglishText(ch3)

    expectContentToIncludeAll(normalizedDiscussTranscript, ch3LineBreakNormalizedSourceSignals)
    expectContentToIncludeAll(text, ch3LineBreakNormalizedSourceSignals)
    expectOccurrenceCountAtLeast(
      normalizedDiscussTranscript,
      'English learners face every day. It is not grammar. It is not vocabulary. It is hesitation',
      2,
    )
  })

  it('keeps the corrected fluency practice ideas', () => {
    const text = chapterEnglishText(ch3)

    expectContentToIncludeAll(text, [
      'Traditional study teaches knowledge',
      'Fluency requires skill',
      'Slow podcasts remove this pressure',
      'Speaking must be trained directly',
      'When you shadow, your brain does not translate. It reacts',
      'This hesitation happens because your brain is searching for the perfect sentence',
      'The goal is not perfect English. The goal is clear communication',
      '10 minutes every day is more powerful than 2 hours once a week',
      'Another problem with traditional study is that it separates skills',
      'Conversation practice trains speaking in context',
      'Slow English podcasts are powerful because they slow down the process without slowing progress',
      'It moves too fast. It introduces new topics before the old ones become comfortable',
      'Conversation-based podcast practice goes deeper',
      'Fluency grows when English becomes something you do, not something you think about',
      'Together, they train understanding and speaking at the same time',
      'Slow listening also builds patience',
      'When you control your pace, you control your confidence',
      'Consistency matters more than time. With daily practice, you will notice change',
      'You will speak with less hesitation. You will recognize phrases instantly. You will respond faster',
      'English begins to speak through you naturally, confidently, and without fear',
      'When you practice speaking daily, even for 5 minutes, your brain learns that speaking is safe',
      'Safety creates fluency. Shadowing also helps here',
      'Grammar improves naturally through exposure and practice. But during speaking, flow comes first',
      'So when you speak, let it be imperfect. Let it be slow. Let it be real',
      'Not tomorrow, not someday, but right now',
      'One reason many learners stop improving is because they study in waves',
      'They study hard for one week. Then they stop for 2 weeks',
      'It prepares for it. Speaking becomes normal',
      'When you see yourself as an English speaker, your behavior changes',
      'You take more risks. You speak more often. You stop waiting for permission',
      'A calm mind is also important. Stress blocks language. Relaxation opens it',
      'Slow podcasts, simple conversations, gentle repetition',
    ])

    expectOccurrenceCountAtLeast(
      text,
      "Now, let's talk about a problem many English learners face every day",
      2,
    )
    expectOccurrenceCountAtLeast(
      text,
      'The goal is not perfect English. The goal is clear communication',
      2,
    )
  })

  it('does not keep known raw subtitle fragments', () => {
    const text = chapterEnglishText(ch3)

    expectContentToExcludeAll(text, [
      'new M. Oments',
      'PF ect sentence',
      'This builds C confidence',
      'S Oh. When you speak',
      'each time me you continue speaking',
      'Slow podcast. TS simple conversations',
      'next. T part',
      'fear fades when you speak. Anyway',
    ])
  })
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
