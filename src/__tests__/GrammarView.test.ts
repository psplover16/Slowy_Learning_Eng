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
})
