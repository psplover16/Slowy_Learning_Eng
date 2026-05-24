import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import ArticleListItem from '../modules/home/components/ArticleListItem.vue'

describe('ArticleListItem — showCompletion prop', () => {
  const baseProps = { title: 'Test Article', completed: false }

  it('shows completion circle when showCompletion is not provided (default true)', () => {
    const wrapper = mount(ArticleListItem, { props: baseProps })
    expect(wrapper.find('[data-testid="completion-toggle"]').exists()).toBe(true)
  })

  it('shows completion circle when showCompletion is true', () => {
    const wrapper = mount(ArticleListItem, { props: { ...baseProps, showCompletion: true } })
    expect(wrapper.find('[data-testid="completion-toggle"]').exists()).toBe(true)
  })

  it('hides completion circle when showCompletion is false', () => {
    const wrapper = mount(ArticleListItem, { props: { ...baseProps, showCompletion: false } })
    expect(wrapper.find('[data-testid="completion-toggle"]').exists()).toBe(false)
  })

  it('still shows title when showCompletion is false', () => {
    const wrapper = mount(ArticleListItem, { props: { ...baseProps, showCompletion: false } })
    expect(wrapper.text()).toContain('Test Article')
  })

  it('still emits navigate when card is clicked with showCompletion false', async () => {
    const wrapper = mount(ArticleListItem, { props: { ...baseProps, showCompletion: false } })
    await wrapper.trigger('click')
    expect(wrapper.emitted('navigate')).toBeTruthy()
  })
})
