import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import GrammarView from '../modules/grammar/views/GrammarView.vue'

function mountGrammar() {
  return mount(GrammarView)
}

describe('GrammarView', () => {
  it('renders without errors', () => {
    const wrapper = mountGrammar()
    expect(wrapper.exists()).toBe(true)
  })

  it('does not contain data-target attributes (no underline-vocab links)', () => {
    const wrapper = mountGrammar()
    expect(wrapper.findAll('[data-target]').length).toBe(0)
  })

  it('does not contain vocab- prefixed ids (no article explanation cards)', () => {
    const wrapper = mountGrammar()
    const html = wrapper.html()
    expect(html).not.toMatch(/id="vocab-/)
  })

  it('renders at least 2 grammar containers', () => {
    const wrapper = mountGrammar()
    expect(wrapper.findAll('[data-testid="grammar-card"]').length).toBeGreaterThanOrEqual(2)
  })

  // --- reorder-grammar-by-pedagogy ---

  it('orders grammar cards into the pedagogical sequence (G01–G07, G19, G08–G18)', () => {
    const wrapper = mountGrammar()
    const cards = wrapper.findAll('[data-testid="grammar-card"]')
    const titles = cards.map((card) => {
      const h3 = card.find('h3')
      // The h3 contains a <span> with the badge plus the title text. We want the
      // visible title text only (badge stripped).
      const badgeSpan = h3.find('span')
      const fullText = h3.text()
      const badgeText = badgeSpan.exists() ? badgeSpan.text() : ''
      return fullText.replace(badgeText, '').trim()
    })

    expect(titles).toEqual([
      '英語常見詞性',
      '名詞片語 Noun Phrase',
      '關係子句 Relative Clause',
      '分詞片語 Participial Phrase',
      'used to + V　過去曾經……',
      '現在完成式 vs 現在完成進行式',
      '不定詞完成式 to have + V-pp',
      '三種自然未來式：going to / 現在進行式 / will',
      '介系詞後面一定接 V-ing（動名詞）',
      'while ＋ V-ing　同時進行',
      'for ＋ 時間長度　持續多久',
      'if 的雙重用法：如果 vs 是否',
      'so that　目的／結果子句',
      '使役動詞 make / have / get / let',
      'get 的各種用法',
      'like 的全用法',
      'prefer 偏好表達',
      'ever 的語氣加強用法',
      'just as...as　同等比較',
    ])
  })

  it('renders exactly 7 thematic section headers with the expected text', () => {
    const wrapper = mountGrammar()
    const headers = wrapper.findAll('[data-testid="grammar-section-header"]')
    expect(headers).toHaveLength(7)
    const headerTexts = headers.map((h) => h.text())
    expect(headerTexts).toEqual([
      '1. 詞類基礎',
      '2. 名詞片語家族',
      '3. 動詞時態',
      '4. V-ing 後接慣例',
      '5. 從屬子句與時間',
      '6. 多功能動詞',
      '7. 語氣與比較',
    ])
  })

  it('numbers grammar card badges G01–G07, G19, G08–G18 in display order', () => {
    const wrapper = mountGrammar()
    const cards = wrapper.findAll('[data-testid="grammar-card"]')
    const badges = cards.map((card) => {
      const span = card.find('h3 span')
      return span.text()
    })
    expect(badges).toEqual([
      'G01', 'G02', 'G03', 'G04', 'G05', 'G06',
      'G07', 'G19', 'G08', 'G09', 'G10', 'G11',
      'G12', 'G13', 'G14', 'G15', 'G16', 'G17', 'G18',
    ])
  })

  it('conservatively supplements the existing Relative Clause card with a MissHoney example', () => {
    const wrapper = mountGrammar()
    const cards = wrapper.findAll('[data-testid="grammar-card"]')
    const relativeClauseCard = cards.find(card => card.text().includes('關係子句 Relative Clause'))

    expect(relativeClauseCard?.text()).toContain('beginners who want to practice listening to English')
    expect(cards.filter(card => card.text().includes('關係子句 Relative Clause'))).toHaveLength(1)
  })

  it('does not create a new grammar card for uncertain MissHoney grammar points', () => {
    const wrapper = mountGrammar()
    expect(wrapper.text()).not.toContain('This is + 名詞（MissHoney）')
    expect(wrapper.findAll('[data-testid="grammar-card"]')).toHaveLength(19)
  })

  it('conservatively includes clear A1 rollout grammar supplements in existing cards', () => {
    const wrapper = mountGrammar()
    const text = wrapper.text()

    expect(text).toContain('I used to live in Nebraska, United States.')
    expect(text).toContain('Do you like listening to music while trying to sleep?')
    expect(text).toContain('If I ever need to vent, I can always talk to my friends.')
    expect(text).toContain('I got my nails done.')
    expect(wrapper.findAll('[data-testid="grammar-card"]')).toHaveLength(19)
  })
})
