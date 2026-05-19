import { describe, it, expect, beforeEach } from 'vitest'
import { useCompletion } from '../modules/home/composables/useCompletion'

describe('useCompletion', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  it('isCompleted returns false initially', () => {
    const { isCompleted } = useCompletion()
    expect(isCompleted('ch1')).toBe(false)
  })

  it('toggleCompletion sets completion to true', () => {
    const { toggleCompletion, isCompleted } = useCompletion()
    toggleCompletion('ch1')
    expect(isCompleted('ch1')).toBe(true)
  })

  it('toggleCompletion toggles back to false', () => {
    const { toggleCompletion, isCompleted } = useCompletion()
    toggleCompletion('ch1')
    toggleCompletion('ch1')
    expect(isCompleted('ch1')).toBe(false)
  })

  it('persists completion state in localStorage under slowy:completion', () => {
    const { toggleCompletion } = useCompletion()
    toggleCompletion('ch1')
    const stored = JSON.parse(localStorage.getItem('slowy:completion') ?? '{}')
    expect(stored['ch1']).toBe(true)
  })

  it('restores state from localStorage on init', () => {
    localStorage.setItem('slowy:completion', JSON.stringify({ ch1: true }))
    const { isCompleted } = useCompletion()
    expect(isCompleted('ch1')).toBe(true)
  })

  it('does not affect other chapter ids', () => {
    const { toggleCompletion, isCompleted } = useCompletion()
    toggleCompletion('ch1')
    expect(isCompleted('ch2')).toBe(false)
  })
})
