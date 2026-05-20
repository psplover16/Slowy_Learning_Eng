import { describe, it, expect } from 'vitest'
import { normalizeBasePath } from '../../vite.config'

describe('normalizeBasePath', () => {
  const cases: Array<{ label: string; input: string | undefined | null; expected: string }> = [
    { label: 'undefined', input: undefined, expected: '/' },
    { label: 'null', input: null, expected: '/' },
    { label: 'empty string', input: '', expected: '/' },
    { label: 'whitespace only', input: '   ', expected: '/' },
    { label: '"/"', input: '/', expected: '/' },
    { label: 'no leading or trailing slash', input: 'Slowy_Learning_Eng', expected: '/Slowy_Learning_Eng/' },
    { label: 'leading slash only', input: '/Slowy_Learning_Eng', expected: '/Slowy_Learning_Eng/' },
    { label: 'trailing slash only', input: 'Slowy_Learning_Eng/', expected: '/Slowy_Learning_Eng/' },
    { label: 'production', input: '/Slowy_Learning_Eng/', expected: '/Slowy_Learning_Eng/' },
    { label: 'staging', input: '/Slowy_Learning_Eng/staging/', expected: '/Slowy_Learning_Eng/staging/' },
    { label: 'multi-segment without slashes', input: 'Slowy_Learning_Eng/staging', expected: '/Slowy_Learning_Eng/staging/' },
  ]

  for (const { label, input, expected } of cases) {
    it(`normalizes ${label} → ${expected}`, () => {
      expect(normalizeBasePath(input)).toBe(expected)
    })
  }

  it('does not collapse interior duplicate slashes (caller error passes through)', () => {
    expect(normalizeBasePath('//foo//')).toBe('//foo//')
  })

  it('is deterministic and side-effect-free (multiple calls yield the same value)', () => {
    const a = normalizeBasePath('/Slowy_Learning_Eng/')
    const b = normalizeBasePath('/Slowy_Learning_Eng/')
    expect(a).toBe(b)
    expect(a).toBe('/Slowy_Learning_Eng/')
  })
})
