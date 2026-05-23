// @vitest-environment node
import { describe, it, expect } from 'vitest'
import {
  buildScaffold,
  validatePlaylistVideoData,
  planPromotionPaths,
  countLevelCoverage,
} from '../../scripts/misshoney/content-core.mjs'

// Minimal valid PlaylistVideoData fixture
function makeValidContent(overrides = {}) {
  return {
    videoId: 'aBcDe12345',
    slug: 'ch1-nice-to-meet-you',
    level: 'a1',
    title: 'Nice to Meet You',
    youtubeUrl: 'https://www.youtube.com/watch?v=aBcDe12345',
    scenes: [
      {
        id: 'scene-01',
        sentences: [{ en: 'Hello, nice to meet you.', tc: '你好，很高興認識你。' }],
      },
    ],
    vocabGroups: [
      {
        label: 'Greetings',
        items: [{ word: 'hello', pos: 'interjection', meaning: '你好', highlight: true }],
      },
    ],
    phrases: [
      {
        id: 'phrase-01',
        phrase: 'nice to meet you',
        meaning: '很高興認識你',
        examples: [
          { en: 'Nice to meet you, too!', tc: '我也很高興認識你！' },
        ],
      },
    ],
    ...overrides,
  }
}

describe('buildScaffold', () => {
  const transcript = {
    videoId: 'aBcDe12345',
    slug: 'ch1-nice-to-meet-you',
    level: 'a1',
    title: 'Nice to Meet You',
    youtubeUrl: 'https://www.youtube.com/watch?v=aBcDe12345',
    transcriptText: 'Hello nice to meet you. How are you today?',
    cues: [
      { start: 0, end: 2, text: 'Hello nice to meet you.' },
      { start: 2, end: 4, text: 'How are you today?' },
    ],
  }

  it('copies videoId, slug, level, title, youtubeUrl from transcript', () => {
    const scaffold = buildScaffold(transcript)
    expect(scaffold.videoId).toBe('aBcDe12345')
    expect(scaffold.slug).toBe('ch1-nice-to-meet-you')
    expect(scaffold.level).toBe('a1')
    expect(scaffold.title).toBe('Nice to Meet You')
    expect(scaffold.youtubeUrl).toBe('https://www.youtube.com/watch?v=aBcDe12345')
  })

  it('includes transcript text and source cues', () => {
    const scaffold = buildScaffold(transcript)
    expect(scaffold.transcriptText).toBe(transcript.transcriptText)
    expect(scaffold.cues).toEqual(transcript.cues)
  })

  it('includes suggested scene boundaries', () => {
    const scaffold = buildScaffold(transcript)
    expect(Array.isArray(scaffold.suggestedSceneBoundaries)).toBe(true)
  })

  it('does not include scenes, vocabGroups, or phrases (those are authoring)', () => {
    const scaffold = buildScaffold(transcript) as unknown as Record<string, unknown>
    expect(scaffold['scenes']).toBeUndefined()
    expect(scaffold['vocabGroups']).toBeUndefined()
    expect(scaffold['phrases']).toBeUndefined()
  })
})

