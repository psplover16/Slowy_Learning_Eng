import { describe, it, expect, beforeEach, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import { nextTick } from 'vue'
import BackToTopFab from '../shared/components/BackToTopFab.vue'

let observerCallback: ((entries: IntersectionObserverEntry[]) => void) | null = null
const mockObserve = vi.fn()
const mockUnobserve = vi.fn()
const mockDisconnect = vi.fn()

class MockIntersectionObserver {
  constructor(callback: (entries: IntersectionObserverEntry[]) => void) {
    observerCallback = callback
  }
  observe = mockObserve
  unobserve = mockUnobserve
  disconnect = mockDisconnect
}

function triggerVisibility(isIntersecting: boolean) {
  observerCallback?.([{ isIntersecting } as IntersectionObserverEntry])
}

beforeEach(() => {
  observerCallback = null
  mockObserve.mockClear()
  mockUnobserve.mockClear()
  mockDisconnect.mockClear()
  ;(globalThis as unknown as { IntersectionObserver: typeof MockIntersectionObserver }).IntersectionObserver =
    MockIntersectionObserver
  vi.spyOn(window, 'scrollTo').mockImplementation(() => {})
})

describe('BackToTopFab', () => {
  it('does not render FAB when anchorEl is null', () => {
    const wrapper = mount(BackToTopFab, { props: { anchorEl: null } })
    expect(wrapper.find('[data-testid="back-to-top-fab"]').exists()).toBe(false)
  })

  it('hides FAB when observer reports isIntersecting=true', async () => {
    const div = document.createElement('div')
    const wrapper = mount(BackToTopFab, { props: { anchorEl: div } })
    await nextTick()
    triggerVisibility(true)
    await nextTick()
    expect(wrapper.find('[data-testid="back-to-top-fab"]').exists()).toBe(false)
  })

  it('shows FAB when observer reports isIntersecting=false', async () => {
    const div = document.createElement('div')
    const wrapper = mount(BackToTopFab, { props: { anchorEl: div } })
    await nextTick()
    triggerVisibility(false)
    await nextTick()
    expect(wrapper.find('[data-testid="back-to-top-fab"]').exists()).toBe(true)
  })

  it('clicking FAB calls window.scrollTo({top:0, behavior:"smooth"})', async () => {
    const div = document.createElement('div')
    const wrapper = mount(BackToTopFab, { props: { anchorEl: div } })
    await nextTick()
    triggerVisibility(false)
    await nextTick()
    await wrapper.find('[data-testid="back-to-top-fab"]').trigger('click')
    expect(window.scrollTo).toHaveBeenCalledWith({ top: 0, behavior: 'smooth' })
  })

  it('offsetBottom=60 produces inline bottom style containing 1.5rem and 60px (calc form)', async () => {
    const div = document.createElement('div')
    const wrapper = mount(BackToTopFab, { props: { anchorEl: div, offsetBottom: 60 } })
    await nextTick()
    triggerVisibility(false)
    await nextTick()
    const style = wrapper.find('[data-testid="back-to-top-fab"]').attributes('style') ?? ''
    expect(style).toMatch(/bottom:\s*calc\(/)
    expect(style).toContain('1.5rem')
    expect(style).toContain('60px')
  })

  it('offsetBottom omitted defaults to bottom style containing 1.5rem and 0px (calc form)', async () => {
    const div = document.createElement('div')
    const wrapper = mount(BackToTopFab, { props: { anchorEl: div } })
    await nextTick()
    triggerVisibility(false)
    await nextTick()
    const style = wrapper.find('[data-testid="back-to-top-fab"]').attributes('style') ?? ''
    expect(style).toMatch(/bottom:\s*calc\(/)
    expect(style).toContain('1.5rem')
    expect(style).toContain('0px')
  })

  it('disconnects observer when component is unmounted', async () => {
    const div = document.createElement('div')
    const wrapper = mount(BackToTopFab, { props: { anchorEl: div } })
    await nextTick()
    wrapper.unmount()
    expect(mockDisconnect).toHaveBeenCalled()
  })
})
