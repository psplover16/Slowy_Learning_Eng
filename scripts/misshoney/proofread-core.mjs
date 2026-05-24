import { existsSync, readFileSync } from 'node:fs'
import { resolve } from 'node:path'

export const REQUIRED_PROOFREAD_KEYS = [
  'correctedText',
  'translation',
  'segments',
  'words',
  'phrases',
  'usages',
  'grammar',
]

const MARKED_TEXT_PATTERN = /\*\*([^*]+)\*\*|__([^_]+)__|《([^》]+)》/g
const HTML_PATTERN = /<\/?[a-z][^>]*>/i

/**
 * Resolve promoted PlaylistVideoData metadata for a level/slug pair.
 * @param {{ repoRoot: string, level: string, slug: string }} params
 */
export function resolveVideoMetadata({ repoRoot, level, slug }) {
  const filePath = resolve(
    repoRoot,
    'src/modules/playlists/data/videos',
    String(level),
    `${String(slug)}.json`
  )

  if (!existsSync(filePath)) {
    throw new Error(`video metadata not found: level=${level} slug=${slug} path=${filePath}`)
  }

  const data = JSON.parse(readFileSync(filePath, 'utf-8'))
  for (const key of ['videoId', 'slug', 'level', 'title', 'youtubeUrl']) {
    if (!data[key] || !String(data[key]).trim()) {
      throw new Error(`video metadata missing required field: ${key}`)
    }
  }

  return {
    videoId: data.videoId,
    slug: data.slug,
    level: data.level,
    title: data.title,
    youtubeUrl: data.youtubeUrl,
    header: data.header,
  }
}

/**
 * Parse the machine-readable JSON block from proofread_result.md.
 * @param {string} markdown
 */
export function parseProofreadMarkdown(markdown) {
  const jsonText = extractJsonCodeBlock(markdown)
  let parsed
  try {
    parsed = JSON.parse(jsonText)
  } catch (error) {
    throw new Error(`invalid proofread JSON: ${error.message}`, { cause: error })
  }

  return normalizeProofreadDraft(parsed)
}

export function extractJsonCodeBlock(markdown) {
  const match = String(markdown ?? '').match(/```json\s*([\s\S]*?)```/i)
  if (!match) {
    throw new Error('proofread_result.md missing required JSON code block')
  }
  return match[1].trim()
}

/**
 * Validate and normalize a proofread JSON object without changing subtitle content.
 * @param {unknown} value
 */
export function normalizeProofreadDraft(value) {
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    throw new Error('proofread JSON must be an object')
  }

  const draft = { ...value }
  for (const key of REQUIRED_PROOFREAD_KEYS) {
    if (!(key in draft)) {
      throw new Error(`missing required key: ${key}`)
    }
  }

  findUnsafeHtml(draft)

  for (const key of ['segments', 'words', 'phrases', 'usages', 'grammar']) {
    if (!Array.isArray(draft[key])) {
      throw new Error(`${key} must be an array`)
    }
  }

  if (!String(draft.correctedText ?? '').trim()) {
    throw new Error('correctedText must not be empty')
  }
  if (!String(draft.translation ?? '').trim()) {
    throw new Error('translation must not be empty')
  }

  const normalized = {
    correctedText: String(draft.correctedText),
    translation: String(draft.translation),
    segments: draft.segments.map((segment, index) => normalizeSegment(segment, index)),
    words: mergeWordsByLemma(draft.words.map((word, index) => normalizeWord(word, index))),
    phrases: draft.phrases.map((phrase, index) => normalizePhrase(phrase, index)),
    usages: draft.usages.map((usage, index) => normalizeUsage(usage, index)),
    grammar: draft.grammar.map((grammar, index) => normalizeGrammar(grammar, index)),
  }

  validateMarkedSegments(normalized)
  return normalized
}

export function formatTranscriptUnavailableError({ level, slug, youtubeUrl, reason }) {
  return [
    'MissHoney transcript unavailable.',
    `level=${level}`,
    `slug=${slug}`,
    `youtubeUrl=${youtubeUrl}`,
    `reason=${reason}`,
  ].join(' ')
}

