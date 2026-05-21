import { describe, it, expect } from 'vitest'
import ch1 from '../modules/chapters/data/ch1'
import type { ChapterData } from '../modules/chapters/types'

describe('chapter data module — ch1', () => {
  it('has all required ChapterData fields', () => {
    const data: ChapterData = ch1
    expect(typeof data.headerTitleZh).toBe('string')
    expect(typeof data.headerTitleEn).toBe('string')
    expect(typeof data.headerPodcastLabel).toBe('string')
    expect(typeof data.headerLevelTag).toBe('string')
    expect(typeof data.headerTopicTag).toBe('string')
    expect(Array.isArray(data.scenes)).toBe(true)
    expect(Array.isArray(data.vocabGroups)).toBe(true)
    expect(Array.isArray(data.phrases)).toBe(true)
    expect(Array.isArray(data.breakdowns)).toBe(true)
  })

  it('contains the expected counts of each content array', () => {
    expect(ch1.scenes.length).toBe(15)
    expect(ch1.vocabGroups.length).toBe(6)
    expect(ch1.phrases.length).toBe(12)
    expect(ch1.breakdowns.length).toBeGreaterThanOrEqual(29)
  })

  it('first scene has id "scene-01"', () => {
    expect(ch1.scenes[0].id).toBe('scene-01')
  })

  it('serialized data contains all expected underlined-word anchor target ids', () => {
    const serialized = JSON.stringify(ch1)
    expect(serialized).toContain('vocab-layover')
    expect(serialized).toContain('vocab-to-have-had')
    expect(serialized).toContain('vocab-used-to')
    expect(serialized).toContain('vocab-bring-back')
  })

  it('phrases array contains vocab-bring-back entry', () => {
    expect(ch1.phrases.find((p) => p.id === 'vocab-bring-back')).toBeTruthy()
  })

  it('mp3Src is null (no audio file yet for ch1)', () => {
    expect(ch1.mp3Src).toBeNull()
  })
})
