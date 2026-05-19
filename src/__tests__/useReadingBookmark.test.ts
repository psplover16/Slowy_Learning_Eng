import { describe, it, expect, beforeEach } from 'vitest'
import { useReadingBookmark } from '../shared/composables/useReadingBookmark'

describe('useReadingBookmark', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  it('getBookmark returns null when no bookmark set', () => {
    const { getBookmark } = useReadingBookmark()
    expect(getBookmark('ch1')).toBeNull()
  })

  it('setBookmark stores a paragraph id', () => {
    const { setBookmark, getBookmark } = useReadingBookmark()
    setBookmark('ch1', 'scene-04')
    expect(getBookmark('ch1')).toBe('scene-04')
  })

  it('setBookmark overwrites previous bookmark for same chapter', () => {
    const { setBookmark, getBookmark } = useReadingBookmark()
    setBookmark('ch1', 'scene-01')
    setBookmark('ch1', 'scene-07')
    expect(getBookmark('ch1')).toBe('scene-07')
  })

  it('persists bookmark in localStorage under slowy:bookmark', () => {
    const { setBookmark } = useReadingBookmark()
    setBookmark('ch1', 'scene-04')
    const stored = JSON.parse(localStorage.getItem('slowy:bookmark') ?? '{}')
    expect(stored['ch1']).toBe('scene-04')
  })

  it('restores bookmark from localStorage on init', () => {
    localStorage.setItem('slowy:bookmark', JSON.stringify({ ch1: 'scene-03' }))
    const { getBookmark } = useReadingBookmark()
    expect(getBookmark('ch1')).toBe('scene-03')
  })

  it('ch1 bookmark does not affect ch2', () => {
    const { setBookmark, getBookmark } = useReadingBookmark()
    setBookmark('ch1', 'scene-04')
    expect(getBookmark('ch2')).toBeNull()
  })
})