export function buildPlaylistVideoDataFromProofread({ metadata, draft }) {
  const words = mergeWordsByLemma(draft.words ?? [])
  const phrases = draft.phrases ?? []
  const usages = draft.usages ?? []
  const targets = buildLearningTargets({ words, phrases, usages })

  const sourceSegments = (draft.segments?.length ? draft.segments : [{
    english: draft.correctedText,
    translation: draft.translation,
  }]).flatMap((segment, index) => splitSegmentIntoSentences({
    english: String(segment.english ?? segment.en ?? '').trim(),
    translation: String(segment.translation ?? segment.tc ?? '').trim(),
    index,
  })).filter(segment => segment.english && segment.translation)

  const scenes = buildScenesFromSegments({ segments: sourceSegments, targets, metadata })
  const vocabGroups = [{
    title: `${String(metadata.level).toUpperCase()} 重點單字`,
    items: words.map(word => ({
      id: targetIdForWord(word),
      lemma: normalizedLemma(word),
      english: word.surface || word.lemma,
      kk: word.kk,
      partOfSpeech: word.partOfSpeech,
      meaning: word.meaning,
      note: word.note,
      highlight: true,
    })),
  }]
  const normalizedPhrases = phrases.map(phrase => ({
    id: targetIdForPhrase(phrase),
    phrase: phrase.phrase,
    meaning: phrase.meaning,
    examples: normalizeExamples(phrase.examples, phrase.meaning),
  }))
  const normalizedUsages = usages.map(usage => ({
    id: targetIdForUsage(usage),
    word: usage.word,
    familiarMeaning: usage.familiarMeaning,
    usage: usage.usage,
    translation: usage.translation,
    examples: usage.examples,
  }))
  const breakdowns = buildBreakdowns({ grammar: draft.grammar ?? [], segments: sourceSegments })

  return {
    videoId: metadata.videoId,
    slug: metadata.slug,
    level: metadata.level,
    title: metadata.title,
    youtubeUrl: metadata.youtubeUrl,
    header: {
      podcastLabel: metadata.header?.podcastLabel ?? `MissHoney ${String(metadata.level).toUpperCase()}`,
      titleZh: metadata.header?.titleZh ?? metadata.title,
      titleEn: metadata.header?.titleEn ?? metadata.title,
      levelTag: metadata.header?.levelTag ?? String(metadata.level).toUpperCase(),
      topicTag: metadata.header?.topicTag ?? 'proofread',
    },
    scenes,
    vocabGroups,
    phrases: normalizedPhrases,
    usages: normalizedUsages,
    breakdowns,
  }
}

function normalizeSegment(segment, index) {
  if (!segment || typeof segment !== 'object') {
    throw new Error(`segments[${index}] must be an object`)
  }
  const english = String(segment.english ?? segment.en ?? '').trim()
  const translation = String(segment.translation ?? segment.tc ?? '').trim()
  if (!english) throw new Error(`segments[${index}].english must not be empty`)
  if (!translation) throw new Error(`segments[${index}].translation must not be empty`)
  return { ...segment, english, translation }
}

function normalizeWord(word, index) {
  if (!word || typeof word !== 'object') {
    throw new Error(`words[${index}] must be an object`)
  }
  const lemma = String(word.lemma ?? word.surface ?? '').trim()
  const surface = String(word.surface ?? lemma).trim()
  const partOfSpeech = String(word.partOfSpeech ?? word.pos ?? '').trim()
  const kk = String(word.kk ?? '').trim()
  const meaning = String(word.meaning ?? '').trim()
  if (!lemma) throw new Error(`words[${index}].lemma must not be empty`)
  if (!partOfSpeech) throw new Error(`words[${index}].partOfSpeech must not be empty`)
  if (!kk) throw new Error(`words[${index}].kk must not be empty`)
  if (!meaning) throw new Error(`words[${index}].meaning must not be empty`)
  return {
    ...word,
    lemma,
    surface,
    surfaces: normalizeSurfaceAliases(word.surfaces ?? surface),
    partOfSpeech,
    kk,
    meaning,
    examples: normalizeStringList(word.examples),
  }
}

