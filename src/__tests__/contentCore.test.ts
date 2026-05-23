// @vitest-environment node
import { describe, it, expect } from 'vitest'
import {
  buildScaffold,
  validatePlaylistVideoData,
  planPromotionPaths,
  countLevelCoverage,
  findPlaylistSourceUrl,
} from '../../scripts/misshoney/content-core.mjs'

// Minimal valid PlaylistVideoData fixture
function makeValidContent(overrides = {}) {
  return {
    videoId: 'aBcDe12345',
    slug: 'ch1-nice-to-meet-you',
    level: 'a1',
    title: 'Nice to Meet You',
    youtubeUrl: 'https://www.youtube.com/watch?v=aBcDe12345',
    header: {
      podcastLabel: 'MissHoney A1',
      titleZh: '很高興認識你',
      titleEn: 'Nice to Meet You',
      levelTag: 'A1',
      topicTag: 'Greetings',
    },
    scenes: [
      {
        id: 'scene-01',
        no: '01',
        titleZh: '第一次見面',
        titleEn: 'Meeting Someone',
        sentences: [{ en: 'Hello, nice to meet you.', tc: '你好，很高興認識你。' }],
        tags: [
          { english: 'hello', kk: '/həˈloʊ/', partOfSpeech: 'interj.', meaning: '你好', highlight: true },
        ],
      },
    ],
    vocabGroups: [
      {
        title: 'Greetings',
        items: [{ english: 'hello', kk: '/həˈloʊ/', partOfSpeech: 'interj.', meaning: '你好', highlight: true }],
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
    breakdowns: [
      {
        id: 'breakdown-01',
        sentence: 'Hello, nice to meet you.',
        translation: '你好，很高興認識你。',
        points: [
          { label: 'nice to meet you', text: 'nice to meet you', note: '第一次見面時常用。' },
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

  it('includes an authoring checklist and polished schema skeleton but no authored learning content', () => {
    const scaffold = buildScaffold(transcript) as unknown as Record<string, unknown>
    expect(scaffold['authoringChecklist']).toEqual(expect.arrayContaining([
      expect.stringContaining('Rebuild'),
    ]))
    expect(scaffold['polishedContentSkeleton']).toEqual(expect.objectContaining({
      header: expect.any(Object),
      scenes: expect.any(Array),
      vocabGroups: expect.any(Array),
      phrases: expect.any(Array),
      breakdowns: expect.any(Array),
    }))
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
      scenes: [{ id: 'scene-01', no: '01', titleZh: '測試', titleEn: 'Test', sentences: [{ en: 'Hello.', tc: '' }], tags: [] }],
    })
    const result = validatePlaylistVideoData(content)
    expect(result.valid).toBe(false)
    expect(result.errors.some((e: string) => e.includes('tc'))).toBe(true)
  })

  it('reports scene sentence with empty en text', () => {
    const content = makeValidContent({
      scenes: [{ id: 'scene-01', no: '01', titleZh: '測試', titleEn: 'Test', sentences: [{ en: '', tc: '你好' }], tags: [] }],
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
      vocabGroups: [{ title: 'Test', items: [{ english: '', kk: '/test/', partOfSpeech: 'n.', meaning: '測試' }] }],
    })
    const result = validatePlaylistVideoData(content)
    expect(result.valid).toBe(false)
    expect(result.errors.some((e: string) => e.includes('english'))).toBe(true)
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

  it('rejects the previous draft schema without header and breakdowns', () => {
    const result = validatePlaylistVideoData({
      videoId: 'aBcDe12345',
      slug: 'ch1-nice-to-meet-you',
      level: 'a1',
      title: 'Nice to Meet You',
      youtubeUrl: 'https://www.youtube.com/watch?v=aBcDe12345',
      scenes: [{ id: 'scene-01', sentences: [{ en: 'Hello nice to meet you.', tc: '你好，很高興認識你。' }] }],
      vocabGroups: [{ label: 'Greetings', items: [{ word: 'hello', pos: 'word', meaning: '你好' }] }],
      phrases: [{ id: 'phrase-01', phrase: 'nice to meet you', meaning: '很高興認識你', examples: [{ en: 'Nice to meet you.', tc: '很高興認識你。' }] }],
    })

    expect(result.valid).toBe(false)
    expect(result.errors).toEqual(expect.arrayContaining([
      expect.stringContaining('header'),
      expect.stringContaining('breakdowns'),
    ]))
  })

  it.each([
    ['Who want to learn Listening to English today\'s podcast is about my daily routine my daily.', false],
    ['Today I want to talk about my daily routine.', true],
    ['Your favorite dinner at 1100 p.m. I go to sleep I love sleeping I love feeling.', false],
  ])('validates cue fragment quality for "%s"', (sentence, expectedValid) => {
    const content = makeValidContent({
      scenes: [{
        id: 'scene-01',
        no: '01',
        titleZh: '測試',
        titleEn: 'Test',
        sentences: [{ en: sentence, tc: '這是自然的繁中翻譯。' }],
        tags: [],
      }],
    })

    expect(validatePlaylistVideoData(content).valid).toBe(expectedValid)
  })

  it('rejects copied English as Traditional Chinese translation', () => {
    const content = makeValidContent({
      scenes: [{
        id: 'scene-01',
        no: '01',
        titleZh: '測試',
        titleEn: 'Test',
        sentences: [{ en: 'Today I want to talk about breakfast.', tc: 'Today I want to talk about breakfast.' }],
        tags: [],
      }],
    })

    const result = validatePlaylistVideoData(content)
    expect(result.valid).toBe(false)
    expect(result.errors.some((error: string) => error.includes('translation'))).toBe(true)
  })

  it('rejects formulaic placeholder Traditional Chinese translations', () => {
    const content = makeValidContent({
      scenes: [{
        id: 'scene-01',
        no: '01',
        titleZh: '測試',
        titleEn: 'Test',
        sentences: [{
          en: 'Today I want to talk about my daily routine.',
          tc: '這句主要在談 daily routine，可以先掌握整句意思，再跟著英文練習。',
        }],
        tags: [],
      }],
    })

    const result = validatePlaylistVideoData(content)
    expect(result.valid).toBe(false)
    expect(result.errors.some((error: string) => error.includes('placeholder'))).toBe(true)
  })

  it('rejects dangling cue fragments that end with prepositions or question words', () => {
    const content = makeValidContent({
      scenes: [{
        id: 'scene-01',
        no: '01',
        titleZh: '測試',
        titleEn: 'Test',
        sentences: [{ en: 'Do you work with.', tc: '你和誰一起工作？' }],
        tags: [],
      }],
    })

    const result = validatePlaylistVideoData(content)
    expect(result.valid).toBe(false)
    expect(result.errors.some((error: string) => error.includes('cue fragment'))).toBe(true)
  })

  it.each([
    'In the morning.',
    'I wash my face and.',
    "I eat oatmeal every day it's.",
    'My favorite breakfast.',
    'They have a lot of sugar sugar makes.',
    'You fat but sugar is also very delicious.',
    'We have them all Mexican food is very diverse but I think.',
    'I live in Mexico in Mexico.',
  ])('rejects short connective fragments for "%s"', (sentence) => {
    const content = makeValidContent({
      scenes: [{
        id: 'scene-01',
        no: '01',
        titleZh: '測試',
        titleEn: 'Test',
        sentences: [{ en: sentence, tc: '這是一句自然的繁中翻譯。' }],
        tags: [],
      }],
    })

    const result = validatePlaylistVideoData(content)
    expect(result.valid).toBe(false)
    expect(result.errors.some((error: string) => error.includes('cue fragment'))).toBe(true)
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

describe('findPlaylistSourceUrl', () => {
  it('returns the configured playlist URL for a level', () => {
    const url = findPlaylistSourceUrl([
      { level: 'a1', playlistUrl: 'https://example.test/a1' },
      { level: 'a2', playlistUrl: 'https://example.test/a2' },
    ], 'a2')

    expect(url).toBe('https://example.test/a2')
  })

  it('returns an empty string when a level is not configured', () => {
    expect(findPlaylistSourceUrl([], 'b2')).toBe('')
  })
})
