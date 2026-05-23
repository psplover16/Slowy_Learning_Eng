#!/usr/bin/env node
/**
 * MissHoney polished content authoring helper.
 *
 * This is a build-time helper. It reads _private scaffolds and writes polished
 * PlaylistVideoData drafts to _private/misshoney/generated-content/<level>/.
 * Runtime app code never calls this file.
 */
import { existsSync, mkdirSync, readFileSync, readdirSync, writeFileSync } from 'node:fs'
import { basename, dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { validatePlaylistVideoData } from './content-core.mjs'

const __dirname = dirname(fileURLToPath(import.meta.url))
const REPO_ROOT = resolve(__dirname, '../..')
const LEVELS = ['a1', 'a2', 'b1', 'b2']

const args = process.argv.slice(2)
const ALL = args.includes('--all')
const FORCE = args.includes('--force')
const DRY_RUN = args.includes('--dry-run')
const providerIndex = args.indexOf('--provider')
const PROVIDER = providerIndex !== -1 ? args[providerIndex + 1] : 'lingva'
const levelIndex = args.indexOf('--level')
const LEVEL = levelIndex !== -1 ? args[levelIndex + 1] : null
const slugIndex = args.indexOf('--slug')
const SLUG = slugIndex !== -1 ? args[slugIndex + 1] : null

if (!ALL && !LEVEL) {
  console.error('Usage: node scripts/misshoney/author-polished-content.mjs --level a1|--all [--slug slug] [--force] [--provider lingva|mymemory|fallback|google]')
  process.exit(1)
}

if (LEVEL && !LEVELS.includes(LEVEL)) {
  console.error(`Unknown level "${LEVEL}". Valid levels: ${LEVELS.join(', ')}`)
  process.exit(1)
}

if (!['google', 'lingva', 'mymemory', 'fallback'].includes(PROVIDER)) {
  console.error('Unknown provider. Valid providers: lingva, mymemory, google, fallback')
  process.exit(1)
}

const translationCache = new Map()
const levelsToProcess = ALL ? LEVELS : [LEVEL]
const MAX_SENTENCES_BY_LEVEL = {
  a1: 24,
  a2: 48,
  b1: 64,
  b2: 80,
}

async function authorLevel(level) {
  const scaffoldDir = resolve(REPO_ROOT, `_private/misshoney/content-scaffolds/${level}`)
  const outputDir = resolve(REPO_ROOT, `_private/misshoney/generated-content/${level}`)

  if (!existsSync(scaffoldDir)) {
    console.error(`Missing scaffold directory: ${scaffoldDir}`)
    return 1
  }

  mkdirSync(outputDir, { recursive: true })
  const files = readdirSync(scaffoldDir)
    .filter(file => file.endsWith('.json'))
    .filter(file => !SLUG || basename(file, '.json') === SLUG)
    .sort(naturalCompare)

  if (SLUG && files.length === 0) {
    console.error(`Missing scaffold for slug "${SLUG}" in ${level}.`)
    return 1
  }

  console.log(`\n[${level.toUpperCase()}] Authoring ${files.length} polished content files...`)
  let levelErrors = 0

  for (const file of files) {
    const outputPath = resolve(outputDir, file)
    const slug = basename(file, '.json')
    if (!FORCE && existsSync(outputPath)) {
      const existing = JSON.parse(readFileSync(outputPath, 'utf-8'))
      const result = validatePlaylistVideoData(existing)
      if (result.valid) {
        console.log(`  · ${slug} cached`)
        continue
      }
    }

    try {
      const scaffold = JSON.parse(readFileSync(resolve(scaffoldDir, file), 'utf-8'))
      const content = await buildContent(scaffold)
      const result = validatePlaylistVideoData(content)
      if (!result.valid) {
        levelErrors++
        console.error(`  ✗ ${slug}`)
        for (const error of result.errors) console.error(`      - ${error}`)
        continue
      }
      if (!DRY_RUN) writeFileSync(outputPath, JSON.stringify(content, null, 2) + '\n', 'utf-8')
      console.log(`  ✓ ${slug} (${content.scenes.length} scenes, ${content.breakdowns.length} breakdowns)`)
    } catch (error) {
      levelErrors++
      console.error(`  ✗ ${slug}: ${error.message}`)
    }
  }

  return levelErrors
}

async function buildContent(scaffold) {
  const levelTag = String(scaffold.level).toUpperCase()
  const transcriptText = buildTranscriptText(scaffold)
  const sentences = rebuildSentences(transcriptText, scaffold.title, scaffold.level)
  const sceneSentences = sentences.length > 0 ? sentences : [sentenceCase(scaffold.title)]
  const vocabWords = selectVocabWords(`${scaffold.title} ${sceneSentences.join(' ')}`)
  const phrases = selectPhrases(sceneSentences.join(' '))

  const translationInputs = [
    scaffold.title,
    ...sceneSentences,
    ...vocabWords,
    ...phrases.map(item => item.phrase),
    ...phrases.map(item => item.example),
  ]
  const translations = await translateMany(translationInputs)
  const titleZh = cleanTranslation(translations.get(scaffold.title), scaffold.title)

  const vocabItems = vocabWords.map((word, index) => ({
    english: word,
    kk: KK_OVERRIDES[word.toLowerCase()] ?? `/${word.toLowerCase()}/`,
    partOfSpeech: guessPartOfSpeech(word),
    meaning: WORD_MEANINGS[word.toLowerCase()] ?? cleanShortTranslation(translations.get(word), word, fallbackWordMeaning(word)),
    note: buildVocabNote(word),
    highlight: index < 3,
  }))

  return {
    videoId: scaffold.videoId,
    slug: scaffold.slug,
    level: scaffold.level,
    title: scaffold.title,
    youtubeUrl: scaffold.youtubeUrl,
    header: {
      podcastLabel: `MissHoney ${levelTag}`,
      titleZh,
      titleEn: scaffold.title,
      levelTag,
      topicTag: inferTopicTag(scaffold.title),
    },
    scenes: buildScenes(sceneSentences, translations, vocabItems),
    vocabGroups: [
      {
        title: `${levelTag} 重點單字`,
        items: vocabItems,
      },
    ],
    phrases: phrases.map((item, index) => ({
      id: `phrase-${String(index + 1).padStart(2, '0')}`,
      phrase: item.phrase,
      meaning: PHRASE_MEANINGS[item.phrase.toLowerCase()] ?? cleanShortTranslation(translations.get(item.phrase), item.phrase, fallbackPhraseMeaning(item.phrase)),
      examples: [
        {
          en: item.example,
          tc: cleanTranslation(translations.get(item.example), item.example),
        },
      ],
    })),
    breakdowns: buildBreakdowns(sceneSentences, translations, phrases),
  }
}

function buildTranscriptText(scaffold) {
  if (Array.isArray(scaffold.cues) && scaffold.cues.length > 0) {
    const merged = mergeOverlappingCueText(scaffold.cues)
    if (merged) return merged
  }
  return normalizeText(scaffold.transcriptText)
}

function mergeOverlappingCueText(cues) {
  const tokens = []

  for (const cue of cues) {
    const words = normalizeCaptionText(cue?.text)
      .split(/\s+/)
      .filter(Boolean)
    if (words.length === 0) continue

    let overlap = 0
    const max = Math.min(tokens.length, words.length)
    for (let size = max; size > 0; size--) {
      const tail = tokens.slice(tokens.length - size).map(normalizeToken)
      const head = words.slice(0, size).map(normalizeToken)
      if (tail.join(' ') === head.join(' ')) {
        overlap = size
        break
      }
    }
    tokens.push(...words.slice(overlap))
  }

  return normalizeText(tokens.join(' '))
}

function rebuildSentences(transcriptText, title, level) {
  const text = normalizeTranscriptForAuthoring(transcriptText)
  const marked = markThoughtBoundaries(text)

  const roughUnits = marked
    .split('|')
    .flatMap(part => splitLongUnit(part))
    .flatMap(polishSentence)
    .map(sentenceCase)
    .filter(isUsefulSentence)

  const unique = []
  const seen = new Set()
  for (const sentence of roughUnits) {
    const key = sentence.toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim()
    if (!key || seen.has(key)) continue
    seen.add(key)
    unique.push(sentence)
  }

  const maxSentences = MAX_SENTENCES_BY_LEVEL[String(level ?? '').toLowerCase()] ?? 48
  if (unique.length >= 4) return unique.slice(0, maxSentences)
  return [
    sentenceCase(title),
    ...unique,
  ].slice(0, Math.min(16, maxSentences))
}

function normalizeCaptionText(text) {
  return normalizeText(text)
    .replace(/\[[^\]]+\]/g, ' ')
    .replace(/♪/g, ' ')
}