function normalizePhrase(phrase, index) {
  if (!phrase || typeof phrase !== 'object') {
    throw new Error(`phrases[${index}] must be an object`)
  }
  const text = String(phrase.phrase ?? '').trim()
  const meaning = String(phrase.meaning ?? '').trim()
  if (!text) throw new Error(`phrases[${index}].phrase must not be empty`)
  if (!meaning) throw new Error(`phrases[${index}].meaning must not be empty`)
  return {
    ...phrase,
    phrase: text,
    meaning,
    surfaces: uniqueStrings([
      ...normalizePhraseAliases(text),
      ...normalizePhraseAliases(phrase.surface, { allowSingleWord: true }),
      ...normalizePhraseAliases(phrase.surfaces, { allowSingleWord: true }),
      ...normalizePhraseAliases(Array.isArray(phrase.examples) ? phrase.examples : []),
    ]),
    examples: Array.isArray(phrase.examples) ? phrase.examples : [],
  }
}

function normalizeUsage(usage, index) {
  if (!usage || typeof usage !== 'object') {
    throw new Error(`usages[${index}] must be an object`)
  }
  const word = String(usage.word ?? '').trim()
  const familiarMeaning = String(usage.familiarMeaning ?? '').trim()
  const usageText = String(usage.usage ?? '').trim()
  const translation = String(usage.translation ?? '').trim()
  if (!word) throw new Error(`usages[${index}].word must not be empty`)
  if (!familiarMeaning) throw new Error(`usages[${index}].familiarMeaning must not be empty`)
  if (!usageText) throw new Error(`usages[${index}].usage must not be empty`)
  if (!translation) throw new Error(`usages[${index}].translation must not be empty`)
  const examples = normalizeStringList(usage.examples)
  if (examples.length === 0) throw new Error(`usages[${index}].examples must be a non-empty array`)
  return {
    ...usage,
    word,
    surfaces: normalizeUsageAliases(usage.surfaces ?? [word, ...examples]),
    familiarMeaning,
    usage: usageText,
    translation,
    examples,
  }
}

function normalizeGrammar(grammar, index) {
  if (!grammar || typeof grammar !== 'object') {
    throw new Error(`grammar[${index}] must be an object`)
  }
  const title = String(grammar.title ?? grammar.label ?? grammar.name ?? grammar.topic ?? `Grammar ${index + 1}`).trim()
  const sentence = String(grammar.sentence ?? grammar.sourceSentence ?? '').trim()
  const translation = String(grammar.translation ?? '').trim()
  const structure = String(grammar.structure ?? '').trim()
  const explanation = String(grammar.explanation ?? grammar.text ?? grammar.note ?? '').trim()
  return {
    ...grammar,
    id: grammar.id ? String(grammar.id) : `grammar-${index + 1}`,
    title,
    sentence,
    translation,
    structure,
    explanation,
  }
}

function mergeWordsByLemma(words) {
  const byLemma = new Map()
  for (const word of words) {
    const lemma = normalizedLemma(word)
    const nextSurfaces = normalizeSurfaceAliases(word.surfaces ?? word.surface)
    if (!byLemma.has(lemma)) {
      byLemma.set(lemma, { ...word, lemma, surfaces: nextSurfaces })
      continue
    }
    const existing = byLemma.get(lemma)
    const surfaces = new Set([...(existing.surfaces ?? []), ...nextSurfaces])
    byLemma.set(lemma, {
      ...existing,
      surface: existing.surface || word.surface,
      surfaces: Array.from(surfaces),
      examples: uniqueStrings([...(existing.examples ?? []), ...(word.examples ?? [])]),
    })
  }
  return Array.from(byLemma.values())
}

function buildLearningTargets({ words, phrases, usages }) {
  const wordSurfaceTargets = words.flatMap(word => {
    const targetId = targetIdForWord(word)
    return normalizeSurfaceAliases(word.surfaces ?? (word.surface || word.lemma))
      .map(surface => [normalizeLookup(surface), targetId])
  })
  const phraseSurfaceTargets = phrases.flatMap(phrase => {
    const targetId = targetIdForPhrase(phrase)
    return normalizePhraseAliases(phrase.surfaces ?? phrase.phrase, {
      allowSingleWord: Array.isArray(phrase.surfaces),
    })
      .map(surface => [normalizeLookup(surface), targetId])
  })
  const usageSurfaceTargets = usages.flatMap(usage => {
    const targetId = targetIdForUsage(usage)
    return normalizeUsageAliases(usage.surfaces ?? usage.word)
      .map(surface => [normalizeLookup(surface), targetId])
  })

  return {
    words: new Map(wordSurfaceTargets),
    wordLemmas: new Map(words.map(word => [normalizeLookup(word.lemma), targetIdForWord(word)])),
    phrases: new Map(phraseSurfaceTargets),
    usages: new Map(usageSurfaceTargets),
  }
}

