// @vitest-environment node
import { describe, it, expect } from 'vitest'
import {
  assignDisplayOrders,
  deriveSlug,
  normalizeTranscriptCues,
  planOutputPaths,
  mapSkippedReason,
  parseYtDlpJsonPrintOutput,
  selectEnglishSubtitleEntries,
  selectJson3EnglishSubtitleEntry,
} from '../../scripts/misshoney/import-core.mjs'

describe('assignDisplayOrders', () => {
  it('assigns displayOrder in reverse originalIndex order, skipping skipped items', () => {
    const items = [
      { videoId: 'v1', originalIndex: 1, skipped: false },
      { videoId: 'v2', originalIndex: 2, skipped: true },
      { videoId: 'v3', originalIndex: 3, skipped: false },
      { videoId: 'v4', originalIndex: 4, skipped: false },
    ]
    const result = assignDisplayOrders(items)
    const learnable = result.filter((r: { skipped: boolean }) => !r.skipped)
    const skipped = result.filter((r: { skipped: boolean }) => r.skipped)

    expect(learnable.find((r: { videoId?: string }) => r.videoId === 'v4')?.displayOrder).toBe(1)
    expect(learnable.find((r: { videoId?: string }) => r.videoId === 'v3')?.displayOrder).toBe(2)
    expect(learnable.find((r: { videoId?: string }) => r.videoId === 'v1')?.displayOrder).toBe(3)
    expect((skipped[0] as Record<string, unknown>)['displayOrder']).toBeUndefined()
  })

  it('skipped video does not consume a displayOrder number', () => {
    const items = [
      { videoId: 'a', originalIndex: 1, skipped: false },
      { videoId: 'b', originalIndex: 2, skipped: true },
      { videoId: 'c', originalIndex: 3, skipped: false },
    ]
    const result = assignDisplayOrders(items)
    const orders = (result as Array<{ skipped: boolean; displayOrder?: number }>)
      .filter(r => !r.skipped)
      .map(r => r.displayOrder as number)
      .sort((a, b) => a - b)
    expect(orders).toEqual([1, 2])
    expect(orders).not.toContain(undefined)
  })

  it('accepts raw yt-dlp entries that use id before videoId is normalized', () => {
    const items = [
      { id: 'raw-1', originalIndex: 1, skipped: false },
      { id: 'raw-2', originalIndex: 2, skipped: false },
      { id: 'raw-3', originalIndex: 3, skipped: false },
    ]

    const result = assignDisplayOrders(items)

    expect(result.find((r: { id?: string }) => r.id === 'raw-3')?.displayOrder).toBe(1)
    expect(result.find((r: { id?: string }) => r.id === 'raw-2')?.displayOrder).toBe(2)
    expect(result.find((r: { id?: string }) => r.id === 'raw-1')?.displayOrder).toBe(3)
  })
})

describe('deriveSlug', () => {
  it('derives slug from displayOrder and English title', () => {
    expect(deriveSlug(1, 'What Is Your Name?')).toBe('ch1-what-is-your-name')
  })

  it('converts title to lowercase kebab-case and removes special characters', () => {
    expect(deriveSlug(2, 'How Are You!')).toBe('ch2-how-are-you')
  })

  it('handles numeric prefix correctly', () => {
    expect(deriveSlug(10, 'Nice to Meet You')).toBe('ch10-nice-to-meet-you')
  })

  it('collapses multiple spaces and hyphens', () => {
    expect(deriveSlug(3, 'Good  Morning!')).toBe('ch3-good-morning')
  })
})

describe('normalizeTranscriptCues', () => {
  it('trims whitespace from each cue text', () => {
    const cues = [{ start: 0, end: 2, text: '  Hello there  ' }]
    const result = normalizeTranscriptCues(cues)
    expect(result[0].text).toBe('Hello there')
  })

  it('removes HTML tags from cue text', () => {
    const cues = [{ start: 0, end: 2, text: '<c>Hello</c> world' }]
    const result = normalizeTranscriptCues(cues)
    expect(result[0].text).toBe('Hello world')
  })

  it('merges cues that have identical text as consecutive duplicates', () => {
    const cues = [
      { start: 0, end: 1, text: 'Hello' },
      { start: 1, end: 2, text: 'Hello' },
      { start: 2, end: 3, text: 'World' },
    ]
    const result = normalizeTranscriptCues(cues)
    expect(result.length).toBe(2)
    expect(result[0].text).toBe('Hello')
    expect(result[1].text).toBe('World')
  })

  it('preserves start and end timestamps', () => {
    const cues = [{ start: 1.5, end: 3.2, text: 'Test' }]
    const result = normalizeTranscriptCues(cues)
    expect(result[0].start).toBe(1.5)
    expect(result[0].end).toBe(3.2)
  })
})

