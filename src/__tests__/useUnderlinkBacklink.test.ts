import { describe, it, expect, beforeEach, vi } from 'vitest'
import { useUnderlinkBacklink } from '../shared/composables/useUnderlinkBacklink'

describe('useUnderlinkBacklink', () => {
  beforeEach(() => {
    // Reset window.scrollY mock
    Object.defineProperty(window, 'scrollY', { value: 0, writable: true, configurable: true })
    vi.spyOn(window, 'scrollTo').mockImplementation(() => {})

    // Stub getElementById
    vi.spyOn(document, 'getElementById').mockImplementation((id) => {
      const el = document.createElement('div')
      el.id = id
      el.scrollIntoView = vi.fn()
      return el
    })
  })

  it('sourceScrollY is null initially (FAB hidden)', () => {
    const { sourceScrollY } = useUnderlinkBacklink()
    expect(sourceScrollY.value).toBeNull()
  })

  it('triggerScroll saves current window.scrollY', () => {
    Object.defineProperty(window, 'scrollY', { value: 840, writable: true, configurable: true })
    const { sourceScrollY, triggerScroll } = useUnderlinkBacklink()
    triggerScroll('vocab-layover')
    expect(sourceScrollY.value).toBe(840)
  })

  it('returnToSource scrolls to saved Y and clears sourceScrollY', () => {
    Object.defineProperty(window, 'scrollY', { value: 840, writable: true, configurable: true })
    const { sourceScrollY, triggerScroll, returnToSource } = useUnderlinkBacklink()
    triggerScroll('vocab-layover')
    returnToSource()
    expect(window.scrollTo).toHaveBeenCalledWith({ top: 840, behavior: 'smooth' })
    expect(sourceScrollY.value).toBeNull()
  })

  it('second triggerScroll overwrites savedScrollY', () => {
    Object.defineProperty(window, 'scrollY', { value: 840, writable: true, configurable: true })
    const { sourceScrollY, triggerScroll } = useUnderlinkBacklink()
    triggerScroll('vocab-layover')
    Object.defineProperty(window, 'scrollY', { value: 1500, writable: true, configurable: true })
    triggerScroll('vocab-scammed')
    expect(sourceScrollY.value).toBe(1500)
  })

  it('each word records its own scrollY (1200 and 1240 separately)', () => {
    const { sourceScrollY, triggerScroll, returnToSource } = useUnderlinkBacklink()

    Object.defineProperty(window, 'scrollY', { value: 1200, writable: true, configurable: true })
    triggerScroll('vocab-scammed')
    returnToSource()
    expect(window.scrollTo).toHaveBeenCalledWith({ top: 1200, behavior: 'smooth' })
    expect(sourceScrollY.value).toBeNull()

    Object.defineProperty(window, 'scrollY', { value: 1240, writable: true, configurable: true })
    triggerScroll('vocab-scammed')
    returnToSource()
    expect(window.scrollTo).toHaveBeenLastCalledWith({ top: 1240, behavior: 'smooth' })
  })
})