function buildScenesFromSegments({ segments, targets, metadata }) {
  const scenes = []
  const chunkSize = 4
  for (let i = 0; i < segments.length; i += chunkSize) {
    const chunk = segments.slice(i, i + chunkSize)
    const sceneNo = scenes.length + 1
    scenes.push({
      id: `scene-${String(sceneNo).padStart(2, '0')}`,
      no: String(sceneNo).padStart(2, '0'),
      titleZh: `第 ${sceneNo} 段`,
      titleEn: `Part ${sceneNo}`,
      sentences: chunk.map((segment, offset) => {
        const sentenceIndex = i + offset + 1
        const en = stripMarkdownMarkers(segment.english)
        const instancePrefix = [
          String(metadata.level),
          String(metadata.slug),
          String(sentenceIndex).padStart(3, '0'),
        ].join('-')
        return {
          en,
          tc: segment.translation,
          englishTokens: tokenizeMarkedEnglish({
            markedEnglish: segment.english,
            targets,
            instancePrefix,
          }),
        }
      }),
      tags: [],
    })
  }
  return scenes
}

function splitSegmentIntoSentences({ english, translation, index }) {
  const englishSentences = splitEnglishSentences(english)
  const translationSentences = splitChineseSentences(translation)

  if (englishSentences.length <= 1 || translationSentences.length < englishSentences.length) {
    return [{ english, translation, index }]
  }

  return englishSentences.map((englishSentence, sentenceIndex) => ({
    english: englishSentence,
    translation: translationSentences[sentenceIndex] ?? translation,
    index: `${index}-${sentenceIndex}`,
  }))
}

