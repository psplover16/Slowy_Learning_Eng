import { describe, it, expect, beforeEach } from 'vitest'
import { useMissHoneyCompletion } from '../modules/home/composables/useMissHoneyCompletion'

describe('useMissHoneyCompletion', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  it('isCompleted returns false initially', () => {
    const { isCompleted } = useMissHoneyCompletion()
    expect(isCompleted('aBcDe12345')).toBe(false)
  })

  it('toggleCompletion sets completion to true', () => {
    const { toggleCompletion, isCompleted } = useMissHoneyCompletion()
    toggleCompletion('aBcDe12345')
    expect(isCompleted('aBcDe12345')).toBe(true)
  })

  it('toggleCompletion toggles back to false', () => {
    const { toggleCompletion, isCompleted } = useMissHoneyCompletion()
    toggleCompletion('aBcDe12345')
    toggleCompletion('aBcDe12345')
    expect(isCompleted('aBcDe12345')).toBe(false)
  })

  it('persists completion state under slowy:miss-honey-completion', () => {
    const { toggleCompletion } = useMissHoneyCompletion()
    toggleCompletion('aBcDe12345')
    const stored = JSON.parse(localStorage.getItem('slowy:miss-honey-completion') ?? '{}')
    expect(stored['aBcDe12345']).toBe(true)
  })

  it('restores state from localStorage on init', () => {
    localStorage.setItem('slowy:miss-honey-completion', JSON.stringify({ aBcDe12345: true }))
    const { isCompleted } = useMissHoneyCompletion()
    expect(isCompleted('aBcDe12345')).toBe(true)
  })

  it('storage key isolation: does not read from slowy:completion', () => {
    localStorage.setItem('slowy:completion', JSON.stringify({ aBcDe12345: true }))
    const { isCompleted } = useMissHoneyCompletion()
    expect(isCompleted('aBcDe12345')).toBe(false)
  })

  it('does not affect other video ids', () => {
    const { toggleCompletion, isCompleted } = useMissHoneyCompletion()
    toggleCompletion('aBcDe12345')
    expect(isCompleted('fGhIj67890')).toBe(false)
  })

  it('recovers from corrupt JSON in localStorage without throwing', () => {
    localStorage.setItem('slowy:miss-honey-completion', 'NOT_VALID_JSON')
    expect(() => useMissHoneyCompletion()).not.toThrow()
    const { isCompleted } = useMissHoneyCompletion()
    expect(isCompleted('aBcDe12345')).toBe(false)
  })

  it('completionMap reflects current toggle state', () => {
    const { toggleCompletion, completionMap } = useMissHoneyCompletion()
    expect(completionMap['aBcDe12345']).toBeFalsy()
    toggleCompletion('aBcDe12345')
    expect(completionMap['aBcDe12345']).toBe(true)
  })
})
