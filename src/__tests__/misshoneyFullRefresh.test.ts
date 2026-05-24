// @vitest-environment node
import { mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { dirname, join } from 'node:path'
import { afterEach, describe, expect, it } from 'vitest'
import {
  accumulateGrammarMarkdown,
  buildFinalVerificationReport,
  buildProofreaderLifecycles,
  extractSubtitleForProofread,
  listOriginalSubtitleSources,
  parseGrammarDealMarkdown,
  planGrammarSync,
  synthesizeProofreadMarkdownFromVideoData,
  validateProofreaderLifecycles,
  validateStep1Markdown,
  writeBackProofreadToApp,
} from '../../scripts/misshoney/full-refresh-core.mjs'

const tempRoots: string[] = []

afterEach(() => {
  for (const root of tempRoots.splice(0)) {
    rmSync(root, { recursive: true, force: true })
  }
})

function makeTempRoot() {
  const root = mkdtempSync(join(tmpdir(), 'misshoney-full-refresh-'))
  tempRoots.push(root)
  return root
}

function write(root: string, relativePath: string, content: string) {
  const filePath = join(root, relativePath)
  mkdirSync(dirname(filePath), { recursive: true })
  writeFileSync(filePath, content, 'utf-8')
  return filePath
}

const validProofreadJson = {
  correctedText: 'I eat an **apple** every day. I __look up__ new words.',
  translation: '我每天吃一顆蘋果。我查新單字。',
  segments: [
    {
      english: 'I eat an **apple** every day.',
      translation: '我每天吃一顆蘋果。',
    },
    {
      english: 'I __look up__ new words.',
      translation: '我查新單字。',
    },
  ],
  words: [
    {
      lemma: 'apple',
      surface: 'apple',
      partOfSpeech: 'noun',
      kk: '/ˈæpəl/',
      meaning: '蘋果',
      examples: ['I eat an apple every day.'],
    },
  ],
  phrases: [
    {
      phrase: 'look up',
      literal: 'look = 看；up = 往上',
      meaning: '查詢',
      translation: '查詢',
      examples: ['I __look up__ new words.'],
    },
  ],
  usages: [],
  grammar: [
    {
      title: 'Simple Present',
      sourceSentence: 'I eat an apple every day.',
      translation: '我每天吃一顆蘋果。',
      structure: 'Subject + base verb',
      explanation: 'Use simple present for habits.',
    },
  ],
}

function proofreadMarkdown(value: unknown = validProofreadJson) {
  return [
    '# proofread',
    '',
    '```json',
    JSON.stringify(value, null, 2),
    '```',
  ].join('\n')
}

describe('MissHoney full refresh pipeline contracts', () => {
  it('lists local originalContent sources by A1 -> A2 -> B1 -> B2 and natural chapter order', () => {
    const root = makeTempRoot()
    write(root, '_private/tmp/originalContent/a2/ch2-two.json', '{}')
    write(root, '_private/tmp/originalContent/a1/ch10-ten.json', '{}')
    write(root, '_private/tmp/originalContent/a1/ch2-two.md', 'two')
    write(root, '_private/tmp/originalContent/b1/ch1-one.json', '{}')
    write(root, '_private/tmp/originalContent/b2/ch1-one.json', '{}')

    const sources = listOriginalSubtitleSources({ repoRoot: root })

    expect(sources.map(source => `${source.level}/${source.slug}`)).toEqual([
      'a1/ch2-two',
      'a1/ch10-ten',
      'a2/ch2-two',
      'b1/ch1-one',
      'b2/ch1-one',
    ])
    expect(sources[0].outputRelativePath).toBe('_private/tmp/step1/a1/ch2-two.md')
  })

  it('extracts Markdown directly and JSON transcript/text fields without metadata', () => {
    const root = makeTempRoot()
    const markdownPath = write(root, '_private/tmp/originalContent/a1/ch1.md', 'Hello from Markdown.')
    const jsonPath = write(root, '_private/tmp/originalContent/a1/ch2.json', JSON.stringify({
      title: 'Metadata title that must not be proofread',
      transcriptText: 'Hello from the transcript.',
      cues: [{ text: 'metadata-ish cue' }],
    }))

    expect(extractSubtitleForProofread({ sourcePath: markdownPath })).toEqual(expect.objectContaining({
      ok: true,
      text: 'Hello from Markdown.',
      fieldPath: 'markdown',
    }))
    expect(extractSubtitleForProofread({ sourcePath: jsonPath })).toEqual(expect.objectContaining({
      ok: true,
      text: 'Hello from the transcript.',
      fieldPath: 'transcriptText',
    }))
  })

  it('reports unknown JSON schema instead of promoting raw JSON as subtitle text', () => {
    const root = makeTempRoot()
    const sourcePath = write(root, '_private/tmp/originalContent/a1/ch3.json', JSON.stringify({
      title: 'No transcript here',
      videoId: 'metadata-only',
    }))

    const result = extractSubtitleForProofread({ sourcePath, level: 'a1', slug: 'ch3' })

    expect(result).toEqual(expect.objectContaining({
      ok: false,
      repair: expect.objectContaining({
        level: 'a1',
        slug: 'ch3',
        reason: 'unknown-json-schema',
      }),
    }))
  })

  it('creates and validates one proofreader lifecycle per subtitle', () => {
    const root = makeTempRoot()
    write(root, '_private/tmp/originalContent/a1/ch1.md', 'one')
    write(root, '_private/tmp/originalContent/a1/ch2.md', 'two')
    const sources = listOriginalSubtitleSources({ repoRoot: root })

    const lifecycles = buildProofreaderLifecycles(sources)

    expect(lifecycles).toHaveLength(2)
    expect(lifecycles[0].proofreaderId).not.toBe(lifecycles[1].proofreaderId)
    expect(validateProofreaderLifecycles(lifecycles)).toEqual({ valid: true, errors: [] })
    expect(validateProofreaderLifecycles([
      { ...lifecycles[0], proofreaderId: 'english-proofreader-1' },
      { ...lifecycles[1], proofreaderId: 'english-proofreader-1' },
    ])).toEqual({
      valid: false,
      errors: ['proofreader reused for multiple subtitles: english-proofreader-1'],
    })
  })

  it('validates step1 Markdown JSON and sends skipped/omitted output to repair list', () => {
    const valid = validateStep1Markdown({
      markdown: proofreadMarkdown(),
      level: 'a1',
      slug: 'ch1',
      sourcePath: '_private/tmp/originalContent/a1/ch1.json',
      proofreadPath: '_private/tmp/step1/a1/ch1.md',
    })
    const invalid = validateStep1Markdown({
      markdown: proofreadMarkdown({
        ...validProofreadJson,
        correctedText: 'Same as above.',
      }),
      level: 'a1',
      slug: 'ch2',
      sourcePath: '_private/tmp/originalContent/a1/ch2.json',
      proofreadPath: '_private/tmp/step1/a1/ch2.md',
    })

    expect(valid).toEqual(expect.objectContaining({ valid: true }))
    expect(invalid).toEqual(expect.objectContaining({
      valid: false,
      repair: expect.objectContaining({
        level: 'a1',
        slug: 'ch2',
        reason: expect.stringContaining('skip phrase'),
      }),
    }))
  })

  it('does not overwrite app data when a proofread output is invalid', () => {
    const root = makeTempRoot()
    const routePath = write(
      root,
      'src/modules/playlists/data/videos/a1/ch1.json',
      JSON.stringify({ slug: 'ch1', sentinel: 'keep me' }, null, 2),
    )
    const proofreadPath = write(root, '_private/tmp/step1/a1/ch1.md', '# missing json')

    const result = writeBackProofreadToApp({
      repoRoot: root,
      level: 'a1',
      slug: 'ch1',
      sourcePath: '_private/tmp/originalContent/a1/ch1.json',
      proofreadPath,
    })

    expect(result).toEqual(expect.objectContaining({
      written: false,
      repair: expect.objectContaining({ level: 'a1', slug: 'ch1' }),
    }))
    expect(JSON.parse(readFileSync(routePath, 'utf-8'))).toEqual({ slug: 'ch1', sentinel: 'keep me' })
  })

  it('adds fallback A/B/C marker tokens from learning entries when proofread text is unmarked', () => {
    const root = makeTempRoot()
    const routePath = write(
      root,
      'src/modules/playlists/data/videos/a1/ch1.json',
      JSON.stringify({
        videoId: 'video-1',
        slug: 'ch1',
        level: 'a1',
        title: 'Daily practice',
        youtubeUrl: 'https://www.youtube.com/watch?v=video-1',
      }, null, 2),
    )
    const proofreadPath = write(root, '_private/tmp/step1/a1/ch1.md', proofreadMarkdown({
      ...validProofreadJson,
      correctedText: 'I eat an apple every day. I look up new words. I run the team.',
      translation: '我每天吃一顆蘋果。我查新單字。我管理團隊。',
      segments: [
        { english: 'I eat an apple every day.', translation: '我每天吃一顆蘋果。' },
        { english: 'I look up new words.', translation: '我查新單字。' },
        { english: 'I run the team.', translation: '我管理團隊。' },
      ],
      usages: [{
        word: 'run',
        familiarMeaning: '跑',
        usage: 'manage a team',
        translation: '管理團隊',
        examples: ['I run the team.'],
      }],
    }))

    const result = writeBackProofreadToApp({
      repoRoot: root,
      level: 'a1',
      slug: 'ch1',
      sourcePath: '_private/tmp/originalContent/a1/ch1.json',
      proofreadPath,
    })

    expect(result).toEqual(expect.objectContaining({ written: true }))
    const refreshed = JSON.parse(readFileSync(routePath, 'utf-8'))
    const markerTypes = refreshed.scenes.flatMap((scene: { sentences: Array<{ englishTokens: Array<{ type: string }> }> }) =>
      scene.sentences.flatMap(sentence => sentence.englishTokens.map(token => token.type)),
    ).filter((type: string) => type !== 'text')
    expect(markerTypes).toEqual(expect.arrayContaining(['word', 'phrase', 'usage']))
  })

  it('accumulates grammar by topic without duplicating headings and keeps traceable sources', () => {
    const first = accumulateGrammarMarkdown('', {
      level: 'a1',
      slug: 'ch1',
      grammar: validProofreadJson.grammar,
    })
    const second = accumulateGrammarMarkdown(first, {
      level: 'a1',
      slug: 'ch2',
      grammar: [{
        ...validProofreadJson.grammar[0],
        sourceSentence: 'She eats breakfast every day.',
      }],
    })

    expect((second.match(/^## Simple Present$/gm) ?? [])).toHaveLength(1)
    expect(second).toContain('Source: a1/ch1')
    expect(second).toContain('Source: a1/ch2')
    expect(second).toContain('She eats breakfast every day.')
  })

  it('parses grammar_deal JSON, enforces continuous sortOrder, and plans additions/supplements/omissions', () => {
    const grammarDeal = parseGrammarDealMarkdown([
      '# Grammar Deal',
      '',
      '```json',
      JSON.stringify({
        grammarPoints: [
          { title: 'Relative Clause', level: 'B1', sortOrder: 1, sourceCoverage: ['b1/ch1'] },
          { title: 'Present Perfect', level: 'B1', sortOrder: 2, sourceCoverage: ['b1/ch2'] },
        ],
        omissions: [
          { title: 'Ambiguous Pattern', sourceCoverage: ['b2/ch9'], reason: 'Needs human review.' },
        ],
      }),
      '```',
    ].join('\n'))
    const sync = planGrammarSync({
      existingTopics: ['Relative Clause'],
      grammarPoints: grammarDeal.grammarPoints,
      omissions: grammarDeal.omissions,
    })

    expect(grammarDeal.grammarPoints.map(point => point.sortOrder)).toEqual([1, 2])
    expect(sync.supplements.map(point => point.title)).toEqual(['Relative Clause'])
    expect(sync.additions.map(point => point.title)).toEqual(['Present Perfect'])
    expect(sync.omissions[0]).toEqual(expect.objectContaining({
      title: 'Ambiguous Pattern',
      reason: 'Needs human review.',
    }))
    expect(() => parseGrammarDealMarkdown('```json\n{"grammarPoints":[{"title":"A","sortOrder":1},{"title":"B","sortOrder":3}]}\n```'))
      .toThrow(/continuous sortOrder/)
  })

  it('builds a final verification report with every required verification field', () => {
    const report = buildFinalVerificationReport({
      sourceCount: 85,
      step1Count: 85,
      jsonSuccessCount: 85,
      repairList: [],
      appWriteBackCount: 85,
      grammarAdditions: 2,
      grammarSupplements: 4,
      grammarOmissions: [],
      uiSmokePages: ['/a1/ch1', '/b2/ch17'],
      commandResults: [
        { command: 'npm run lint', status: 'passed', exitCode: 0 },
        { command: 'npm run test', status: 'passed', exitCode: 0 },
        { command: 'npm run build', status: 'passed', exitCode: 0 },
      ],
      risks: ['No unresolved risks.'],
    })

    expect(report).toContain('原始字幕總數: 85')
    expect(report).toContain('Step1 總數: 85')
    expect(report).toContain('JSON 成功數: 85')
    expect(report).toContain('待修清單: 0')
    expect(report).toContain('已寫回 route 數: 85')
    expect(report).toContain('Grammar 新增數: 2')
    expect(report).toContain('Grammar 補充數: 4')
    expect(report).toContain('/a1/ch1')
    expect(report).toContain('npm run build')
    expect(report).toContain('剩餘風險')
  })

  it('can synthesize a valid step1 artifact from existing route data when rerunning locally', () => {
    const markdown = synthesizeProofreadMarkdownFromVideoData({
      videoId: 'vid001',
      slug: 'ch1',
      level: 'a1',
      title: 'Daily Routine',
      youtubeUrl: 'https://example.test/watch',
      header: {
        podcastLabel: 'MissHoney A1',
        titleZh: '日常作息',
        titleEn: 'Daily Routine',
        levelTag: 'A1',
      },
      scenes: [
        {
          id: 'scene-01',
          no: '01',
          titleZh: '第一段',
          titleEn: 'Part 1',
          tags: [],
          sentences: [
            {
              en: 'I eat an apple every day.',
              tc: '我每天吃一顆蘋果。',
              englishTokens: [
                { type: 'text', text: 'I eat an ' },
                { type: 'word', text: 'apple', targetId: 'word-apple', instanceId: 'marker-a1-ch1-001-01' },
                { type: 'text', text: ' every day.' },
              ],
            },
            {
              en: 'I look up new words.',
              tc: '我查新單字。',
              englishTokens: [
                { type: 'text', text: 'I ' },
                { type: 'phrase', text: 'look up', targetId: 'phrase-look-up', instanceId: 'marker-a1-ch1-002-01' },
                { type: 'text', text: ' new words.' },
              ],
            },
          ],
        },
      ],
      vocabGroups: [{
        title: 'Words',
        items: [{
          id: 'word-apple',
          lemma: 'apple',
          english: 'apple',
          kk: '/ˈæpəl/',
          partOfSpeech: 'noun',
          meaning: '蘋果',
        }],
      }],
      phrases: [{
        id: 'phrase-look-up',
        phrase: 'look up',
        meaning: '查詢',
        examples: [{ en: 'I look up new words.', tc: '我查新單字。' }],
      }],
      usages: [],
      breakdowns: [{
        id: 'breakdown-01',
        sentence: 'I eat an apple every day.',
        translation: '我每天吃一顆蘋果。',
        points: [{ label: 'Simple Present', text: 'Subject + base verb', note: 'Use for habits.' }],
      }],
    })

    const result = validateStep1Markdown({
      markdown,
      level: 'a1',
      slug: 'ch1',
      sourcePath: '_private/tmp/originalContent/a1/ch1.json',
      proofreadPath: '_private/tmp/step1/a1/ch1.md',
    })

    expect(result.valid).toBe(true)
    expect(markdown).toContain('```json')
    expect(markdown).toContain('**apple**')
    expect(markdown).toContain('__look up__')
  })
})