function splitEnglishSentences(value) {
  const boundary = '<sentence-boundary>'
  const protectedText = String(value ?? '')
    .replace(/\ba\.m\./gi, match => match.replace(/\./g, '<dot>'))
    .replace(/\bp\.m\./gi, match => match.replace(/\./g, '<dot>'))
    .replace(/\bMr\./g, 'Mr<dot>')
    .replace(/\bMs\./g, 'Ms<dot>')
    .replace(/\bMrs\./g, 'Mrs<dot>')
    .replace(/\bDr\./g, 'Dr<dot>')
    .replace(/\bSt\./g, 'St<dot>')

  return protectedText
    .replace(/([.!?]["']?)\s+/g, `$1${boundary}`)
    .split(boundary)
    .map(sentence => sentence.replace(/<dot>/g, '.').trim())
    .filter(Boolean)
}

function splitChineseSentences(value) {
  const sentences = []
  const text = String(value ?? '').trim()
  let buffer = ''
  for (const char of text) {
    buffer += char
    if (/[。！？]/.test(char)) {
      sentences.push(buffer.trim())
      buffer = ''
    }
  }
  if (buffer.trim()) sentences.push(buffer.trim())
  return sentences
}

function tokenizeMarkedEnglish({ markedEnglish, targets, instancePrefix }) {
  const tokens = []
  let cursor = 0
  let markerIndex = 1
  for (const match of String(markedEnglish).matchAll(MARKED_TEXT_PATTERN)) {
    const start = match.index ?? 0
    if (start > cursor) {
      tokens.push({ type: 'text', text: String(markedEnglish).slice(cursor, start) })
    }

    const marker = markerFromMatch(match)
    const text = marker.text
    const target = resolveTokenTarget(text, targets, marker.type)
    if (target) {
      tokens.push({
        type: target.type,
        text,
        targetId: target.id,
        instanceId: `marker-${instancePrefix}-${String(markerIndex).padStart(2, '0')}`,
      })
      markerIndex += 1
    } else {
      tokens.push({ type: 'text', text })
    }
    cursor = start + match[0].length
  }

  if (cursor < String(markedEnglish).length) {
    tokens.push({ type: 'text', text: String(markedEnglish).slice(cursor) })
  }

  const merged = []
  for (const token of tokens.length ? tokens : [{ type: 'text', text: String(markedEnglish) }]) {
    const text = stripMarkdownMarkers(token.text)
    if (!text) continue
    const previous = merged[merged.length - 1]
    if (token.type === 'text' && previous?.type === 'text') {
      previous.text += text
    } else {
      merged.push({ ...token, text })
    }
  }
  return merged
}

function resolveTokenTarget(text, targets, markerType) {
  const lookup = normalizeLookup(text)
  if (markerType === 'word') {
    const wordTarget = targets.words.get(lookup) ?? targets.wordLemmas.get(lookup)
    return wordTarget ? { type: 'word', id: wordTarget } : null
  }
  if (markerType === 'phrase') {
    const phraseTarget = targets.phrases.get(lookup)
    return phraseTarget ? { type: 'phrase', id: phraseTarget } : null
  }
  if (markerType === 'usage') {
    const usageTarget = targets.usages.get(lookup)
    return usageTarget ? { type: 'usage', id: usageTarget } : null
  }

  const phraseTarget = targets.phrases.get(lookup)
  if (phraseTarget) return { type: 'phrase', id: phraseTarget }

  const usageTarget = targets.usages.get(lookup)
  if (usageTarget) return { type: 'usage', id: usageTarget }

  const wordTarget = targets.words.get(lookup) ?? targets.wordLemmas.get(lookup)
  if (wordTarget) return { type: 'word', id: wordTarget }

  return null
}

function validateMarkedSegments(draft) {
  const targets = buildLearningTargets({
    words: draft.words,
    phrases: draft.phrases,
    usages: draft.usages,
  })

  for (let si = 0; si < draft.segments.length; si++) {
    const segment = draft.segments[si]
    for (const match of String(segment.english).matchAll(MARKED_TEXT_PATTERN)) {
      const marker = markerFromMatch(match)
      if (!resolveTokenTarget(marker.text, targets, marker.type)) {
        throw new Error(`marker target not found: ${marker.type} "${marker.text}" at segments[${si}].english`)
      }
    }
  }
}

function markerFromMatch(match) {
  if (match[1] !== undefined) return { type: 'word', text: match[1] }
  if (match[2] !== undefined) return { type: 'phrase', text: match[2] }
  return { type: 'usage', text: match[3] }
}

function buildBreakdowns({ grammar, segments }) {
  const breakdowns = grammar.map((item, index) => ({
    id: item.id ? String(item.id) : `breakdown-${String(index + 1).padStart(2, '0')}`,
    sentence: stripMarkdownMarkers(item.sentence ?? segments[index]?.english ?? segments[0]?.english ?? ''),
    translation: String(item.translation ?? segments[index]?.translation ?? segments[0]?.translation ?? '').trim(),
    points: normalizeGrammarPoints(item, index),
  })).filter(item => item.sentence && item.translation && item.points.length > 0)

  if (breakdowns.length > 0) return breakdowns

  const first = segments[0]
  return [{
    id: 'breakdown-01',
    sentence: first?.english ?? 'This podcast is for beginners who want to practice listening to English.',
    translation: first?.translation ?? '這集適合想練習英文聽力的初學者。',
    points: [{
      label: '句子重點',
      text: '先看完整句，再回頭練習關鍵單字與片語。',
      note: '分類不確定的文法留在影片頁內，不新增到全站文法卡片。',
    }],
  }]
}

function normalizeGrammarPoints(item, index) {
  if (Array.isArray(item.points) && item.points.length > 0) {
    return item.points.map((point, pointIndex) => ({
      label: String(point.label ?? point.title ?? `Point ${pointIndex + 1}`).trim(),
      text: String(point.text ?? point.explanation ?? '').trim(),
      note: String(point.note ?? point.translation ?? point.example ?? '').trim(),
    })).filter(point => point.label && point.text && point.note)
  }

  const label = String(item.title ?? item.name ?? item.label ?? `Grammar ${index + 1}`).trim()
  const structure = String(item.structure ?? '').trim()
  const explanation = String(item.explanation ?? item.text ?? item.note ?? '').trim()
  if (structure && explanation) {
    return [{
      label,
      text: structure,
      note: explanation,
    }]
  }

  const text = explanation || structure
  if (!text) return []
  return [{
    label,
    text,
    note: String(item.example ?? item.translation ?? text).trim(),
  }]
}

function targetIdForWord(word) {
  return word.id ? String(word.id) : `word-${slugify(word.lemma || word.surface)}`
}

function targetIdForPhrase(phrase) {
  return phrase.id ? String(phrase.id) : `phrase-${slugify(phrase.phrase)}`
}

function targetIdForUsage(usage) {
  return usage.id ? String(usage.id) : `usage-${slugify(usage.word)}-${slugify(usage.usage).slice(0, 32)}`
}

function normalizeExamples(examples, fallbackTc) {
  const normalized = Array.isArray(examples) ? examples : []
  const mapped = normalized.map(example => {
    if (typeof example === 'string') {
      return { en: example, tc: fallbackTc }
    }
    return {
      en: String(example?.en ?? example?.english ?? '').trim(),
      tc: String(example?.tc ?? example?.translation ?? fallbackTc ?? '').trim(),
    }
  }).filter(example => example.en && example.tc)
  return mapped.length > 0 ? mapped : [{ en: '', tc: '' }]
}

function normalizeStringList(value) {
  if (!Array.isArray(value)) return []
  return value.map(item => {
    if (typeof item === 'string') return item.trim()
    return String(item?.en ?? item?.english ?? '').trim()
  }).filter(Boolean)
}

function normalizeSurfaceAliases(value) {
  if (Array.isArray(value)) {
    return uniqueStrings(value.flatMap(item => normalizeSurfaceAliases(item)))
  }

  return uniqueStrings(String(value ?? '')
    .split(/[;,/|]+|\s+\bor\b\s+/i)
    .map(surface => surface.trim()))
}

function normalizePhraseAliases(value, options = {}) {
  const allowSingleWord = options.allowSingleWord === true
  if (Array.isArray(value)) {
    return uniqueStrings(value.flatMap(item => normalizePhraseAliases(item, options)))
  }

  const text = stripMarkdownMarkers(String(value ?? '')).trim()
  const marked = []
  for (const match of String(value ?? '').matchAll(MARKED_TEXT_PATTERN)) {
    marked.push(markerFromMatch(match).text)
  }

  const textAliases = allowSingleWord || normalizeLookup(text).split(/\s+/).filter(Boolean).length > 1
    ? [text]
    : []
  return uniqueStrings([...textAliases, ...textAliases.flatMap(inflectPhraseHead), ...marked])
}

function inflectPhraseHead(phrase) {
  const words = String(phrase ?? '').trim().split(/\s+/).filter(Boolean)
  if (words.length < 2) return []

  const [head, ...rest] = words
  const variants = []
  if (/^[a-z]+$/i.test(head)) {
    if (/[^aeiou]y$/i.test(head)) {
      variants.push(`${head.slice(0, -1)}ies`)
    } else if (/(s|x|z|ch|sh|o)$/i.test(head)) {
      variants.push(`${head}es`)
    } else {
      variants.push(`${head}s`)
    }
  }

  return variants.map(variant => [variant, ...rest].join(' '))
}

function normalizeUsageAliases(value) {
  if (Array.isArray(value)) {
    return uniqueStrings(value.flatMap(item => normalizeUsageAliases(item)))
  }

  const marked = []
  for (const match of String(value ?? '').matchAll(MARKED_TEXT_PATTERN)) {
    const marker = markerFromMatch(match)
    if (marker.type === 'usage') marked.push(marker.text)
  }
  return uniqueStrings([String(value ?? '').trim(), ...marked])
}

function findUnsafeHtml(value, path = 'proofread') {
  if (typeof value === 'string') {
    if (HTML_PATTERN.test(value)) {
      throw new Error(`unsafe html string at ${path}`)
    }
    return
  }
  if (Array.isArray(value)) {
    value.forEach((item, index) => findUnsafeHtml(item, `${path}[${index}]`))
    return
  }
  if (value && typeof value === 'object') {
    for (const [key, item] of Object.entries(value)) {
      findUnsafeHtml(item, `${path}.${key}`)
    }
  }
}

function stripMarkdownMarkers(text) {
  return String(text ?? '').replace(MARKED_TEXT_PATTERN, (_full, word, phrase, usage) => word ?? phrase ?? usage ?? '')
}

function normalizedLemma(word) {
  return String(word.lemma ?? word.surface ?? word.english ?? '').trim().toLowerCase()
}

function normalizeLookup(value) {
  return String(value ?? '').toLowerCase().replace(/[^a-z0-9']+/g, ' ').trim()
}

function slugify(value) {
  const slug = String(value ?? '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
  return slug || 'item'
}

function uniqueStrings(values) {
  return Array.from(new Set(values.map(value => String(value).trim()).filter(Boolean)))
}
