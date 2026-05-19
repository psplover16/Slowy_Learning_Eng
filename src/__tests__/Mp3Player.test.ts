import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import Mp3Player from '../shared/components/Mp3Player.vue'

describe('Mp3Player', () => {
  it('does not render when mp3Src is null', () => {
    const wrapper = mount(Mp3Player, { props: { mp3Src: null } })
    expect(wrapper.find('audio').exists()).toBe(false)
    expect(wrapper.find('[data-testid="mp3-player"]').exists()).toBe(false)
  })

  it('does not render when mp3Src is empty string', () => {
    const wrapper = mount(Mp3Player, { props: { mp3Src: '' } })
    expect(wrapper.find('[data-testid="mp3-player"]').exists()).toBe(false)
  })

  it('renders player when mp3Src is provided', () => {
    const wrapper = mount(Mp3Player, { props: { mp3Src: '/audio/ch1.mp3' } })
    expect(wrapper.find('[data-testid="mp3-player"]').exists()).toBe(true)
  })

  it('has loop enabled by default', () => {
    const wrapper = mount(Mp3Player, { props: { mp3Src: '/audio/ch1.mp3' } })
    const audio = wrapper.find('audio')
    expect(audio.element.loop).toBe(true)
  })

  it('renders play/pause, +5s, +10s buttons', () => {
    const wrapper = mount(Mp3Player, { props: { mp3Src: '/audio/ch1.mp3' } })
    expect(wrapper.find('[data-testid="btn-play"]').exists()).toBe(true)
    expect(wrapper.find('[data-testid="btn-skip5"]').exists()).toBe(true)
    expect(wrapper.find('[data-testid="btn-skip10"]').exists()).toBe(true)
  })
})
