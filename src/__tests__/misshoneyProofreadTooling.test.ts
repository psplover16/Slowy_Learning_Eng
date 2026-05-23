// @vitest-environment node
import { describe, expect, it } from 'vitest'
import {
  formatTranscriptUnavailableError,
  parseProofreadMarkdown,
  resolveVideoMetadata,
} from '../../scripts/misshoney/proofread-core.mjs'

const minimumProofreadJson = {
  correctedText: 'I eat an **apple** every day.',
  translation: '我每天吃一顆蘋果。',
  segments: [
    { english: 'I eat an **apple** every day.', translation: '我每天吃一顆蘋果。' },
  ],
  words: [
    {
      lemma: 'apple',
      surface: 'apple',
      partOfSpeech: 'noun',
      kk: '[ˈæpəl]',
      meaning: '蘋果',
      examples: ['I eat an apple every day.'],
    },
  ],
  phrases: [],
  usages: [],
  grammar: [],
}

describe('MissHoney proofread tooling', () => {
  it('resolves A1 ch1 video metadata from promoted content', () => {
    const metadata = resolveVideoMetadata({
      repoRoot: process.cwd(),
      level: 'a1',
      slug: 'ch1-slow-english-for-beginners-a1-listening-practice',
    })

    expect(metadata).toEqual(expect.objectContaining({
      videoId: 'kVNYOW3eMk4',
      slug: 'ch1-slow-english-for-beginners-a1-listening-practice',
      level: 'a1',
      youtubeUrl: 'https://www.youtube.com/watch?v=kVNYOW3eMk4',
    }))
  })

  it('parses the required proofread JSON code block', () => {
    const result = parseProofreadMarkdown([
      '# Proofread result',
      '',
      '```json',
      JSON.stringify(minimumProofreadJson, null, 2),
      '```',
    ].join('\n'))

    expect(result.correctedText).toBe('I eat an **apple** every day.')
    expect(result.words).toHaveLength(1)
    expect(result.phrases).toEqual([])
    expect(result.usages).toEqual([])
    expect(result.grammar).toEqual([])
  })

  it('rejects proofread markdown without required JSON keys', () => {
    expect(() => parseProofreadMarkdown('```json\n{"correctedText":"Hello."}\n```'))
      .toThrow(/missing required key: translation/)
  })

  it('rejects HTML strings inside proofread JSON content', () => {
    expect(() => parseProofreadMarkdown([
      '```json',
      JSON.stringify({ ...minimumProofreadJson, correctedText: 'I eat <b>apple</b>.' }),
      '```',
    ].join('\n'))).toThrow(/unsafe html/i)
  })

  it('rejects inline markers that cannot align to proofread learning entries', () => {
    expect(() => parseProofreadMarkdown([
      '```json',
      JSON.stringify({
        ...minimumProofreadJson,
        segments: [{ english: 'I eat an **orange** every day.', translation: '我每天吃一顆橘子。' }],
      }),
      '```',
    ].join('\n'))).toThrow(/marker target not found: word "orange"/)
  })

  it('formats unavailable transcript errors with level, slug, url, and reason', () => {
    const message = formatTranscriptUnavailableError({
      level: 'a1',
      slug: 'ch1-slow-english-for-beginners-a1-listening-practice',
      youtubeUrl: 'https://www.youtube.com/watch?v=kVNYOW3eMk4',
      reason: 'no-public-english-transcript',
    })

    expect(message).toContain('a1')
    expect(message).toContain('ch1-slow-english-for-beginners-a1-listening-practice')
    expect(message).toContain('https://www.youtube.com/watch?v=kVNYOW3eMk4')
    expect(message).toContain('no-public-english-transcript')
  })
})