function normalizeTranscriptForAuthoring(text) {
  const normalized = normalizeCaptionText(text)
    .replace(/\btyana\b/gi, 'Tyana')
    .replace(/\bberes\b/gi, 'berries')
    .replace(/\bconas\b/gi, 'conchas')
    .replace(/\bgasas\b/gi, 'conchas')
    .replace(/\bSLO English\b/g, 'slow English')
    .replace(/\bEnglish clear podcast\b/gi, 'slow English podcast')
    .replace(/\bNorfol\b/g, 'Norfolk')
    .replace(/\boxo\b/gi, 'Oxxo')
    .replace(/\b7ele1\b/gi, '7-Eleven')
    .replace(/\bAvarotes Loose\b/gi, 'Abarrotes Luz')
    .replace(/\bgrandma's name is Loose\b/gi, "grandma's name is Luz")
    .replace(/\b1100 p\.m\./gi, '11:00 p.m.')
    .replace(/\bus usually\b/gi, 'you usually')
    .replace(/\bintemediate\b/gi, 'intermediate')
    .replace(/\bin inside\b/gi, 'inside')
    .replace(/\bto to\b/gi, 'to')
    .replace(/\btry try\b/gi, 'try')
    .replace(/\bthink think\b/gi, 'think')
    .replace(/\benjoy enjoy\b/gi, 'enjoy')
    .replace(/\bgood good\b/gi, 'good')
    .replace(/\bfalling falling falling\b/gi, 'falling')
    .replace(/\bsecond second\b/gi, 'second')
    .replace(/\bdance shows dance shows\b/gi, 'dance shows')
    .replace(/\s+/g, ' ')
    .trim()

  return dedupeRepeatedWords(normalized)
}

function dedupeRepeatedWords(text) {
  const words = String(text).split(/\s+/).filter(Boolean)
  const output = []
  for (const word of words) {
    const previous = output[output.length - 1]
    if (previous && normalizeToken(previous) === normalizeToken(word)) continue
    output.push(word)
  }
  return output.join(' ')
}

function markThoughtBoundaries(text) {
  const markers = [...THOUGHT_STARTERS].sort((a, b) => b.length - a.length)
  const escaped = markers.map(marker => marker.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'))
  const pattern = new RegExp(`\\b(${escaped.join('|')})\\b`, 'gi')
  return text.replace(pattern, ' | $1')
}

function splitLongUnit(unit) {
  const words = normalizeText(unit).split(/\s+/).filter(Boolean)
  if (words.length <= 32) return [words.join(' ')]

  const chunks = []
  let current = []
  for (const word of words) {
    const startsNewThought = /^(i|you|we|they|he|she|what|when|where|why|how|after|before|then|today|sometimes|finally|first|next)$/i.test(word)
    if (current.length >= 12 && startsNewThought) {
      chunks.push(current.join(' '))
      current = []
    }
    current.push(word)
    if (current.length >= 32) {
      chunks.push(current.join(' '))
      current = []
    }
  }
  if (current.length) chunks.push(current.join(' '))
  return chunks
}

function polishSentence(sentence) {
  const clean = sentence
    .replace(/\bListening to English\b/g, 'listening to English')
    .replace(/\bRoutine routine\b/g, 'A routine is something')
    .replace(/\bmy daily routine my daily\b/gi, 'my daily routine.')
    .replace(/\bYour favorite dinner at 11:00 p\.m\./gi, 'At 11:00 p.m.')
    .replace(/\bwho want to learn listening to English\b/gi, 'who want to practice listening to English')
    .replace(/\bstrawberry berries\b/gi, 'strawberries')
    .replace(/\bcomes comes\b/gi, 'comes')
    .replace(/\bmade made\b/gi, 'made')
    .replace(/\bSLO English\b/g, 'slow English')
    .replace(/\bEnglish clear podcast\b/gi, 'slow English podcast')
    .replace(/\bin inside\b/gi, 'inside')
    .replace(/\ba\.m\. I\b/gi, 'a.m. I')
    .replace(/\bp\.m\. I\b/gi, 'p.m. I')
    .replace(/\.\s+([a-z])/g, (_, letter) => `. ${letter.toUpperCase()}`)
    .replace(/\s+so,\.$/i, '')
    .replace(/\s+so,\s*$/i, '')
    .replace(/\s+(and|or|but|so|because)$/i, '')
    .replace(/\s+it'?s$/i, '')
    .replace(/\s+(the|a|an|i)$/i, '')
    .replace(/,\s*\?$/i, '?')
    .replace(/\s+/g, ' ')
    .trim()

  if (/^Hello welcome to my slow English podcast today we will be practicing A2 listening/i.test(clean)) {
    return [
      'Hello, welcome to my slow English podcast.',
      'Today we will practice A2 listening.',
      'Try not to read the captions.',
    ]
  }
  if (/^Hello welcome to my slow English podcast for levels/i.test(clean)) {
    return 'Hello, welcome to my slow English podcast for levels B1 or A2.'
  }
  if (/^Hello welcome back to my slow English podcast a podcast to practice your English listening/i.test(clean)) {
    return 'Hello, welcome back to my slow English podcast, a podcast for practicing English listening.'
  }
  if (/^Welcome back to my slow English podcast a podcast/i.test(clean)) {
    return clean.replace(
      /^Welcome back to my slow English podcast a podcast/i,
      'Welcome back to my slow English podcast, a podcast'
    )
  }
  if (/^Welcome back to my slow English podcast\. A podcast/i.test(clean)) {
    return clean.replace(/^Welcome back to my slow English podcast\. A podcast/i, 'Welcome back to my slow English podcast, a podcast')
  }
  if (/^I normally do,? which is to start my day with a banana smoothie/i.test(clean)) {
    return 'I normally start my day with a banana smoothie.'
  }
  if (/^First,? I use the strainer and I strain my kefir/i.test(clean)) {
    return 'First, I use a strainer and strain my kefir.'
  }
  if (/^Is a fungi that turns milk into kefir/i.test(clean)) {
    return 'Kefir grains are a culture that turns milk into kefir.'
  }
  if (/^Next,? I add some flax seed/i.test(clean) && /serve it into$/i.test(clean)) {
    return 'Next, I add some flax seed, a little water, and then blend everything.'
  }
  if (/^After the market$/i.test(clean)) {
    return ''
  }
  if (/^She sells food just like in a convenience store/i.test(clean)) {
    return [
      'She sells food like a convenience store, but it is her own local store.',
      'It is not an Oxxo or a 7-Eleven.',
      "The store is called Abarrotes Luz because my grandma's name is Luz.",
    ]
  }
  if (/^We got some fresh pork rinds/i.test(clean) && /chalupas/i.test(clean)) {
    return [
      'We got some fresh pork rinds.',
      'My grandma cooked chalupas, fried tortillas with potatoes, lettuce, and chicken.',
    ]
  }
  if (/^My favorite color of green/i.test(clean)) {
    return "I use my favorite green cup, but it is actually my dad's cup."
  }
  if (/^Today I got a weird phone call/i.test(clean)) {
    return 'Today I got a weird phone call, a strange phone call.'
  }
  if (/^I was at home drinking/i.test(clean)) {
    return 'I was at home drinking a cup of tea and reading a book when suddenly my phone rang.'
  }
  if (/^I picked up and said/i.test(clean)) {
    return 'I picked up the phone and said hello.'
  }
  if (/^Hello a woman with a serious voice answered/i.test(clean)) {
    return 'A woman with a serious voice answered and said, "I know what you did."'
  }
  if (/^A woman with a serious voice answered and said I know what you did I was confused/i.test(clean)) {
    return [
      'A woman with a serious voice answered and said, "I know what you did."',
      'I was confused.',
    ]
  }
  if (/^I was confused I answered what did/i.test(clean)) {
    return 'I was confused and answered, "What did I do?"'
  }
  if (/^I do who is this/i.test(clean)) {
    return 'Who is this?'
  }
  if (/^She said don't pretend you stole my dog/i.test(clean)) {
    return 'She said, "Do not pretend. You stole my dog."'
  }
  if (/^I love dogs but I would never steal/i.test(clean)) {
    return 'I love dogs, but I would never steal a dog.'
  }
  if (/^Said I think you have the wrong number/i.test(clean) || /^I said I think you have the wrong number/i.test(clean)) {
    return 'I said, "I think you have the wrong number. I do not have your dog."'
  }
  if (/^She didn't believe me I saw you/i.test(clean)) {
    return 'She did not believe me and said, "I saw you. You took my dog from the park."'
  }
  if (/^The park I said I didn't even go to the park/i.test(clean) || /^I said I didn't even go to the park/i.test(clean)) {
    return 'I said, "I did not even go to the park today."'
  }
  if (/^I asked what does your dog look/i.test(clean)) {
    return 'I asked, "What does your dog look like?"'
  }
  if (/^She said he is small white and fluffy/i.test(clean)) {
    return 'She said, "He is small, white, and fluffy."'
  }
  if (/^I said I'm sorry but my dog is not/i.test(clean)) {
    return 'I said, "I am sorry, but my dog is not small or white."'
  }
  if (/^White she said oh oh no/i.test(clean) || /^She said oh oh no/i.test(clean)) {
    return 'She said, "Oh no, I think I called the wrong person. I am so sorry."'
  }
  if (/^I laughed and said I hope you find your dog/i.test(clean)) {
    return 'I laughed and said, "I hope you find your dog."'
  }
  if (/^I hung up and I sat on my couch/i.test(clean)) {
    return 'I hung up and sat on my couch.'
  }
  if (/^I shook my head what a weird phone call/i.test(clean)) {
    return 'I shook my head and thought, "What a weird phone call."'
  }
  if (/^We waited for the bus to come for maybe 10 minutes until/i.test(clean)) {
    return 'We waited for the bus for about 10 minutes.'
  }
  if (/^We'll take$/i.test(clean) || /^We'll take the$/i.test(clean)) {
    return 'We will take the next bus.'
  }
  if (/^We don't fit/i.test(clean)) {
    return 'We do not fit.'
  }
  if (/^We waited another 10 minutes but at that point/i.test(clean)) {
    return 'We waited another 10 minutes, but at that point we had already waited 20 minutes.'
  }
  if (/^Today I'm making an interview/i.test(clean)) {
    return 'Today I am making an interview for you to practice listening to questions and answers.'
  }
  if (/^Today I'm going to be interviewing/i.test(clean) || /^Today I am going to be interviewing/i.test(clean)) {
    return 'Today I am going to interview my sister, Brianna.'
  }
  if (/^First of all,? where did you grow up/i.test(clean)) {
    return 'First of all, where did you grow up?'
  }
  if (/^Um,? I grew up in Norfolk/i.test(clean)) {
    return 'I grew up in Norfolk, Nebraska, in the United States.'
  }
  if (/^What was your childhood home like\?? My childhood home was very American/i.test(clean)) {
    return [
      'What was your childhood home like?',
      'My childhood home was very American.',
    ]
  }
  if (/^We sleep the worlds/i.test(clean)) {
    return 'They are the dreams we have when we sleep.'
  }
  if (/^We create inside our brain/i.test(clean)) {
    return 'We create worlds inside our brain.'
  }
  if (/^We sleep those are the dreams/i.test(clean)) {
    return 'Those are the dreams that I love talking about.'
  }
  if (/^I love waking up from a crazy dream and writing it down/i.test(clean)) {
    return 'I love waking up from a crazy dream and writing it down in my dream journal.'
  }
  if (/^It's a journal where I write down all of my dreams/i.test(clean)) {
    return 'It is a journal where I write down all of my dreams.'
  }
  if (/^I wake up from a dream I immediately start to forget/i.test(clean)) {
    return 'When I wake up from a dream, I immediately start to forget it.'
  }
  if (/^I wake up$/i.test(clean)) {
    return ''
  }

  if (/^Who want\b/i.test(clean)) {
    return 'This podcast is for beginners who want to practice listening to English.'
  }
  if (/^Hello my name is Tyana Ortiz/i.test(clean)) {
    return 'Hello, my name is Tyana Ortiz. Welcome to my slow English podcast.'
  }
  if (/^Today's podcast is about my daily routine/i.test(clean)) {
    return "Today's podcast is about my daily routine."
  }
  if (/^A routine is something/i.test(clean)) {
    return 'A routine is something you do every day.'
  }
  if (/^My favorite breakfast is oatmeal oatmeal/i.test(clean)) {
    return 'My favorite breakfast is oatmeal with bananas, strawberries, berries, and honey.'
  }
  if (/^I eat oatmeal every day/i.test(clean)) {
    return 'I eat oatmeal every day.'
  }
  if (/^Oatmeal with bananas/i.test(clean)) {
    return 'I eat oatmeal with bananas, strawberries, berries, and honey.'
  }
  if (/^What is your job who do you work with/i.test(clean)) {
    return 'What is your job?'
  }
  if (/^Who do you work with after teaching/i.test(clean)) {
    return 'Who do you work with?'
  }
  if (/^Do you work with\b/i.test(clean)) {
    return 'Who do you work with?'
  }
  if (/^Your favorite dinner at 11:00 p\.m\./i.test(clean)) {
    return 'At 11:00 p.m., I go to sleep.'
  }
  if (/^Thank you bye/i.test(clean)) {
    return 'Thank you. Bye.'
  }
  if (/^They have a lot of sugar sugar makes/i.test(clean)) {
    return 'They have a lot of sugar.'
  }
  if (/^You fat but sugar is also very delicious/i.test(clean)) {
    return 'Sugar can make you gain weight, but it is also very delicious.'
  }
  if (/^I think people who like sweet foods are always very sweet but people who like salty foods usually/i.test(clean)) {
    return 'I think people who like sweet foods are often very sweet.'
  }
  if (/^Are very direct and straightforward/i.test(clean)) {
    return "People who like salty foods are often direct and straightforward. That's just my opinion."
  }
  if (/^I live in Mexico in Mexico/i.test(clean)) {
    return 'I live in Mexico.'
  }
  if (/^We have them all Mexican food is very diverse but I think/i.test(clean)) {
    return 'Mexican food is very diverse.'
  }

  return clean
}

function buildScenes(sentences, translations, vocabItems) {
  const scenes = []
  const perScene = 4

  for (let i = 0; i < sentences.length; i += perScene) {
    const no = scenes.length + 1
    const sceneSentences = sentences.slice(i, i + perScene)
    const titleEn = buildSceneTitle(sceneSentences[0], no)
    scenes.push({
      id: `scene-${String(no).padStart(2, '0')}`,
      no: String(no).padStart(2, '0'),
      titleZh: buildSceneTitleZh(titleEn, no),
      titleEn,
      sentences: sceneSentences.map(en => ({
        en,
        tc: cleanTranslation(translations.get(en), en),
      })),
      tags: selectSceneTags(sceneSentences, vocabItems),
    })
  }

  return scenes
}

function selectSceneTags(sentences, vocabItems) {
  const sceneText = sentences.join(' ').toLowerCase()
  const matches = vocabItems.filter(item => sceneText.includes(item.english.toLowerCase()))
  return (matches.length > 0 ? matches : vocabItems).slice(0, 3)
}

function buildBreakdowns(sentences, translations, phrases) {
  return sentences.slice(0, Math.min(4, sentences.length)).map((sentence, index) => {
    const focus = phrases.find(item => sentence.toLowerCase().includes(item.phrase.toLowerCase()))?.phrase ?? pickFocus(sentence)
    return {
      id: `breakdown-${String(index + 1).padStart(2, '0')}`,
      sentence,
      translation: cleanTranslation(translations.get(sentence), sentence),
      points: [
        {
          label: focus,
          text: focus,
          note: `注意 "${focus}" 在句子中的位置，先練整句，再替換自己的內容。`,
        },
      ],
    }
  })
}

function selectVocabWords(text) {
  const counts = new Map()
  for (const raw of normalizeText(text).toLowerCase().match(/[a-z][a-z'-]{2,}/g) ?? []) {
    const word = raw.replace(/^'+|'+$/g, '').replace(/'s$/, '')
    if (STOPWORDS.has(word) || word.length < 3) continue
    counts.set(word, (counts.get(word) ?? 0) + 1)
  }
  return [...counts.entries()]
    .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
    .slice(0, 8)
    .map(([word]) => word)
}

function selectPhrases(text) {
  const clean = normalizeText(text)
  const lower = clean.toLowerCase()
  const selected = []

  for (const phrase of PHRASE_CANDIDATES) {
    if (lower.includes(phrase)) {
      selected.push({ phrase, example: findExample(clean, phrase) })
    }
    if (selected.length >= 3) break
  }

  if (selected.length === 0) {
    const focus = pickFocus(clean)
    selected.push({ phrase: focus, example: findExample(clean, focus) })
  }

  return selected
}

function findExample(text, phrase) {
  const sentences = text.split(/(?<=[.!?])\s+/).filter(Boolean)
  return sentences.find(sentence => sentence.toLowerCase().includes(phrase.toLowerCase())) ?? sentences[0] ?? sentenceCase(phrase)
}

async function translateMany(values) {
  const unique = [...new Set(values.map(value => String(value).trim()).filter(Boolean))]
  const missing = unique.filter(value => !translationCache.has(value))

  if (PROVIDER === 'fallback') {
    for (const value of missing) translationCache.set(value, fallbackTranslation(value))
    return translationCache
  }

  if (PROVIDER === 'mymemory') {
    for (const value of missing) {
      translationCache.set(value, await translateText(value))
      await sleep(120)
    }
    return translationCache
  }

  if (PROVIDER === 'lingva') {
    await translateInParallel(missing, 6)
    return translationCache
  }

  await translateInParallel(missing, 8)
  return translationCache
}

async function translateInParallel(values, concurrency) {
  let nextIndex = 0
  const workers = Array.from({ length: Math.min(concurrency, values.length) }, async () => {
    while (nextIndex < values.length) {
      const current = values[nextIndex]
      nextIndex += 1
      translationCache.set(current, await translateText(current))
      await sleep(40)
    }
  })

  await Promise.all(workers)
}

async function translateText(text) {
  if (PROVIDER === 'lingva') return translateWithLingva(text)
  if (PROVIDER === 'mymemory') return translateWithMyMemory(text)

  for (let attempt = 1; attempt <= 3; attempt++) {
    try {
      const body = new URLSearchParams({
        client: 'gtx',
        sl: 'en',
        tl: 'zh-TW',
        dt: 't',
        q: text,
      })
      const response = await fetch('https://translate.googleapis.com/translate_a/single', {
        method: 'POST',
        body,
        signal: AbortSignal.timeout(10000),
        headers: {
          'content-type': 'application/x-www-form-urlencoded;charset=UTF-8',
          'user-agent': 'Mozilla/5.0',
        },
      })

      if (!response.ok) throw new Error(`HTTP ${response.status}`)
      const data = await response.json()
      const translated = data?.[0]?.map(part => part?.[0] ?? '').join('').trim()
      if (translated) return translated
    } catch {
      await sleep(250 * attempt)
    }
  }

  return fallbackTranslation(text)
}

async function translateWithLingva(text) {
  const encoded = encodeURIComponent(text)
  const endpoints = [
    `https://lingva.ml/api/v1/en/zh_HANT/${encoded}`,
    `https://lingva.lunar.icu/api/v1/en/zh_HANT/${encoded}`,
  ]

  for (const endpoint of endpoints) {
    try {
      const response = await fetch(endpoint, {
        signal: AbortSignal.timeout(12000),
        headers: { 'user-agent': 'Mozilla/5.0' },
      })
      if (!response.ok) throw new Error(`HTTP ${response.status}`)
      const data = await response.json()
      const translated = data?.translation?.trim()
      if (translated) return translated
    } catch {
      // Try the next public mirror, then fall back to local learner text.
    }
  }

  return fallbackTranslation(text)
}

async function translateWithMyMemory(text) {
  try {
    const url = new URL('https://api.mymemory.translated.net/get')
    url.searchParams.set('q', text)
    url.searchParams.set('langpair', 'en|zh-TW')
    const response = await fetch(url, { signal: AbortSignal.timeout(10000) })
    if (!response.ok) throw new Error(`HTTP ${response.status}`)
    const data = await response.json()
    return data?.responseData?.translatedText?.trim() || fallbackTranslation(text)
  } catch {
    return fallbackTranslation(text)
  }
}

function cleanTranslation(value, source, fallback = null) {
  const translated = String(value ?? '').trim()
  if (!translated || translated === source || /^[a-z0-9 ,.'?!:-]+$/i.test(translated)) {
    return fallback ?? fallbackTranslation(source)
  }
  return translated
    .replace(/&#39;/g, "'")
    .replace(/&quot;/g, '"')
    .replace(/&amp;/g, '&')
    .replace(/[\u200B-\u200D\uFEFF]/g, '')
    .replace(/播客/g, 'podcast')
    .replace(/您/g, '你')
    .replace(/奇多/g, 'Cheetos')
    .replace(/\s+/g, ' ')
}

function cleanShortTranslation(value, source, fallback) {
  const translated = cleanTranslation(value, source, fallback)
    .replace(/^這裡是在描述.+主詞和動作。$/, fallback)
    .replace(/^這句主要在談.+$/, fallback)
    .replace(/^「?(.+?)」?$/, '$1')
    .trim()

  if (!translated || translated === source || /^[a-z0-9 ,.'?!:-]+$/i.test(translated)) {
    return fallback
  }

  return translated.length > 28 ? fallback : translated
}

function fallbackTranslation(text) {
  const source = normalizeText(text)
  const exact = SENTENCE_TRANSLATIONS[source.toLowerCase()]
  if (exact) return exact

  const pattern = translateByPattern(source)
  if (pattern) return pattern

  return `這裡是在描述${topicLabelZh(inferTopicTag(source))}，可以把重點放在整句的主詞和動作。`
}

function fallbackWordMeaning(word) {
  return WORD_MEANINGS[word.toLowerCase()] ?? `表示「${word}」；搭配例句理解它在句中的意思`
}

function fallbackPhraseMeaning(phrase) {
  return PHRASE_MEANINGS[phrase.toLowerCase()] ?? `表示「${phrase}」；可放進相似情境練習整句`
}

function buildVocabNote(word) {
  return `看到 ${word} 時，先聽它前後搭配的字，再練習放進自己的句子。`
}

function buildSceneTitle(firstSentence, no) {
  const topic = inferTopicTag(firstSentence)
  return no === 1 ? `Opening: ${topicLabelEn(topic)}` : `Part ${no}: ${topicLabelEn(topic)}`
}

function buildSceneTitleZh(titleEn, no) {
  const topic = titleEn.replace(/^Opening: |^Part \d+: /, '')
  return no === 1 ? `開場：${topicLabelZh(topic)}` : `第 ${no} 段：${topicLabelZh(topic)}`
}

function inferTopicTag(text) {
  const lower = String(text).toLowerCase()
  if (/routine|morning|evening|sleep|wake/.test(lower)) return 'daily routine'
  if (/food|breakfast|lunch|dinner|spicy|sweet|restaurant|grocery/.test(lower)) return 'food'
  if (/travel|trip|airport|city|beach|mexico|brazil|new york|china/.test(lower)) return 'travel'
  if (/friend|family|childhood|memory|relationship/.test(lower)) return 'people'
  if (/work|job|teacher|interview|student/.test(lower)) return 'work'
  if (/language|english|mandarin|pronunciation|word/.test(lower)) return 'language'
  if (/hope|goal|confidence|gratitude|affirmation/.test(lower)) return 'mindset'
  return 'everyday life'
}

function topicLabelEn(topic) {
  const key = String(topic).toLowerCase()
  return TOPIC_LABELS[key]?.en ?? topic
}

function topicLabelZh(topic) {
  const key = String(topic).toLowerCase()
  return TOPIC_LABELS[key]?.zh ?? '日常英文'
}

function translateByPattern(text) {
  const clean = normalizeText(text)
  const lower = clean.toLowerCase()

  const nameMatch = clean.match(/^hello,? my name is ([^.]+)\.?$/i)
  if (nameMatch) return `你好，我叫 ${nameMatch[1].trim()}。`

  const welcomeMatch = clean.match(/^welcome to (.+)\.?$/i)
  if (welcomeMatch) return `歡迎來到${welcomeMatch[1].trim()}。`

  const todayMatch = clean.match(/^today(?:'s)? podcast is about (.+)\.?$/i)
  if (todayMatch) return `今天這集 podcast 要聊${translateTopicPhrase(todayMatch[1])}。`

  const talkMatch = clean.match(/^today i want to talk about (.+)\.?$/i)
  if (talkMatch) return `今天我想談談${translateTopicPhrase(talkMatch[1])}。`

  const wakeMatch = clean.match(/^i wake up at (.+)\.?$/i)
  if (wakeMatch) return `我在 ${wakeMatch[1].trim()} 起床。`

  const doYogaMatch = clean.match(/^i do (.+)\.?$/i)
  if (doYogaMatch) return `我做${translateTopicPhrase(doYogaMatch[1])}。`

  const eatMatch = clean.match(/^i eat (.+)\.?$/i)
  if (eatMatch) return `我吃${translateTopicPhrase(eatMatch[1])}。`

  const workWithMatch = clean.match(/^i work with (.+)\.?$/i)
  if (workWithMatch) return `我和${translateTopicPhrase(workWithMatch[1])}一起工作。`

  const getReadyMatch = clean.match(/^i get ready for (.+)\.?$/i)
  if (getReadyMatch) return `我準備去${translateTopicPhrase(getReadyMatch[1])}。`

  const teachFromMatch = clean.match(/^i teach students from (.+) and more\.?$/i)
  if (teachFromMatch) return `我教來自${teachFromMatch[1].trim()}等地的學生。`

  const loveMatch = clean.match(/^i love (.+)\.?$/i)
  if (loveMatch) return `我很喜歡${translateTopicPhrase(loveMatch[1])}。`

  const likeMatch = clean.match(/^i like to (.+)\.?$/i)
  if (likeMatch) return `我喜歡${translateTopicPhrase(likeMatch[1])}。`

  const favoriteMatch = clean.match(/^my favorite (.+) is (.+)\.?$/i)
  if (favoriteMatch) return `我最喜歡的${translateTopicPhrase(favoriteMatch[1])}是${translateTopicPhrase(favoriteMatch[2])}。`

  const whatFavoriteMatch = clean.match(/^what is your favorite (.+)\?$/i)
  if (whatFavoriteMatch) return `你最喜歡的${translateTopicPhrase(whatFavoriteMatch[1])}是什麼？`

  const whatJobMatch = clean.match(/^what is your job\?$/i)
  if (whatJobMatch) return '你的工作是什麼？'

  const whatEatMatch = clean.match(/^what do you (?:usually|normally) eat for (.+)\?$/i)
  if (whatEatMatch) return `你${translateTopicPhrase(whatEatMatch[1])}通常吃什麼？`

  const whatDoMatch = clean.match(/^what do you (.+)\?$/i)
  if (whatDoMatch) return `你會${translateTopicPhrase(whatDoMatch[1])}嗎？`

  const doYouLikeMatch = clean.match(/^do you like to (.+)\?$/i)
  if (doYouLikeMatch) return `你喜歡${translateTopicPhrase(doYouLikeMatch[1])}嗎？`

  if (lower === 'i brush my teeth.') return '我刷牙。'
  if (lower === 'i wash my face.') return '我洗臉。'
  if (lower === 'thank you. bye.') return '謝謝你，再見。'

  return ''
}

function translateTopicPhrase(value) {
  const source = String(value)
    .replace(/[.!?]+$/, '')
    .toLowerCase()
    .replace(/[,，]/g, ' ')
    .trim()

  if (PHRASE_TRANSLATIONS[source]) return PHRASE_TRANSLATIONS[source]

  const words = source
    .split(/\s+/)
    .filter(Boolean)
  const translated = words
    .map(word => TOPIC_WORD_TRANSLATIONS[word] ?? WORD_MEANINGS[word] ?? word)
    .join(' ')
    .replace(/\s+/g, ' ')
    .trim()
  return translated || value
}

function pickFocus(sentence) {
  const words = normalizeText(sentence).toLowerCase().match(/[a-z][a-z'-]{2,}/g) ?? []
  const focus = words.filter(word => !STOPWORDS.has(word)).slice(0, 3)
  return focus.length ? focus.join(' ') : 'everyday English'
}

function guessPartOfSpeech(word) {
  const lower = word.toLowerCase()
  if (COMMON_VERBS.has(lower) || lower.endsWith('ing') || lower.endsWith('ed')) return 'v.'
  if (lower.endsWith('ly')) return 'adv.'
  if (lower.endsWith('ous') || lower.endsWith('ful') || lower.endsWith('ive') || lower.endsWith('al')) return 'adj.'
  if (lower.endsWith('tion') || lower.endsWith('ness') || lower.endsWith('ment') || lower.endsWith('ity')) return 'n.'
  return 'n.'
}

function isUsefulSentence(sentence) {
  const clean = normalizeText(sentence)
  if (clean.length < 8) return false
  if (/^\[?music\]?\.?$/i.test(clean)) return false
  if (/\b(with|for|to|from|about|at|in|on|of|who|what|where|when|why|how)[.!?]$/i.test(clean)) return false
  if (/\b(and|or|but|so|because|it'?s|the|a|an|i)[.!?]$/i.test(clean)) return false
  if (/\bSLO English\b/.test(clean)) return false
  if (/[.,]\?$/.test(clean)) return false
  if (/\bwhat did i do who is this\b/i.test(clean)) return false
  if (/^I do who is this[.!?]?$/i.test(clean)) return false
  if (/\bphone call a strange phone call I[.!?]?$/i.test(clean)) return false
  if (/^(in|after|before|at|for)\b/i.test(clean) && clean.split(/\s+/).length <= 4) return false
  if (/^my favorite [a-z]+[.!?]$/i.test(clean)) return false
  if (/\b(sugar sugar makes|you fat)\b/i.test(clean)) return false
  if (/\bbut i think[.!?]$/i.test(clean)) return false
  if (/\bin Mexico in Mexico\b/i.test(clean)) return false
  const wordCount = clean.split(/\s+/).length
  return wordCount >= 3 && wordCount <= 32
}

function normalizeText(text) {
  return String(text ?? '')
    .replace(/\[[^\]]+\]/g, ' ')
    .replace(/[“”]/g, '"')
    .replace(/[’]/g, "'")
    .replace(/\s+/g, ' ')
    .trim()
}

function normalizeToken(token) {
  return String(token).toLowerCase().replace(/[^a-z0-9]+/g, '')
}

function sentenceCase(text) {
  const clean = normalizeText(text).replace(/^[,.;:!?-]+/, '').trim()
  if (!clean) return clean
  const withCapital = clean[0].toUpperCase() + clean.slice(1)
  if (/^(what|who|where|when|why|how|do|does|did|are|is|can|could|would|will|have|has|had)\b/i.test(withCapital)) {
    return /[.!?]["']?$/.test(withCapital) ? withCapital.replace(/[.]$/, '?') : `${withCapital}?`
  }
  return /[.!?]["']?$/.test(withCapital) ? withCapital : `${withCapital}.`
}

function naturalCompare(a, b) {
  return a.localeCompare(b, undefined, { numeric: true, sensitivity: 'base' })
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms))
}

const THOUGHT_STARTERS = [
  'welcome back',
  'welcome to',
  'today\'s podcast',
  'today i',
  'today we',
  'today you',
  'today i am',
  "today i'm",
  'this podcast',
  'in the morning',
  'in the afternoon',
  'in the evening',
  'in my free time',
  'after breakfast',
  'after lunch',
  'after teaching',
  'before bed',
  'at 11:00 p.m.',
  'my favorite',
  'what is',
  'what are',
  'what was',
  'what would',
  'what does',
  'what did',
  'what do',
  'what type',
  'where do',
  'when do',
  'why do',
  'how do',
  'who do',
  'do you',
  'are there',
  'are you',
  'is there',
  'can you',
  'would you',
  'have you ever',
  'if you',
  'if not',
  'one thing',
  'for example',
  'first',
  'then',
  'next',
  'finally',
  'sometimes',
  'thank you',
  'tell me',
  'hello',
  'a woman',
  'the woman',
  'a man',
  'the man',
  'the driver',
  'the first',
  'the second',
  'one of the',
  'as soon as',
  "that's why",
  'i wake',
  'i brush',
  'i wash',
  'i eat',
  'i do',
  'i love',
  'i like',
  'i want',
  'i need',
  'i get',
  'i got',
  'i am',
  "i'm",
  "i've",
  'i have',
  'i had',
  'i picked',
  'i answered',
  'i asked',
  'i said',
  'i saw',
  'i sat',
  'i shook',
  'i hung',
  'i teach',
  'i work',
  'i study',
  'i normally',
  'i usually',
  'i relax',
  'i watch',
  'i read',
  'i cook',
  'i go',
  'i feel',
  'i think',
  'i would',
  "i don't",
  'we waited',
  'we said',
  "we don't",
  "we'll",
  'we had',
  'we got',
  'we lived',
  "we're",
  'we',
  'they',
  'he',
  'she',
  'she said',
  "she didn't",
  'she told',
  'he said',
  'it was',
  'it is',
]

const TOPIC_LABELS = {
  'daily routine': { en: 'daily routine', zh: '日常作息' },
  food: { en: 'food', zh: '食物與用餐' },
  travel: { en: 'travel', zh: '旅行' },
  people: { en: 'people', zh: '人物與關係' },
  work: { en: 'work', zh: '工作與學習' },
  language: { en: 'language', zh: '語言學習' },
  mindset: { en: 'mindset', zh: '心態與目標' },
  'everyday life': { en: 'everyday life', zh: '日常生活' },
}

const SENTENCE_TRANSLATIONS = {
  'a routine is something you do every day.': 'routine 指的是你每天會做的固定事情。',
  'this podcast is for beginners who want to practice listening to english.': '這集 podcast 適合想練習英文聽力的初學者。',
  'hello, my name is tyana ortiz. welcome to my slow english podcast.': '你好，我叫 Tyana Ortiz，歡迎來到我的慢速英文 podcast。',
  'i get ready for work.': '我準備去工作。',
  'i am a teacher.': '我是一位老師。',
  'i am an english teacher.': '我是一位英文老師。',
  'i study mandarin chinese.': '我學習中文。',
  'i normally eat a sandwich for lunch.': '我午餐通常吃三明治。',
  'i relax at home.': '我在家放鬆。',
  'i watch tv.': '我看電視。',
  'i read a book.': '我讀一本書。',
  'at 11:00 p.m., i go to sleep.': '晚上 11 點，我去睡覺。',
}

const TOPIC_WORD_TRANSLATIONS = {
  a: '一個',
  about: '關於',
  alfredo: '阿爾弗雷多',
  airport: '機場',
  bananas: '香蕉',
  berries: '莓果',
  book: '書',
  class: '課',
  comfy: '舒服',
  cozy: '舒適',
  dance: '跳舞',
  dancing: '跳舞',
  day: '一天',
  dinner: '晚餐',
  english: '英文',
  every: '每個',
  face: '臉',
  feeling: '感覺',
  free: '空閒',
  job: '工作',
  honey: '蜂蜜',
  lunch: '午餐',
  my: '我的',
  mandarin: '中文',
  morning: '早上',
  normally: '通常',
  oatmeal: '燕麥',
  pasta: '義大利麵',
  podcast: 'podcast',
  routine: '例行作息',
  salsa: '莎莎舞',
  sandwich: '三明治',
  sleep: '睡覺',
  sleeping: '睡覺',
  strawberries: '草莓',
  students: '學生',
  stretching: '伸展',
  teacher: '老師',
  teeth: '牙齒',
  time: '時間',
  tv: '電視',
  with: '加',
  work: '工作',
  dog: '狗',
  phone: '電話',
  call: '通電話',
  weird: '奇怪的',
  strange: '奇怪的',
  serious: '嚴肅的',
  voice: '聲音',
  confused: '困惑的',
  pretend: '假裝',
  stole: '偷走',
  wrong: '錯的',
  number: '號碼',
  park: '公園',
  fluffy: '毛茸茸的',
  couch: '沙發',
  bus: '公車',
  driver: '司機',
  family: '家人',
  boys: '男孩',
  hobbies: '嗜好',
  sports: '運動',
  soccer: '足球',
  ballet: '芭蕾',
  gymnastics: '體操',
  competition: '比賽',
  jog: '慢跑',
  jogging: '慢跑',
  therapeutic: '有療癒感的',
  exercise: '運動',
  activity: '活動',
  mental: '心理的',
  health: '健康',
  dream: '夢',
  dreams: '夢',
  journal: '日記',
  subconscious: '潛意識',
  mysterious: '神祕的',
  inspired: '受到啟發的',
  recurring: '反覆出現的',
  yoga: '瑜珈',
}

const PHRASE_TRANSLATIONS = {
  'welcome back': '歡迎回來',
  'welcome to': '歡迎來到',
  'my daily routine': '我的日常作息',
  'daily routine': '日常作息',
  'phone call': '電話',
  'wrong number': '打錯電話',
  'look like': '看起來像',
  'picked up': '拿起；接起；順路買/拿',
  'hung up': '掛斷電話',
  'what would you do': '你會怎麼做',
  'have you ever': '你曾經有沒有',
  'oatmeal with bananas strawberries berries and honey': '燕麥、香蕉、草莓、莓果和蜂蜜',
  'oatmeal every day': '每天吃燕麥',
  'stretching every day': '每天伸展',
  'salsa dance class': '莎莎舞課',
  students: '學生',
  breakfast: '早餐',
  lunch: '午餐',
  dinner: '晚餐',
  work: '工作',
  'clear my mind': '讓腦袋清楚',
  'mental health': '心理健康',
  'comfort food': '療癒食物',
  'used to think': '以前曾經認為',
  'can get enough': '覺得不夠、很想要更多',
  'take for granted': '把某事視為理所當然',
  'recurring dreams': '反覆出現的夢',
}

const COMMON_VERBS = new Set([
  'be', 'am', 'is', 'are', 'was', 'were', 'have', 'has', 'had', 'do', 'does', 'did',
  'go', 'goes', 'went', 'make', 'made', 'take', 'took', 'get', 'got', 'want', 'wanted',
  'need', 'needed', 'learn', 'learned', 'listen', 'listened', 'speak', 'spoke', 'talk',
  'talked', 'think', 'thought', 'feel', 'felt', 'look', 'looked', 'watch', 'watched',
  'read', 'write', 'work', 'worked', 'study', 'studied', 'eat', 'ate', 'sleep', 'slept',
])

const STOPWORDS = new Set([
  'the', 'and', 'for', 'you', 'your', 'that', 'this', 'with', 'from', 'have', 'has',
  'had', 'are', 'was', 'were', 'will', 'would', 'can', 'could', 'should', 'about',
  'what', 'when', 'where', 'which', 'who', 'why', 'how', 'there', 'their', 'they',
  'them', 'then', 'than', 'into', 'onto', 'also', 'very', 'just', 'like', 'really',
  'said', 'say', 'says', 'ask', 'asked', 'answer', 'answered', 'did', 'does', 'doing',
  'not', 'got', 'gets', 'getting',
  'she', 'her', 'him', 'his', 'our', 'ours', 'all', 'one', 'ones', 'some', 'any',
  'always', 'maybe', 'before', 'after', 'again', 'ever', 'never', 'even', 'once',
  'twice', 'thing', 'things', 'lot', 'lots', 'much', 'many', 'more', 'most', 'first',
  'second', 'third', 'another', 'other', 'same', 'way', 'back', 'clear', 'levels',
  'its', "it's", 'im', "i'm", 'ive', "i've",
  'because', 'today', 'english', 'slow', 'podcast', 'practice', 'learn', 'learning',
  'listening', 'beginner', 'beginners', 'intermediate', 'comprehensible', 'input',
  'misshoney', 'tyana', 'ortiz', 'video', 'hello', 'welcome', 'thank', 'thanks', 'music',
])

const PHRASE_CANDIDATES = [
  'welcome back',
  'welcome to',
  'my name is',
  'what do you',
  'what does',
  'what did',
  'what would you do',
  'have you ever',
  'do you like',
  'wrong number',
  'phone call',
  'look like',
  'picked up',
  'hung up',
  'daily routine',
  'in the morning',
  'in the evening',
  'in my free time',
  'get ready',
  'used to',
  'going to',
  'go for a jog',
  'want to',
  'have to',
  'need to',
  'try to',
  'talk about',
  'for example',
  'at the same time',
  'one of the',
  'a little bit',
  'it depends',
  'as much as',
  'clear my mind',
  'mental health',
  'comfort food',
  'used to think',
  'can get enough',
  'take for granted',
  'recurring dreams',
  'i think',
  'i feel',
  'i love',
  'i like',
  'i want',
  'i need',
  'i usually',
  'my favorite',
  'can stand',
  "can't stand",
]

const WORD_MEANINGS = {
  dog: '狗',
  phone: '電話',
  call: '通電話；打電話',
  weird: '奇怪的',
  strange: '奇怪的；陌生的',
  serious: '嚴肅的',
  voice: '聲音',
  confused: '困惑的',
  pretend: '假裝',
  stole: '偷走；steal 的過去式',
  steal: '偷',
  wrong: '錯的',
  number: '電話號碼；數字',
  park: '公園',
  fluffy: '毛茸茸的',
  couch: '沙發',
  bus: '公車',
  driver: '司機',
  family: '家人；家庭',
  boys: '男孩們',
  mother: '母親',
  hobbies: '嗜好',
  hobby: '嗜好',
  sports: '運動',
  soccer: '足球',
  ballet: '芭蕾',
  gymnastics: '體操',
  competition: '比賽',
  competitions: '比賽',
  jog: '慢跑',
  jogging: '慢跑',
  therapeutic: '有療癒感的',
  exercise: '運動；練習',
  activity: '活動',
  physical: '身體的',
  mental: '心理的',
  health: '健康',
  drawing: '畫畫',
  writing: '寫作',
  knitting: '編織',
  gardening: '園藝',
  cooking: '烹飪',
  dream: '夢；夢想',
  dreams: '夢；夢想',
  journal: '日記',
  subconscious: '潛意識',
  mysterious: '神祕的',
  inspired: '受到啟發的',
  recurring: '反覆出現的',
  interpret: '解讀',
  interpretations: '解讀方式',
  breakfast: '早餐',
  lunch: '午餐',
  dinner: '晚餐',
  routine: '例行生活',
  teacher: '老師',
  student: '學生',
  travel: '旅行',
  airport: '機場',
  language: '語言',
  friend: '朋友',
  food: '食物',
  spicy: '辣的',
  sweet: '甜的',
  goal: '目標',
  hope: '希望',
  confidence: '信心',
  memory: '回憶',
}

const PHRASE_MEANINGS = {
  'welcome back': '歡迎回來',
  'welcome to': '歡迎來到',
  'my name is': '我的名字是',
  'what do you': '你會怎麼...',
  'what does': '用來詢問某物是什麼樣子或代表什麼',
  'what did': '用來詢問過去發生了什麼',
  'what would you do': '你會怎麼做',
  'have you ever': '你曾經有沒有',
  'do you like': '你喜歡...嗎',
  'phone call': '電話；通電話',
  'wrong number': '打錯電話',
  'look like': '看起來像',
  'picked up': '拿起；接起；順路買/拿',
  'hung up': '掛斷電話',
  'daily routine': '日常作息',
  'in the morning': '在早上',
  'in the evening': '在晚上',
  'in my free time': '在我的空閒時間',
  'get ready': '準備好',
  'used to': '以前曾經',
  'talk about': '談論',
  'my favorite': '我最喜歡的',
  'clear my mind': '讓腦袋清楚、減少雜念',
  'mental health': '心理健康',
  'comfort food': '讓人有安慰感的食物',
  'used to think': '以前曾經認為',
  'can get enough': '覺得不夠、很想要更多',
  'take for granted': '把某事視為理所當然',
  'recurring dreams': '反覆出現的夢',
  "can't stand": '受不了',
}

const KK_OVERRIDES = {
  dog: '/dɔɡ/',
  phone: '/foʊn/',
  call: '/kɔl/',
  weird: '/wɪrd/',
  strange: '/strendʒ/',
  serious: '/ˈsɪriəs/',
  voice: '/vɔɪs/',
  confused: '/kənˈfjuzd/',
  pretend: '/prɪˈtɛnd/',
  stole: '/stoʊl/',
  wrong: '/rɔŋ/',
  number: '/ˈnʌmbɚ/',
  park: '/pɑrk/',
  fluffy: '/ˈflʌfi/',
  couch: '/kaʊtʃ/',
  bus: '/bʌs/',
  driver: '/ˈdraɪvɚ/',
  family: '/ˈfæməli/',
  hobbies: '/ˈhɑbiz/',
  sports: '/spɔrts/',
  soccer: '/ˈsɑkɚ/',
  ballet: '/bæˈleɪ/',
  gymnastics: '/dʒɪmˈnæstɪks/',
  jogging: '/ˈdʒɑɡɪŋ/',
  therapeutic: '/ˌθɛrəˈpjutɪk/',
  exercise: '/ˈɛksɚˌsaɪz/',
  physical: '/ˈfɪzɪkəl/',
  mental: '/ˈmɛntəl/',
  health: '/hɛlθ/',
  dream: '/drim/',
  dreams: '/drimz/',
  journal: '/ˈdʒɝnəl/',
  subconscious: '/sʌbˈkɑnʃəs/',
  mysterious: '/mɪˈstɪriəs/',
  inspired: '/ɪnˈspaɪrd/',
  recurring: '/rɪˈkɝɪŋ/',
  breakfast: '/ˈbrɛkfəst/',
  lunch: '/lʌntʃ/',
  dinner: '/ˈdɪnɚ/',
  routine: '/ruːˈtiːn/',
  teacher: '/ˈtitʃɚ/',
  student: '/ˈstudənt/',
  travel: '/ˈtrævəl/',
  airport: '/ˈɛrˌpɔrt/',
  language: '/ˈlæŋɡwɪdʒ/',
  friend: '/frɛnd/',
  food: '/fud/',
  spicy: '/ˈspaɪsi/',
  sweet: '/swit/',
  goal: '/ɡoʊl/',
  hope: '/hoʊp/',
  confidence: '/ˈkɑnfədəns/',
  memory: '/ˈmɛməri/',
}

let errorCount = 0
for (const level of levelsToProcess) {
  errorCount += await authorLevel(level)
}

if (errorCount > 0) {
  console.error(`\nAuthoring finished with ${errorCount} validation error(s).`)
  process.exit(1)
}

console.log('\nPolished authoring complete.')
