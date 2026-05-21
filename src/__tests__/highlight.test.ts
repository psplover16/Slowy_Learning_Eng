import { describe, it, expect } from 'vitest'
import { hl } from '../modules/chapters/utils/highlight'

describe('hl helper', () => {
  it('returns a span containing the data-target attribute', () => {
    const result = hl('head to', 'vocab-head-to')
    expect(result).toContain('data-target="vocab-head-to"')
  })

  it('preserves the text content verbatim inside the span', () => {
    const result = hl('head to', 'vocab-head-to')
    expect(result).toContain('>head to</span>')
  })

  it('produces the exact expected markup', () => {
    const result = hl('head to', 'vocab-head-to')
    expect(result).toBe(
      '<span data-target="vocab-head-to" class="underline decoration-terracotta underline-offset-2 cursor-pointer hover:text-terracotta transition-colors">head to</span>',
    )
  })

  it('does not escape text — passing through HTML-like characters as-is', () => {
    const result = hl('<strong>x</strong>', 'vocab-x')
    expect(result).toContain('<strong>x</strong>')
  })
})