describe('planOutputPaths', () => {
  it('returns paths under _private/misshoney only', () => {
    const paths = planOutputPaths('a1', 'ch1-what-is-your-name')
    expect(paths.transcript).toMatch(/^_private\/misshoney\//)
    expect(paths.inventory).toMatch(/^_private\/misshoney\//)
    expect(paths.skipped).toMatch(/^_private\/misshoney\//)
  })

  it('does not include src/modules/playlists/data in any path', () => {
    const paths = planOutputPaths('a1', 'ch1-what-is-your-name')
    for (const p of Object.values(paths)) {
      expect(p as string).not.toContain('src/modules/playlists/data')
    }
  })

  it('uses correct level and slug in transcript path', () => {
    const paths = planOutputPaths('b1', 'ch3-good-morning')
    expect(paths.transcript).toBe('_private/misshoney/transcripts/b1/ch3-good-morning.json')
  })

  it('uses correct level in inventory path', () => {
    const paths = planOutputPaths('a2', 'ch1-hello')
    expect(paths.inventory).toBe('_private/misshoney/inventory/a2.json')
  })

  it('uses correct level in skipped path', () => {
    const paths = planOutputPaths('b2', 'ch1-hello')
    expect(paths.skipped).toBe('_private/misshoney/skipped/b2.json')
  })
})

describe('mapSkippedReason', () => {
  it('maps members-only error to member-only', () => {
    expect(mapSkippedReason('This video is available to this channel members only')).toBe('member-only')
  })

  it('maps private video error to private', () => {
    expect(mapSkippedReason('This video is private')).toBe('private')
  })

  it('maps no captions to no-english-captions', () => {
    expect(mapSkippedReason('no subtitles found')).toBe('no-english-captions')
  })

  it('maps unavailable/deleted video to unavailable', () => {
    expect(mapSkippedReason('Video unavailable')).toBe('unavailable')
  })

  it('maps geo-restricted error to geo-restricted', () => {
    expect(mapSkippedReason('This video is not available in your country')).toBe('geo-restricted')
  })

  it('maps unknown errors to unavailable as fallback', () => {
    expect(mapSkippedReason('some unknown error message')).toBe('unavailable')
  })
})

describe('selectEnglishSubtitleEntries', () => {
  it('prefers exact en subtitles when present', () => {
    const entries = selectEnglishSubtitleEntries({
      en: [{ ext: 'json3', url: 'manual-en' }],
      'en-US': [{ ext: 'json3', url: 'manual-en-us' }],
    })

    expect(entries?.[0].url).toBe('manual-en')
  })

  it('accepts en-US subtitles from yt-dlp output', () => {
    const entries = selectEnglishSubtitleEntries({
      'en-US': [{ ext: 'json3', url: 'auto-en-us' }],
      'zh-Hant': [{ ext: 'json3', url: 'zh' }],
    })

    expect(entries?.[0].url).toBe('auto-en-us')
  })

  it('returns null when no English-like track exists', () => {
    const entries = selectEnglishSubtitleEntries({
      'zh-Hant': [{ ext: 'json3', url: 'zh' }],
    })

    expect(entries).toBeNull()
  })
})

describe('parseYtDlpJsonPrintOutput', () => {
  it('parses the first JSON object line from yt-dlp --print output', () => {
    const result = parseYtDlpJsonPrintOutput('NA\n{"en-US":[{"ext":"json3","url":"caption"}]}\n')

    expect(result).toEqual({
      'en-US': [{ ext: 'json3', url: 'caption' }],
    })
  })

  it('returns null when yt-dlp output contains no JSON object', () => {
    expect(parseYtDlpJsonPrintOutput('NA\n')).toBeNull()
  })
})

describe('selectJson3EnglishSubtitleEntry', () => {
  it('prefers manual English json3 captions before automatic captions', () => {
    const entry = selectJson3EnglishSubtitleEntry({
      subtitles: {
        'en-US': [
          { ext: 'vtt', url: 'manual-vtt' },
          { ext: 'json3', url: 'manual-json3' },
        ],
      },
      automaticCaptions: {
        en: [{ ext: 'json3', url: 'auto-json3' }],
      },
    })

    expect(entry?.url).toBe('manual-json3')
  })

  it('falls back to automatic English json3 captions', () => {
    const entry = selectJson3EnglishSubtitleEntry({
      subtitles: {},
      automaticCaptions: {
        'en-US': [{ ext: 'json3', url: 'auto-json3' }],
      },
    })

    expect(entry?.url).toBe('auto-json3')
  })
})
