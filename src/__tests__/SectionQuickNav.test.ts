import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import SectionQuickNav from '../shared/components/SectionQuickNav.vue'

beforeEach(() => {
  document.body.innerHTML = ''
})

describe('SectionQuickNav', () => {
  it('renders one button per section with matching label and data-testid', () => {
    const sections = [
      { id: 'a', label: 'Alpha' },
      { id: 'b', label: 'Beta' },
    ]
    const wrapper = mount(SectionQuickNav, { props: { sections } })
    const buttons = wrapper.findAll('button')
    expect(buttons.length).toBe(2)
    expect(buttons[0].text()).toBe('Alpha')
    expect(buttons[1].text()).toBe('Beta')
    expect(wrapper.find('[data-testid="quick-nav-a"]').exists()).toBe(true)
    expect(wrapper.find('[data-testid="quick-nav-b"]').exists()).toBe(true)
  })

  it('clicking a button calls scrollIntoView on the target with smooth behavior', async () => {
    const target = document.createElement('div')
    target.id = 'target-section'
    const scrollSpy = vi.fn()
    target.scrollIntoView = scrollSpy
    document.body.appendChild(target)

    const sections = [{ id: 'target-section', label: 'T' }]
    const wrapper = mount(SectionQuickNav, { props: { sections } })
    await wrapper.find('[data-testid="quick-nav-target-section"]').trigger('click')
    expect(scrollSpy).toHaveBeenCalledWith({ behavior: 'smooth', block: 'start' })
  })

  it('clicking when target id does not exist is a silent no-op (no throw)', async () => {
    const sections = [{ id: 'missing-id', label: 'X' }]
    const wrapper = mount(SectionQuickNav, { props: { sections } })
    await expect(
      wrapper.find('[data-testid="quick-nav-missing-id"]').trigger('click'),
    ).resolves.not.toThrow()
  })

  it('exposes rootEl ref via defineExpose pointing to the root element', () => {
    const sections = [{ id: 'a', label: 'A' }]
    const wrapper = mount(SectionQuickNav, { props: { sections } })
    const vm = wrapper.vm as unknown as { rootEl: HTMLElement | null }
    expect(vm.rootEl).toBeTruthy()
    expect(vm.rootEl).toBe(wrapper.element)
  })

  it('root container has neither sticky nor fixed positioning class', () => {
    const sections = [{ id: 'a', label: 'A' }]
    const wrapper = mount(SectionQuickNav, { props: { sections } })
    const rootClasses = wrapper.element.className
    expect(rootClasses).not.toContain('sticky')
    expect(rootClasses).not.toContain('fixed')
  })

  it('renders the data-testid="ch1-quick-nav" attribute on the root', () => {
    const sections = [{ id: 'a', label: 'A' }]
    const wrapper = mount(SectionQuickNav, { props: { sections } })
    expect(wrapper.find('[data-testid="ch1-quick-nav"]').exists()).toBe(true)
  })
})
