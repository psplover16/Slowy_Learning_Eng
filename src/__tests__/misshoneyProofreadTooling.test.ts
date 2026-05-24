// @vitest-environment node
import { describe, expect, it } from 'vitest'
import {
  buildPlaylistVideoDataFromProofread,
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

  it('builds marker instance ids from the current video metadata', () => {
    const content = buildPlaylistVideoDataFromProofread({
      metadata: {
        videoId: 'test-video',
        slug: 'ch2-beginner-english-slow-listening-practice-talking-about-me',
        level: 'a1',
        title: 'Beginner English: Talking About Me',
        youtubeUrl: 'https://www.youtube.com/watch?v=test-video',
      },
      draft: minimumProofreadJson,
    })

    expect(content.scenes[0].sentences[0].englishTokens).toContainEqual(expect.objectContaining({
      type: 'word',
      text: 'apple',
      targetId: 'word-apple',
      instanceId: 'marker-a1-ch2-beginner-english-slow-listening-practice-talking-about-me-001-01',
    }))
  })

  it('maps english_proofreader grammar fields into sentence breakdowns', () => {
    const content = buildPlaylistVideoDataFromProofread({
      metadata: {
        videoId: 'test-video',
        slug: 'ch2-beginner-english-slow-listening-practice-talking-about-me',
        level: 'a1',
        title: 'Beginner English: Talking About Me',
        youtubeUrl: 'https://www.youtube.com/watch?v=test-video',
      },
      draft: {
        ...minimumProofreadJson,
        grammar: [
          {
            sourceSentence: 'I eat an apple every day.',
            name: '一般現在式',
            structure: '主詞 + 原形動詞',
            explanation: '描述每天都會發生的習慣。',
            translation: '我每天吃一顆蘋果。',
          },
        ],
      },
    })

    expect(content.breakdowns[0]).toEqual(expect.objectContaining({
      sentence: 'I eat an apple every day.',
      translation: '我每天吃一顆蘋果。',
    }))
    expect(content.breakdowns[0].points[0]).toEqual({
      label: '一般現在式',
      text: '主詞 + 原形動詞',
      note: '描述每天都會發生的習慣。',
    })
  })

  it('resolves semicolon-separated word surface forms to the same lemma target', () => {
    const proofreadJson = {
      ...minimumProofreadJson,
      correctedText: 'I felt **surrounded**. I like **surrounding** myself with friends.',
      translation: '我感到被包圍。我喜歡讓自己身邊有朋友。',
      segments: [
        {
          english: 'I felt **surrounded**.',
          translation: '我感到被包圍。',
        },
        {
          english: 'I like **surrounding** myself with friends.',
          translation: '我喜歡讓自己身邊有朋友。',
        },
      ],
      words: [
        {
          lemma: 'surround',
          surface: 'surrounded; surrounding',
          partOfSpeech: 'verb',
          kk: '/səˈraʊnd/',
          meaning: '圍繞；包圍',
          examples: ['I felt surrounded.', 'I like surrounding myself with friends.'],
        },
      ],
    }

    const draft = parseProofreadMarkdown(`\`\`\`json\n${JSON.stringify(proofreadJson)}\n\`\`\``)
    const content = buildPlaylistVideoDataFromProofread({
      metadata: {
        videoId: 'test-video',
        slug: 'ch2-beginner-english-slow-listening-practice-talking-about-me',
        level: 'a1',
        title: 'Beginner English: Talking About Me',
        youtubeUrl: 'https://www.youtube.com/watch?v=test-video',
      },
      draft,
    })

    const markerTokens = content.scenes.flatMap(scene =>
      scene.sentences.flatMap(sentence => sentence.englishTokens.filter(token => token.type === 'word')),
    )

    expect(markerTokens).toEqual([
      expect.objectContaining({ text: 'surrounded', targetId: 'word-surround' }),
      expect.objectContaining({ text: 'surrounding', targetId: 'word-surround' }),
    ])
  })

  it('resolves phrase surface variants from proofread examples to one phrase target', () => {
    const proofreadJson = {
      ...minimumProofreadJson,
      correctedText: 'He loves __playing video games__. She likes to __play video games__.',
      translation: '他喜歡玩電玩。她喜歡玩電玩。',
      segments: [
        {
          english: 'He loves __playing video games__.',
          translation: '他喜歡玩電玩。',
        },
        {
          english: 'She likes to __play video games__.',
          translation: '她喜歡玩電玩。',
        },
      ],
      phrases: [
        {
          phrase: 'play video games',
          literal: 'play = 玩；video games = 電子遊戲',
          meaning: '玩電玩',
          translation: '玩電玩',
          examples: [
            'He loves __playing video games__.',
            'She likes to __play video games__.',
          ],
        },
      ],
    }

    const draft = parseProofreadMarkdown(`\`\`\`json\n${JSON.stringify(proofreadJson)}\n\`\`\``)
    const content = buildPlaylistVideoDataFromProofread({
      metadata: {
        videoId: 'test-video',
        slug: 'ch4-practice-slow-english-for-a1-beginners-talk-about-family',
        level: 'a1',
        title: 'Talk About Family',
        youtubeUrl: 'https://www.youtube.com/watch?v=test-video',
      },
      draft,
    })

    const markerTokens = content.scenes.flatMap(scene =>
      scene.sentences.flatMap(sentence => sentence.englishTokens.filter(token => token.type === 'phrase')),
    )

    expect(markerTokens).toEqual([
      expect.objectContaining({ text: 'playing video games', targetId: 'phrase-play-video-games' }),
      expect.objectContaining({ text: 'play video games', targetId: 'phrase-play-video-games' }),
    ])
  })

  it('resolves hyphenated phrase markers to phrase targets', () => {
    const proofreadJson = {
      ...minimumProofreadJson,
      correctedText: 'They play __hide-and-go-seek__ in the forest.',
      translation: '他們在森林裡玩捉迷藏。',
      segments: [
        {
          english: 'They play __hide-and-go-seek__ in the forest.',
          translation: '他們在森林裡玩捉迷藏。',
        },
      ],
      phrases: [
        {
          phrase: 'hide-and-go-seek',
          literal: 'hide = 躲；go seek = 去找',
          meaning: '捉迷藏',
          translation: '捉迷藏',
          examples: ['They play __hide-and-go-seek__ in the forest.'],
        },
      ],
    }

    const draft = parseProofreadMarkdown(`\`\`\`json\n${JSON.stringify(proofreadJson)}\n\`\`\``)
    const content = buildPlaylistVideoDataFromProofread({
      metadata: {
        videoId: 'test-video',
        slug: 'ch13-slow-english-podcast-the-giving-tree-for-beginners-a1a2',
        level: 'a1',
        title: 'The Giving Tree',
        youtubeUrl: 'https://www.youtube.com/watch?v=test-video',
      },
      draft,
    })

    const markerTokens = content.scenes.flatMap(scene =>
      scene.sentences.flatMap(sentence => sentence.englishTokens.filter(token => token.type === 'phrase')),
    )

    expect(markerTokens).toEqual([
      expect.objectContaining({ text: 'hide-and-go-seek', targetId: 'phrase-hide-and-go-seek' }),
    ])
  })

  it('resolves singular phrase surface aliases from proofread JSON', () => {
    const proofreadJson = {
      ...minimumProofreadJson,
      correctedText: 'What are you __into__?',
      translation: '你對什麼有興趣？',
      segments: [
        {
          english: 'What are you __into__?',
          translation: '你對什麼有興趣？',
        },
      ],
      phrases: [
        {
          phrase: 'be into',
          surface: 'into',
          literal: '在……裡面',
          meaning: '對……很有興趣',
          translation: '喜歡、對……著迷',
          examples: ['What are you __into__?'],
        },
      ],
    }

    const draft = parseProofreadMarkdown(`\`\`\`json\n${JSON.stringify(proofreadJson)}\n\`\`\``)
    const content = buildPlaylistVideoDataFromProofread({
      metadata: {
        videoId: 'test-video',
        slug: 'ch17-slow-english-conversations-a1-comprehensible-input',
        level: 'a1',
        title: 'Slow English Conversations',
        youtubeUrl: 'https://www.youtube.com/watch?v=test-video',
      },
      draft,
    })

    expect(content.scenes[0].sentences[0].englishTokens).toContainEqual(expect.objectContaining({
      type: 'phrase',
      text: 'into',
      targetId: 'phrase-be-into',
    }))
  })

  it('resolves simple verb inflections for phrase markers', () => {
    const proofreadJson = {
      ...minimumProofreadJson,
      correctedText: 'This color __stands out__.',
      translation: '這個顏色很顯眼。',
      segments: [
        {
          english: 'This color __stands out__.',
          translation: '這個顏色很顯眼。',
        },
      ],
      phrases: [
        {
          phrase: 'stand out',
          literal: 'stand + out',
          meaning: '顯眼；突出',
          translation: '顯眼；突出',
          examples: ['It makes a person __stand out__.'],
        },
      ],
    }

    const draft = parseProofreadMarkdown(`\`\`\`json\n${JSON.stringify(proofreadJson)}\n\`\`\``)
    const content = buildPlaylistVideoDataFromProofread({
      metadata: {
        videoId: 'test-video',
        slug: 'ch2-slow-english-for-a2-high-beginners-how-colors-make-me-feel',
        level: 'a2',
        title: 'How colors make me feel',
        youtubeUrl: 'https://www.youtube.com/watch?v=test-video',
      },
      draft,
    })

    expect(content.scenes[0].sentences[0].englishTokens).toContainEqual(expect.objectContaining({
      type: 'phrase',
      text: 'stands out',
      targetId: 'phrase-stand-out',
    }))
  })

  it('splits quoted story dialogue into separate sentences', () => {
    const proofreadJson = {
      ...minimumProofreadJson,
      correctedText: 'The tree said, "Come, boy."\n"I am too big to climb," said the boy.',
      translation: '樹說：「來吧，孩子。」男孩說：「我太大了，不能爬了。」',
      segments: [
        {
          english: 'The tree said, "Come, boy."\n"I am too big to climb," said the boy.',
          translation: '樹說：「來吧，孩子。」男孩說：「我太大了，不能爬了。」',
        },
      ],
      words: [
        {
          lemma: 'climb',
          surface: 'climb',
          partOfSpeech: 'verb',
          kk: '/klaɪm/',
          meaning: '爬',
          examples: ['I am too big to climb.'],
        },
      ],
    }

    const draft = parseProofreadMarkdown(`\`\`\`json\n${JSON.stringify(proofreadJson)}\n\`\`\``)
    const content = buildPlaylistVideoDataFromProofread({
      metadata: {
        videoId: 'test-video',
        slug: 'ch13-slow-english-podcast-the-giving-tree-for-beginners-a1a2',
        level: 'a1',
        title: 'The Giving Tree',
        youtubeUrl: 'https://www.youtube.com/watch?v=test-video',
      },
      draft,
    })

    expect(content.scenes[0].sentences.map(sentence => sentence.en)).toEqual([
      'The tree said, "Come, boy."',
      '"I am too big to climb," said the boy.',
    ])
  })

  it('keeps a proofread segment intact when sentence-level translations cannot be safely aligned', () => {
    const proofreadJson = {
      ...minimumProofreadJson,
      correctedText: 'Hello. I like Christmas. Let\'s practice the past tense.',
      translation: '你好，這裡是一整段翻譯，沒有足夠的句號可以安全對齊每一句英文。',
      segments: [
        {
          english: 'Hello. I like Christmas. Let\'s practice the past tense.',
          translation: '你好，這裡是一整段翻譯，沒有足夠的句號可以安全對齊每一句英文。',
        },
      ],
    }

    const draft = parseProofreadMarkdown(`\`\`\`json\n${JSON.stringify(proofreadJson)}\n\`\`\``)
    const content = buildPlaylistVideoDataFromProofread({
      metadata: {
        videoId: 'test-video',
        slug: 'ch15-absolute-beginner-slow-english-what-is-my-favorite-holiday',
        level: 'a1',
        title: 'What is my favorite holiday?',
        youtubeUrl: 'https://www.youtube.com/watch?v=test-video',
      },
      draft,
    })

    expect(content.scenes[0].sentences).toHaveLength(1)
    expect(content.scenes[0].sentences[0]).toEqual(expect.objectContaining({
      en: 'Hello. I like Christmas. Let\'s practice the past tense.',
      tc: '你好，這裡是一整段翻譯，沒有足夠的句號可以安全對齊每一句英文。',
    }))
  })

  it('resolves usage surface variants from proofread examples to one usage target', () => {
    const proofreadJson = {
      ...minimumProofreadJson,
      correctedText: 'Guess what he 《does》 for work. What do your parents 《do》 for work?',
      translation: '猜猜他的工作是什麼。你的父母做什麼工作？',
      segments: [
        {
          english: 'Guess what he 《does》 for work.',
          translation: '猜猜他的工作是什麼。',
        },
        {
          english: 'What do your parents 《do》 for work?',
          translation: '你的父母做什麼工作？',
        },
      ],
      usages: [
        {
          word: 'do',
          familiarMeaning: '做',
          usage: 'ask about a job or role',
          translation: '做什麼工作',
          examples: [
            'Guess what he 《does》 for work.',
            'What do your parents 《do》 for work?',
          ],
        },
      ],
    }

    const draft = parseProofreadMarkdown(`\`\`\`json\n${JSON.stringify(proofreadJson)}\n\`\`\``)
    const content = buildPlaylistVideoDataFromProofread({
      metadata: {
        videoId: 'test-video',
        slug: 'ch4-practice-slow-english-for-a1-beginners-talk-about-family',
        level: 'a1',
        title: 'Talk About Family',
        youtubeUrl: 'https://www.youtube.com/watch?v=test-video',
      },
      draft,
    })

    const markerTokens = content.scenes.flatMap(scene =>
      scene.sentences.flatMap(sentence => sentence.englishTokens.filter(token => token.type === 'usage')),
    )

    expect(markerTokens).toEqual([
      expect.objectContaining({ text: 'does', targetId: 'usage-do-ask-about-a-job-or-role' }),
      expect.objectContaining({ text: 'do', targetId: 'usage-do-ask-about-a-job-or-role' }),
    ])
  })
})
