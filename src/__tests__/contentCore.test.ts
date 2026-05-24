// @vitest-environment node
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { describe, it, expect } from 'vitest'
import {
  addInlineTokensToPlaylistVideoData,
  buildScaffold,
  validatePlaylistVideoData,
  planPromotionPaths,
  countLevelCoverage,
  findPlaylistSourceUrl,
} from '../../scripts/misshoney/content-core.mjs'

type ContentSentence = {
  en: string
  tc: string
}

type ContentScene = {
  id: string
  sentences: ContentSentence[]
}

type ContentFile = {
  scenes: ContentScene[]
}

function readJsonFile<T>(path: string): T {
  return JSON.parse(readFileSync(resolve(path), 'utf8')) as T
}

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
          { id: 'word-hello', lemma: 'hello', english: 'hello', kk: '/həˈloʊ/', partOfSpeech: 'interj.', meaning: '你好', highlight: true },
        ],
      },
    ],
    vocabGroups: [
      {
        title: 'Greetings',
        items: [{ id: 'word-hello', lemma: 'hello', english: 'hello', kk: '/həˈloʊ/', partOfSpeech: 'interj.', meaning: '你好', highlight: true }],
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
    usages: [],
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

  it('accepts a long proofread paragraph when it is made of complete sentences', () => {
    const content = makeValidContent({
      scenes: [{
        id: 'scene-01',
        no: '01',
        titleZh: '測試',
        titleEn: 'Test',
        sentences: [{
          en: "I decided on the color pink. I don't know if pink is really my color, but lately, I've been really obsessed with pink. I just bought a new purse with pink polka dots. These are polka dots. Do you know what I mean? After my nail appointment, I had some lunch with my mom, and I took the bus back to my apartment.",
          tc: '我選了粉紅色。我不知道粉紅色是不是真的適合我，但最近我真的很迷粉紅色。我剛買了一個有粉紅色圓點的新包包。這些就是 polka dots。你懂我的意思嗎？美甲預約之後，我和媽媽吃了午餐，然後搭公車回我的公寓。',
        }],
        tags: [],
      }],
    })

    expect(validatePlaylistVideoData(content).valid).toBe(true)
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

  it('accepts Traditional Chinese translations that include an English term with Chinese context', () => {
    const content = makeValidContent({
      scenes: [{
        id: 'scene-01',
        no: '01',
        titleZh: '測試',
        titleEn: 'Test',
        sentences: [{ en: 'Reservation.', tc: '「reservation」這個字。' }],
        tags: [],
      }],
    })

    expect(validatePlaylistVideoData(content).valid).toBe(true)
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
    'Hello welcome to my SLO English podcast today.',
    'Today I got a weird phone call a strange phone call I.',
    'I do who is this.',
    "We'll take the.",
    'Today I am going to be interviewing my sister. So,.',
    'What was your childhood home like? My childhood home was very American,?',
    'Welcome back to my slow English podcast. a podcast to practice slow English.',
    'She said, "Do not pretend. You stole my dog.".',
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

  it('rejects generic vocabulary meanings that are not instructional', () => {
    const content = makeValidContent({
      vocabGroups: [{
        title: 'Weak vocabulary',
        items: [
          { english: 'said', kk: '/sɛd/', partOfSpeech: 'v.', meaning: '日常生活相關的常用字', highlight: true },
        ],
      }],
    })

    const result = validatePlaylistVideoData(content)
    expect(result.valid).toBe(false)
    expect(result.errors.some((error: string) => error.includes('placeholder translation'))).toBe(true)
  })

  it('rejects generic phrase meanings that only echo the source text', () => {
    const content = makeValidContent({
      phrases: [{
        id: 'phrase-01',
        phrase: 'i think',
        meaning: '常用說法，可用來表達「i think」這個意思',
        examples: [{ en: 'I think you have the wrong number.', tc: '我想你打錯電話了。' }],
      }],
    })

    const result = validatePlaylistVideoData(content)
    expect(result.valid).toBe(false)
    expect(result.errors.some((error: string) => error.includes('placeholder translation'))).toBe(true)
  })

  it('accepts structured English inline tokens when targets resolve to learning entries', () => {
    const content = makeValidContent({
      scenes: [{
        id: 'scene-01',
        no: '01',
        titleZh: '測試',
        titleEn: 'Test',
        sentences: [{
          en: 'I eat an apple every day.',
          tc: '我每天吃一顆蘋果。',
          englishTokens: [
            { type: 'text', text: 'I eat an ' },
            { type: 'word', text: 'apple', targetId: 'word-apple', instanceId: 'marker-a1-ch1-001' },
            { type: 'text', text: ' every day.' },
          ],
        }],
        tags: [],
      }],
      vocabGroups: [{
        title: 'Food',
        items: [{
          id: 'word-apple',
          lemma: 'apple',
          english: 'apple',
          kk: '/ˈæpəl/',
          partOfSpeech: 'n.',
          meaning: '蘋果',
        }],
      }],
    })

    expect(validatePlaylistVideoData(content).valid).toBe(true)
  })

  it('accepts whitespace text tokens between adjacent inline markers', () => {
    const content = makeValidContent({
      scenes: [{
        id: 'scene-01',
        no: '01',
        titleZh: '測試',
        titleEn: 'Test',
        sentences: [{
          en: 'Welcome to my slow podcast.',
          tc: '歡迎來到我的慢速 podcast。',
          englishTokens: [
            { type: 'text', text: 'Welcome to my ' },
            { type: 'word', text: 'slow', targetId: 'word-slow', instanceId: 'marker-a1-ch1-001' },
            { type: 'text', text: ' ' },
            { type: 'word', text: 'podcast', targetId: 'word-podcast', instanceId: 'marker-a1-ch1-002' },
            { type: 'text', text: '.' },
          ],
        }],
        tags: [],
      }],
      vocabGroups: [{
        title: 'Podcast',
        items: [
          { id: 'word-slow', lemma: 'slow', english: 'slow', kk: '/sloʊ/', partOfSpeech: 'adj.', meaning: '慢速的' },
          { id: 'word-podcast', lemma: 'podcast', english: 'podcast', kk: '/ˈpɑdˌkæst/', partOfSpeech: 'n.', meaning: '播客節目' },
        ],
      }],
    })

    expect(validatePlaylistVideoData(content).valid).toBe(true)
  })

  it.each([
    'Who do you work with?',
    'After teaching, I study.',
    'Where are you from?',
    'And where are you from?',
    'In Asia, right?',
    'I try to.',
    "I'd like to check in.",
    'I could barely hold on.',
    'I can also check the translation if I need to.',
    'What is your favorite color, and why?',
    'If so, which one is your favorite, and why?',
    'Something that draws the eye in?',
    'I know there are so many more holidays in the world like Diwali, the start of the Hindu New Year, Eid al-Fitr, the Islamic holiday that celebrates the end of Ramadan, Lunar New Year, Carnival, Holi, and La Tomatina.',
    "Sugar makes you fat, but sugar is also very delicious, so I think it's worth it.",
  ])('accepts natural proofread A1 sentences for "%s"', (sentence) => {
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

    expect(validatePlaylistVideoData(content).valid).toBe(true)
  })

  it('keeps A1 ch15 holiday segment sentence translations aligned', () => {
    const content = readJsonFile<ContentFile>('src/modules/playlists/data/videos/a1/ch15-absolute-beginner-slow-english-what-is-my-favorite-holiday.json')
    const expectedTranslations = [
      ["There are a lot of holidays like Christmas, New Year's, Three Kings Day, Valentine's Day, St. Patrick's Day, Easter, Kids' Day, Mother's Day, Father's Day, Halloween, the Day of the Dead, and Thanksgiving.", '有很多節日，像是聖誕節、新年、三王節、情人節、聖派翠克節、復活節、兒童節、母親節、父親節、萬聖節、亡靈節和感恩節。'],
      ['Those are the only holidays that I can think of right now.', '那些是我現在唯一想得到的節日。'],
      ['Those are the first holidays that come to mind.', '那些是我第一個想到的節日。'],
      ['What is another holiday that comes to mind for you?', '對你來說，還有什麼節日會浮現在腦海中？'],
      ['Something you celebrate in your country.', '也許是你在自己國家慶祝的節日。'],
      ['I know there are so many more holidays in the world like Diwali, the start of the Hindu New Year, Eid al-Fitr, the Islamic holiday that celebrates the end of Ramadan, Lunar New Year, Carnival, Holi, and La Tomatina.', '我知道世界上還有好多節日，像是排燈節、印度新年的開始、開齋節，也就是慶祝齋戒月結束的伊斯蘭節日、農曆新年、嘉年華、胡里節和番茄節。'],
      ["There are so many holidays that I don't celebrate, but they have so much meaning.", '有好多節日我沒有慶祝，但它們很有意義。'],
      ['Humans celebrate everything we can.', '人類會盡可能慶祝一切。'],
      ['We eat, we dance, and we laugh any chance we get.', '我們吃東西、跳舞，也一有機會就歡笑。'],
      ['But to me, the best holiday is Christmas.', '但對我來說，最好的節日是聖誕節。'],
      ["To me, it's more about the feeling.", '對我來說，它更關乎那種感覺。'],
      ['And for me, the best feelings I get are on Christmas.', '對我而言，我得到最好的感受都在聖誕節。'],
      ['I feel safe.', '我覺得安全。'],
      ['I feel cozy.', '我覺得舒適。'],
      ['I feel warm.', '我覺得溫暖。'],
      ['I feel loved.', '我覺得被愛。'],
      ['And I feel happy on Christmas.', '而且我在聖誕節覺得快樂。'],
      ["That's why my favorite holiday is Christmas.", '這就是為什麼我最喜歡的節日是聖誕節。'],
      ["Let's practice the past tense.", '讓我們練習過去式。'],
    ] as const

    const sentences = content.scenes.flatMap((scene) => scene.sentences)
    for (const [en, tc] of expectedTranslations) {
      const sentence = sentences.find((item) => item.en === en)

      expect(sentence?.tc).toBe(tc)
    }

    expect(content.scenes
      .flatMap((scene) => scene.sentences)
      .some((sentence) => sentence.en === "Patrick's Day, Easter, Kids' Day, Mother's Day, Father's Day, Halloween, the Day of the Dead, and Thanksgiving."))
      .toBe(false)
  })

  it('rejects inline token targets that do not resolve to learning entries', () => {
    const content = makeValidContent({
      scenes: [{
        id: 'scene-01',
        no: '01',
        titleZh: '測試',
        titleEn: 'Test',
        sentences: [{
          en: 'I eat an apple every day.',
          tc: '我每天吃一顆蘋果。',
          englishTokens: [
            { type: 'text', text: 'I eat an ' },
            { type: 'word', text: 'apple', targetId: 'word-missing', instanceId: 'marker-a1-ch1-001' },
            { type: 'text', text: ' every day.' },
          ],
        }],
        tags: [],
      }],
    })

    const result = validatePlaylistVideoData(content)
    expect(result.valid).toBe(false)
    expect(result.errors.some((error: string) => error.includes('word-missing'))).toBe(true)
  })

  it('rejects special usage entries missing required fields', () => {
    const content = makeValidContent({
      usages: [{
        id: 'usage-run-business',
        word: 'run',
        familiarMeaning: '跑',
        usage: '',
        translation: '經營一家生意',
        examples: ['I run a small business.'],
      }],
    })

    const result = validatePlaylistVideoData(content)
    expect(result.valid).toBe(false)
    expect(result.errors.some((error: string) => error.includes('usages[0].usage'))).toBe(true)
  })

  it('rejects duplicate vocabulary entries that share the same lemma', () => {
    const content = makeValidContent({
      vocabGroups: [{
        title: 'Actions',
        items: [
          { id: 'word-run', lemma: 'run', english: 'run', kk: '/rʌn/', partOfSpeech: 'v.', meaning: '跑' },
          { id: 'word-running', lemma: 'run', english: 'running', kk: '/ˈrʌnɪŋ/', partOfSpeech: 'v.', meaning: '正在跑' },
        ],
      }],
    })

    const result = validatePlaylistVideoData(content)
    expect(result.valid).toBe(false)
    expect(result.errors.some((error: string) => error.includes('duplicate vocabulary lemma: run'))).toBe(true)
  })

  it('rejects likely sentence translation alignment drift', () => {
    const content = makeValidContent({
      scenes: [{
        id: 'scene-01',
        no: '01',
        titleZh: '測試',
        titleEn: 'Test',
        sentences: [{
          en: "Let's practice the past tense.",
          tc: '你好，歡迎回到我的 Slow English 播客。這一集是給完全初學者的。我們來聊聊聖誕節。跟著我一起跟讀。幾天前，我在想最好的節日是什麼。有很多節日，像是聖誕節、新年、三王節、情人節、聖派翠克節、復活節、兒童節、母親節、父親節、萬聖節、亡靈節和感恩節。讓我們練習過去式。',
          englishTokens: [{ type: 'text', text: "Let's practice the past tense." }],
        }],
        tags: [],
      }],
    })

    const result = validatePlaylistVideoData(content)

    expect(result.valid).toBe(false)
    expect(result.errors.some((error: string) => error.includes('translation looks misaligned'))).toBe(true)
  })
})

describe('addInlineTokensToPlaylistVideoData', () => {
  it('adds stable English marker tokens from vocabulary, phrases, and usages without changing Chinese text', () => {
    const content = makeValidContent({
      slug: 'ch2-practice',
      level: 'a2',
      scenes: [{
        id: 'scene-01',
        no: '01',
        titleZh: '測試',
        titleEn: 'Test',
        sentences: [{
          en: 'I take on a project and run the team.',
          tc: '我接下一個專案並負責帶團隊。',
        }],
        tags: [],
      }],
      vocabGroups: [{
        title: 'Practice',
        items: [
          { id: 'word-project', lemma: 'project', english: 'project', kk: '/ˈprɑdʒɛkt/', partOfSpeech: 'n.', meaning: '專案' },
        ],
      }],
      phrases: [{
        id: 'phrase-take-on',
        phrase: 'take on',
        meaning: '承接；承擔',
        examples: [{ en: 'I take on a project.', tc: '我承接一個專案。' }],
      }],
      usages: [{
        id: 'usage-run-team',
        word: 'run',
        familiarMeaning: '跑',
        usage: 'manage a team',
        translation: '管理一個團隊',
        examples: [{ en: 'I run the team.', tc: '我管理這個團隊。' }],
      }],
    })

    const result = addInlineTokensToPlaylistVideoData(content)
    const sentence = result.scenes[0].sentences[0]

    expect(sentence.tc).toBe('我接下一個專案並負責帶團隊。')
    expect(sentence.englishTokens).toEqual([
      { type: 'text', text: 'I ' },
      { type: 'phrase', text: 'take on', targetId: 'phrase-take-on', instanceId: 'marker-a2-ch2-practice-scene-01-001-001' },
      { type: 'text', text: ' a ' },
      { type: 'word', text: 'project', targetId: 'word-project', instanceId: 'marker-a2-ch2-practice-scene-01-001-002' },
      { type: 'text', text: ' and ' },
      { type: 'usage', text: 'run', targetId: 'usage-run-team', instanceId: 'marker-a2-ch2-practice-scene-01-001-003' },
      { type: 'text', text: ' the team.' },
    ])
    expect(validatePlaylistVideoData(result).valid).toBe(true)
  })

  it('preserves existing proofread tokens by default', () => {
    const content = makeValidContent({
      scenes: [{
        id: 'scene-01',
        no: '01',
        titleZh: '測試',
        titleEn: 'Test',
        sentences: [{
          en: 'I eat an apple every day.',
          tc: '我每天吃一顆蘋果。',
          englishTokens: [
            { type: 'text', text: 'I eat an ' },
            { type: 'word', text: 'apple', targetId: 'word-apple', instanceId: 'marker-hand-authored' },
            { type: 'text', text: ' every day.' },
          ],
        }],
        tags: [],
      }],
      vocabGroups: [{
        title: 'Food',
        items: [{
          id: 'word-apple',
          lemma: 'apple',
          english: 'apple',
          kk: '/ˈæpəl/',
          partOfSpeech: 'n.',
          meaning: '蘋果',
        }],
      }],
    })

    const result = addInlineTokensToPlaylistVideoData(content)

    expect(result.scenes[0].sentences[0].englishTokens?.[1]).toEqual({
      type: 'word',
      text: 'apple',
      targetId: 'word-apple',
      instanceId: 'marker-hand-authored',
    })
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