describe('validatePlaylistVideoData', () => {
  it('returns valid for a complete content object', () => {
    const result = validatePlaylistVideoData(makeValidContent())
    expect(result.valid).toBe(true)
    expect(result.errors).toHaveLength(0)
  })

  it('reports missing videoId', () => {
    const content = makeValidContent({ videoId: '' })
    const result = validatePlaylistVideoData(content)
    expect(result.valid).toBe(false)
    expect(result.errors.some((e: string) => e.includes('videoId'))).toBe(true)
  })

  it('reports missing slug', () => {
    const content = makeValidContent({ slug: '' })
    const result = validatePlaylistVideoData(content)
    expect(result.valid).toBe(false)
    expect(result.errors.some((e: string) => e.includes('slug'))).toBe(true)
  })

  it('reports empty scenes array', () => {
    const content = makeValidContent({ scenes: [] })
    const result = validatePlaylistVideoData(content)
    expect(result.valid).toBe(false)
    expect(result.errors.some((e: string) => e.includes('scenes'))).toBe(true)
  })

  it('reports scene sentence with empty tc translation', () => {
    const content = makeValidContent({
      scenes: [{ id: 'scene-01', sentences: [{ en: 'Hello', tc: '' }] }],
    })
    const result = validatePlaylistVideoData(content)
    expect(result.valid).toBe(false)
    expect(result.errors.some((e: string) => e.includes('tc'))).toBe(true)
  })

  it('reports scene sentence with empty en text', () => {
    const content = makeValidContent({
      scenes: [{ id: 'scene-01', sentences: [{ en: '', tc: '你好' }] }],
    })
    const result = validatePlaylistVideoData(content)
    expect(result.valid).toBe(false)
    expect(result.errors.some((e: string) => e.includes('en'))).toBe(true)
  })

  it('reports empty vocabGroups array', () => {
    const content = makeValidContent({ vocabGroups: [] })
    const result = validatePlaylistVideoData(content)
    expect(result.valid).toBe(false)
    expect(result.errors.some((e: string) => e.includes('vocabGroups'))).toBe(true)
  })

  it('reports vocab item missing required fields', () => {
    const content = makeValidContent({
      vocabGroups: [{ label: 'Test', items: [{ word: '', pos: 'noun', meaning: '測試' }] }],
    })
    const result = validatePlaylistVideoData(content)
    expect(result.valid).toBe(false)
    expect(result.errors.some((e: string) => e.includes('word'))).toBe(true)
  })

  it('reports empty phrases array', () => {
    const content = makeValidContent({ phrases: [] })
    const result = validatePlaylistVideoData(content)
    expect(result.valid).toBe(false)
    expect(result.errors.some((e: string) => e.includes('phrases'))).toBe(true)
  })

  it('reports phrase with empty examples', () => {
    const content = makeValidContent({
      phrases: [{ id: 'p1', phrase: 'nice to meet you', meaning: '很高興認識你', examples: [] }],
    })
    const result = validatePlaylistVideoData(content)
    expect(result.valid).toBe(false)
    expect(result.errors.some((e: string) => e.includes('examples'))).toBe(true)
  })
})

describe('planPromotionPaths', () => {
  it('returns destination under src/modules/playlists/data/videos', () => {
    const paths = planPromotionPaths('a1', 'ch1-nice-to-meet-you')
    expect(paths.destination).toContain('src/modules/playlists/data/videos/a1')
    expect(paths.destination).toContain('ch1-nice-to-meet-you.json')
  })

  it('returns source from _private/misshoney/generated-content', () => {
    const paths = planPromotionPaths('a1', 'ch1-nice-to-meet-you')
    expect(paths.source).toContain('_private/misshoney/generated-content/a1')
    expect(paths.source).toContain('ch1-nice-to-meet-you.json')
  })
})

describe('countLevelCoverage', () => {
  it('reports coverage counts for a level', () => {
    const result = countLevelCoverage({
      level: 'a1',
      transcriptSlugs: ['ch1-hello', 'ch2-goodbye', 'ch3-thanks'],
      scaffoldSlugs: ['ch1-hello', 'ch2-goodbye'],
      generatedSlugs: ['ch1-hello'],
      promotedSlugs: ['ch1-hello'],
      skippedCount: 1,
    })
    expect(result.level).toBe('a1')
    expect(result.transcriptCount).toBe(3)
    expect(result.scaffoldCount).toBe(2)
    expect(result.generatedCount).toBe(1)
    expect(result.promotedCount).toBe(1)
    expect(result.skippedCount).toBe(1)
  })

  it('isComplete only when every transcript has been scaffolded, generated, and promoted', () => {
    const complete = countLevelCoverage({
      level: 'a1',
      transcriptSlugs: ['ch1-hello'],
      scaffoldSlugs: ['ch1-hello'],
      generatedSlugs: ['ch1-hello'],
      promotedSlugs: ['ch1-hello'],
      skippedCount: 0,
    })
    expect(complete.isComplete).toBe(true)

    const incomplete = countLevelCoverage({
      level: 'a1',
      transcriptSlugs: ['ch1-hello', 'ch2-world'],
      scaffoldSlugs: ['ch1-hello'],
      generatedSlugs: ['ch1-hello'],
      promotedSlugs: ['ch1-hello'],
      skippedCount: 0,
    })
    expect(incomplete.isComplete).toBe(false)
  })
})
