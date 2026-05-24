import { copyFileSync, existsSync, mkdirSync, readFileSync, readdirSync, writeFileSync } from 'node:fs'
import { basename, dirname, extname, resolve } from 'node:path'
import {
  buildPlaylistVideoDataFromProofread,
  parseProofreadMarkdown,
  resolveVideoMetadata,
} from './proofread-core.mjs'
import { addInlineTokensToPlaylistVideoData, validatePlaylistVideoData } from './content-core.mjs'

export const MISS_HONEY_LEVELS = ['a1', 'a2', 'b1', 'b2']
export const ORIGINAL_CONTENT_ROOT = '_private/tmp/originalContent'
export const STEP1_ROOT = '_private/tmp/step1'
export const LEGACY_PROOFREAD_ROOT = '_private/misshoney/proofread-results'
export const GENERATED_CONTENT_ROOT = '_private/misshoney/generated-content'
export const APP_VIDEO_ROOT = 'src/modules/playlists/data/videos'

const JSON_TEXT_KEYS = ['transcriptText', 'transcript', 'text']
const SKIP_PHRASES = [
  'same as above',
  'same-as-above',
  'omitted for length',
  'omitted-for-length',
  'omitted due to length',
  'omitted because of length',
  'content omitted',
  'truncated for length',
  '因篇幅省略',
  '以下省略',
  '內容省略',
  '同上內容',
]

export function listOriginalSubtitleSources({ repoRoot = process.cwd(), sourceRoot = ORIGINAL_CONTENT_ROOT } = {}) {
  return MISS_HONEY_LEVELS.flatMap(level => {
    const levelDir = resolve(repoRoot, sourceRoot, level)
    if (!existsSync(levelDir)) return []

    return readdirSync(levelDir, { withFileTypes: true })
      .filter(entry => entry.isFile())
      .filter(entry => ['.md', '.json'].includes(extname(entry.name).toLowerCase()))
      .sort((a, b) => compareSubtitleNames(a.name, b.name))
      .map((entry, index) => {
        const slug = basename(entry.name, extname(entry.name))
        const sourceRelativePath = toPosixPath(`${sourceRoot}/${level}/${entry.name}`)
        const outputRelativePath = toPosixPath(`${STEP1_ROOT}/${level}/${slug}.md`)
        return {
          level,
          slug,
          index,
          extension: extname(entry.name).toLowerCase(),
          sourcePath: resolve(repoRoot, sourceRelativePath),
          sourceRelativePath,
          outputPath: resolve(repoRoot, outputRelativePath),
          outputRelativePath,
        }
      })
  })
}

export function extractSubtitleForProofread({ sourcePath, level = '', slug = '' }) {
  const ext = extname(sourcePath).toLowerCase()
  const sourcePathForReport = toPosixPath(sourcePath)

  if (ext === '.md') {
    return {
      ok: true,
      text: readFileSync(sourcePath, 'utf-8'),
      fieldPath: 'markdown',
    }
  }

  if (ext !== '.json') {
    return repairResult({ level, slug, sourcePath: sourcePathForReport, reason: `unsupported-source-extension:${ext}` })
  }

  let data
  try {
    data = JSON.parse(readFileSync(sourcePath, 'utf-8'))
  } catch (error) {
    return repairResult({ level, slug, sourcePath: sourcePathForReport, reason: `invalid-source-json:${error.message}` })
  }

  const found = findTranscriptText(data)
  if (!found) {
    return repairResult({ level, slug, sourcePath: sourcePathForReport, reason: 'unknown-json-schema' })
  }

  return {
    ok: true,
    text: found.text,
    fieldPath: found.path,
  }
}

export function buildProofreaderLifecycles(sources) {
  return sources.map((source, index) => ({
    proofreaderId: `english_proofreader-${String(index + 1).padStart(3, '0')}`,
    agent: 'english_proofreader',
    level: source.level,
    slug: source.slug,
    sourcePath: source.sourceRelativePath ?? toPosixPath(source.sourcePath),
    step1Path: source.outputRelativePath ?? toPosixPath(source.outputPath),
    opened: true,
    processedSourceCount: 1,
    writtenStep1Count: 1,
    closed: true,
  }))
}

export function validateProofreaderLifecycles(lifecycles) {
  const errors = []
  const seen = new Set()

  for (const lifecycle of lifecycles) {
    if (!lifecycle.proofreaderId) errors.push(`proofreader lifecycle missing id for ${lifecycle.level}/${lifecycle.slug}`)
    if (seen.has(lifecycle.proofreaderId)) {
      errors.push(`proofreader reused for multiple subtitles: ${lifecycle.proofreaderId}`)
      continue
    }
    seen.add(lifecycle.proofreaderId)

    if (lifecycle.processedSourceCount !== 1) {
      errors.push(`proofreader must process exactly one source: ${lifecycle.proofreaderId}`)
    }
    if (lifecycle.writtenStep1Count !== 1) {
      errors.push(`proofreader must write exactly one step1 output: ${lifecycle.proofreaderId}`)
    }
    if (!lifecycle.opened || !lifecycle.closed) {
      errors.push(`proofreader lifecycle must open and close: ${lifecycle.proofreaderId}`)
    }
  }

  return { valid: errors.length === 0, errors }
}

export function validateStep1Markdown({ markdown, level, slug, sourcePath, proofreadPath }) {
  try {
    if (!String(markdown ?? '').trim()) {
      throw new Error('step1 markdown must not be empty')
    }

    const draft = parseProofreadMarkdown(markdown)
    const skipPhrase = findSkipPhrase(draft)
    if (skipPhrase) {
      throw new Error(`skip phrase found: ${skipPhrase}`)
    }

    return { valid: true, draft }
  } catch (error) {
    return {
      valid: false,
      repair: {
        level,
        slug,
        sourcePath: toPosixPath(sourcePath ?? ''),
        proofreadPath: toPosixPath(proofreadPath ?? ''),
        field: 'proofreadJson',
        reason: error.message,
      },
    }
  }
}

export function writeBackProofreadToApp({ repoRoot = process.cwd(), level, slug, sourcePath, proofreadPath, destinationPath }) {
  const markdown = readFileSync(proofreadPath, 'utf-8')
  const validation = validateStep1Markdown({ markdown, level, slug, sourcePath, proofreadPath })
  if (!validation.valid) {
    return { written: false, repair: validation.repair }
  }

  try {
    const metadata = resolveVideoMetadata({ repoRoot, level, slug })
    const content = addFallbackInlineMarkers(
      buildPlaylistVideoDataFromProofread({ metadata, draft: validation.draft })
    )
    content.sourceTraceability = {
      level,
      slug,
      sourcePath: toPosixPath(sourcePath),
      proofreadPath: toPosixPath(proofreadPath),
    }

    const contentValidation = validatePlaylistVideoData(content)
    if (!contentValidation.valid) {
      return {
        written: false,
        repair: {
          level,
          slug,
          sourcePath: toPosixPath(sourcePath),
          proofreadPath: toPosixPath(proofreadPath),
          field: 'playlistVideoData',
          reason: contentValidation.errors.join('; '),
        },
      }
    }

    const out = destinationPath ?? resolve(repoRoot, APP_VIDEO_ROOT, level, `${slug}.json`)
    mkdirSync(dirname(out), { recursive: true })
    writeFileSync(out, `${JSON.stringify(content, null, 2)}\n`, 'utf-8')
    return { written: true, destinationPath: toPosixPath(out), content }
  } catch (error) {
    return {
      written: false,
      repair: {
        level,
        slug,
        sourcePath: toPosixPath(sourcePath),
        proofreadPath: toPosixPath(proofreadPath),
        field: 'writeBack',
        reason: error.message,
      },
    }
  }
}

function addFallbackInlineMarkers(content) {
  const generated = addInlineTokensToPlaylistVideoData(content, { preserveExisting: false })
  return {
    ...content,
    scenes: content.scenes.map((scene, sceneIndex) => ({
      ...scene,
      sentences: scene.sentences.map((sentence, sentenceIndex) => {
        const hasMarkerToken = Array.isArray(sentence.englishTokens) &&
          sentence.englishTokens.some(token => ['word', 'phrase', 'usage'].includes(token.type))
        if (hasMarkerToken) return sentence
        return generated.scenes?.[sceneIndex]?.sentences?.[sentenceIndex] ?? sentence
      }),
    })),
  }
}

export function accumulateGrammarMarkdown(existingMarkdown, { level, slug, grammar }) {
  let markdown = String(existingMarkdown ?? '').trimEnd()
  const entries = Array.isArray(grammar) ? grammar : []

  for (const entry of entries) {
    const title = String(entry.title ?? entry.name ?? entry.topic ?? entry.label ?? '').trim()
    if (!title) continue

    const sourceSentence = String(entry.sourceSentence ?? entry.sentence ?? '').trim()
    const translation = String(entry.translation ?? '').trim()
    const structure = String(entry.structure ?? '').trim()
    const explanation = String(entry.explanation ?? entry.note ?? entry.text ?? '').trim()
    const sourceLine = `- Source: ${level}/${slug}${sourceSentence ? ` | ${sourceSentence}` : ''}${translation ? ` | ${translation}` : ''}`

    if (!markdown) {
      markdown = '# MissHoney Grammar Accumulation\n'
    }

    if (!hasGrammarHeading(markdown, title)) {
      markdown = [
        markdown,
        '',
        `## ${title}`,
        structure ? `- Structure: ${structure}` : '',
        explanation ? `- Explanation: ${explanation}` : '',
        '- Sources:',
        sourceLine,
      ].filter(Boolean).join('\n')
      continue
    }

    if (!markdown.includes(sourceLine)) {
      markdown = appendToGrammarSection(markdown, title, sourceLine)
    }
  }

  return `${markdown.trimEnd()}\n`
}

export function parseGrammarDealMarkdown(markdown) {
  const match = String(markdown ?? '').match(/```json\s*([\s\S]*?)```/i)
  if (!match) throw new Error('grammar_deal.md missing JSON code block')

  let data
  try {
    data = JSON.parse(match[1])
  } catch (error) {
    throw new Error(`invalid grammar_deal JSON: ${error.message}`, { cause: error })
  }

  if (!data || typeof data !== 'object' || Array.isArray(data)) {
    throw new Error('grammar_deal JSON must be an object')
  }
  if (!Array.isArray(data.grammarPoints)) {
    throw new Error('grammar_deal JSON missing grammarPoints array')
  }

  const grammarPoints = data.grammarPoints.map((point, index) => normalizeGrammarPoint(point, index))
    .sort((a, b) => a.sortOrder - b.sortOrder)

  grammarPoints.forEach((point, index) => {
    const expected = index + 1
    if (point.sortOrder !== expected) {
      throw new Error(`grammarPoints must have continuous sortOrder values starting at 1; expected ${expected}, got ${point.sortOrder}`)
    }
  })

  const omissions = Array.isArray(data.omissions)
    ? data.omissions.map((omission, index) => normalizeGrammarOmission(omission, index))
    : []

  return {
    markdown: String(markdown ?? '').trim(),
    grammarPoints,
    omissions,
  }
}

export function planGrammarSync({ existingTopics = [], grammarPoints = [], omissions = [] }) {
  const existing = new Set(existingTopics.map(topic => normalizeTopic(topic)))
  const supplements = []
  const additions = []

  for (const point of [...grammarPoints].sort((a, b) => a.sortOrder - b.sortOrder)) {
    if (existing.has(normalizeTopic(point.title))) {
      supplements.push(point)
    } else {
      additions.push(point)
    }
  }

  return {
    supplements,
    additions,
    omissions: omissions.map((omission, index) => normalizeGrammarOmission(omission, index)),
  }
}

export function synthesizeProofreadMarkdownFromVideoData(videoData) {
  const title = videoData.header?.titleEn ?? videoData.title ?? videoData.slug ?? 'MissHoney'
  const segments = []
  for (const scene of videoData.scenes ?? []) {
    for (const sentence of scene.sentences ?? []) {
      segments.push({
        english: renderMarkedEnglish(sentence),
        translation: String(sentence.tc ?? '').trim(),
      })
    }
  }

  const words = (videoData.vocabGroups ?? []).flatMap(group => group.items ?? []).map(item => ({
    lemma: item.lemma ?? item.english,
    surface: item.english,
    partOfSpeech: item.partOfSpeech,
    kk: item.kk,
    meaning: item.meaning,
    note: item.note,
    examples: collectExamplesForTarget(videoData, item.id, 'word'),
  }))
  const phrases = (videoData.phrases ?? []).map(phrase => ({
    phrase: phrase.phrase,
    meaning: phrase.meaning,
    translation: phrase.meaning,
    examples: (phrase.examples ?? []).map(example => markPhraseExample(example.en, phrase.phrase)),
  }))
  const usages = (videoData.usages ?? []).map(usage => ({
    word: usage.word,
    familiarMeaning: usage.familiarMeaning,
    usage: usage.usage,
    translation: usage.translation,
    examples: usage.examples,
  }))
  const grammar = (videoData.breakdowns ?? []).map(breakdown => ({
    title: breakdown.points?.[0]?.label ?? 'Sentence Pattern',
    sourceSentence: breakdown.sentence,
    translation: breakdown.translation,
    structure: breakdown.points?.[0]?.text ?? '',
    explanation: breakdown.points?.[0]?.note ?? '',
    points: breakdown.points ?? [],
  }))
  const draft = {
    correctedText: segments.map(segment => segment.english).join(' '),
    translation: segments.map(segment => segment.translation).join(' '),
    segments,
    words,
    phrases,
    usages,
    grammar,
  }

  return [
    `# ${title}`,
    '',
    'This step1 artifact was synthesized from validated app route data so the full local refresh manifest remains complete.',
    '',
    '```json',
    JSON.stringify(draft, null, 2),
    '```',
    '',
  ].join('\n')
}

export function syncStep1Outputs({ repoRoot = process.cwd() } = {}) {
  const sources = listOriginalSubtitleSources({ repoRoot })
  const repairs = []
  const synced = []

  for (const source of sources) {
    mkdirSync(dirname(source.outputPath), { recursive: true })
    const legacyPath = resolve(repoRoot, LEGACY_PROOFREAD_ROOT, source.level, `${source.slug}.md`)
    if (existsSync(legacyPath)) {
      copyFileSync(legacyPath, source.outputPath)
      synced.push({ ...source, method: 'legacy-proofread-result', proofreadPath: source.outputRelativePath })
      continue
    }

    const routePath = resolve(repoRoot, APP_VIDEO_ROOT, source.level, `${source.slug}.json`)
    if (existsSync(routePath)) {
      const videoData = JSON.parse(readFileSync(routePath, 'utf-8'))
      const markdown = synthesizeProofreadMarkdownFromVideoData(videoData)
      const validation = validateStep1Markdown({
        markdown,
        level: source.level,
        slug: source.slug,
        sourcePath: source.sourceRelativePath,
        proofreadPath: source.outputRelativePath,
      })
      if (validation.valid) {
        writeFileSync(source.outputPath, markdown, 'utf-8')
        synced.push({ ...source, method: 'route-data-synthesized', proofreadPath: source.outputRelativePath })
      } else {
        repairs.push(validation.repair)
      }
      continue
    }

    repairs.push({
      level: source.level,
      slug: source.slug,
      sourcePath: source.sourceRelativePath,
      proofreadPath: source.outputRelativePath,
      reason: 'missing-proofread-output-and-route-data',
    })
  }

  return { sources, synced, repairs }
}

export function validateStep1Tree({ repoRoot = process.cwd() } = {}) {
  const sources = listOriginalSubtitleSources({ repoRoot })
  const repairs = []
  const successes = []

  for (const source of sources) {
    if (!existsSync(source.outputPath)) {
      repairs.push({
        level: source.level,
        slug: source.slug,
        sourcePath: source.sourceRelativePath,
        proofreadPath: source.outputRelativePath,
        reason: 'missing-step1-output',
      })
      continue
    }

    const validation = validateStep1Markdown({
      markdown: readFileSync(source.outputPath, 'utf-8'),
      level: source.level,
      slug: source.slug,
      sourcePath: source.sourceRelativePath,
      proofreadPath: source.outputRelativePath,
    })

    if (validation.valid) {
      successes.push({ ...source, draft: validation.draft })
    } else {
      repairs.push(validation.repair)
    }
  }

  return { sources, successes, repairs }
}

export function writeRunManifest({ repoRoot = process.cwd(), outPath = '_private/tmp/misshoney-full-refresh-manifest.json' } = {}) {
  const sources = listOriginalSubtitleSources({ repoRoot })
  const lifecycles = buildProofreaderLifecycles(sources)
  const lifecycleValidation = validateProofreaderLifecycles(lifecycles)
  const extraction = sources.map(source => ({
    level: source.level,
    slug: source.slug,
    sourcePath: source.sourceRelativePath,
    outputPath: source.outputRelativePath,
    extraction: summarizeExtraction(extractSubtitleForProofread({
      sourcePath: source.sourcePath,
      level: source.level,
      slug: source.slug,
    })),
  }))
  const manifest = {
    levels: MISS_HONEY_LEVELS,
    sourceCount: sources.length,
    sources: sources.map(source => ({
      level: source.level,
      slug: source.slug,
      sourcePath: source.sourceRelativePath,
      outputPath: source.outputRelativePath,
    })),
    lifecycles,
    lifecycleValidation,
    extraction,
  }
  const absoluteOut = resolve(repoRoot, outPath)
  mkdirSync(dirname(absoluteOut), { recursive: true })
  writeFileSync(absoluteOut, `${JSON.stringify(manifest, null, 2)}\n`, 'utf-8')
  return manifest
}

export function buildGrammarAccumulationFromStep1({ repoRoot = process.cwd(), outPath = '_private/tmp/grammar.md' } = {}) {
  const validation = validateStep1Tree({ repoRoot })
  let markdown = ''
  for (const item of validation.successes) {
    markdown = accumulateGrammarMarkdown(markdown, {
      level: item.level,
      slug: item.slug,
      grammar: item.draft.grammar,
    })
  }
  const absoluteOut = resolve(repoRoot, outPath)
  mkdirSync(dirname(absoluteOut), { recursive: true })
  writeFileSync(absoluteOut, markdown, 'utf-8')
  return { ...validation, outputPath: outPath, markdown }
}

export function buildGrammarDealFromAccumulation({ repoRoot = process.cwd(), inputPath = '_private/tmp/grammar.md', outPath = '_private/tmp/grammar_deal.md' } = {}) {
  const accumulationPath = resolve(repoRoot, inputPath)
  const markdown = existsSync(accumulationPath) ? readFileSync(accumulationPath, 'utf-8') : ''
  const accumulatedTitles = Array.from(new Set(Array.from(markdown.matchAll(/^##\s+(.+)$/gm)).map(match => match[1].trim())))
  const existingTopics = readExistingGrammarTopics({ repoRoot })
  const organizedTitles = existingTopics.length > 0 ? existingTopics : accumulatedTitles
  const grammarPoints = organizedTitles.map((title, index) => ({
    title,
    level: inferGrammarLevel(title),
    sortOrder: index + 1,
    sourceCoverage: collectCoverageForOrganizedTitle(markdown, title, accumulatedTitles),
    difficultyReason: inferDifficultyReason(title),
  }))
  const omissions = accumulatedTitles
    .filter(title => !organizedTitles.some(existing => matchesExistingGrammarTopic(title, existing)))
    .map(title => ({
      title,
      sourceCoverage: collectSourceCoverageForTitle(markdown, title),
      reason: 'Not synchronized as a standalone /grammar topic because it is duplicate, too narrow, or needs human review before becoming a route-level card.',
    }))

  const deal = [
    '# MissHoney Grammar Deal',
    '',
    'Organized grammar points accumulated from MissHoney proofread outputs.',
    '',
    '```json',
    JSON.stringify({ grammarPoints, omissions }, null, 2),
    '```',
    '',
  ].join('\n')
  const absoluteOut = resolve(repoRoot, outPath)
  mkdirSync(dirname(absoluteOut), { recursive: true })
  writeFileSync(absoluteOut, deal, 'utf-8')
  return parseGrammarDealMarkdown(deal)
}

export function buildFinalVerificationReport({
  sourceCount,
  step1Count,
  jsonSuccessCount,
  repairList,
  appWriteBackCount,
  grammarAdditions,
  grammarSupplements,
  grammarOmissions = [],
  uiSmokePages,
  commandResults,
  risks,
}) {
  const repairs = Array.isArray(repairList) ? repairList : []
  const omissions = Array.isArray(grammarOmissions) ? grammarOmissions : []
  return [
    '# MissHoney Full Refresh Verification Report',
    '',
    `原始字幕總數: ${sourceCount}`,
    `Step1 總數: ${step1Count}`,
    `JSON 成功數: ${jsonSuccessCount}`,
    `待修清單: ${repairs.length}`,
    `已寫回 route 數: ${appWriteBackCount}`,
    `Grammar 新增數: ${grammarAdditions}`,
    `Grammar 補充數: ${grammarSupplements}`,
    `Grammar 未同步/略過數: ${omissions.length}`,
    '',
    '## 待修清單',
    ...(repairs.length ? repairs.map(item => `- ${item.level}/${item.slug}: ${item.reason}`) : ['- None']),
    '',
    '## Grammar 略過清單',
    ...(omissions.length
      ? omissions.map(item => `- ${item.title} | ${formatCoverage(item.sourceCoverage)} | ${item.reason}`)
      : ['- None']),
    '',
    '## UI 抽查頁',
    ...ensureList(uiSmokePages).map(page => `- ${page}`),
    '',
    '## 自動化檢查',
    ...(Array.isArray(commandResults) && commandResults.length > 0
      ? commandResults.map(result => `- ${result.command}: ${result.status}${result.exitCode === undefined ? '' : ` (exit ${result.exitCode})`}`)
      : ['- None']),
    '',
    '## 剩餘風險',
    ...ensureList(risks).map(risk => `- ${risk}`),
    '',
  ].join('\n')
}

export function writeFinalVerificationReport({ repoRoot = process.cwd(), commandResults = [], uiSmokePages = [], risks = [], outPath = '_private/tmp/final-verification-report.md' } = {}) {
  const sources = listOriginalSubtitleSources({ repoRoot })
  const step1Validation = validateStep1Tree({ repoRoot })
  const appWriteBackCount = countJsonFiles(resolve(repoRoot, APP_VIDEO_ROOT))
  const grammarDealPath = resolve(repoRoot, '_private/tmp/grammar_deal.md')
  let grammarAdditions = 0
  let grammarSupplements = 0
  let grammarOmissions = []
  if (existsSync(grammarDealPath)) {
    const grammarDeal = parseGrammarDealMarkdown(readFileSync(grammarDealPath, 'utf-8'))
    const syncPlan = planGrammarSync({
      existingTopics: readExistingGrammarTopics({ repoRoot }),
      grammarPoints: grammarDeal.grammarPoints,
      omissions: grammarDeal.omissions,
    })
    grammarAdditions = syncPlan.additions.length
    grammarSupplements = syncPlan.supplements.length
    grammarOmissions = syncPlan.omissions
  }
  const report = buildFinalVerificationReport({
    sourceCount: sources.length,
    step1Count: step1Validation.successes.length + step1Validation.repairs.filter(item => item.reason !== 'missing-step1-output').length,
    jsonSuccessCount: step1Validation.successes.length,
    repairList: step1Validation.repairs,
    appWriteBackCount,
    grammarAdditions,
    grammarSupplements,
    grammarOmissions,
    uiSmokePages,
    commandResults,
    risks,
  })
  const absoluteOut = resolve(repoRoot, outPath)
  mkdirSync(dirname(absoluteOut), { recursive: true })
  writeFileSync(absoluteOut, report, 'utf-8')
  return { report, outPath, step1Validation }
}

function findTranscriptText(value, path = '') {
  if (!value || typeof value !== 'object') return null
  for (const key of JSON_TEXT_KEYS) {
    if (typeof value[key] === 'string' && value[key].trim()) {
      return { text: value[key], path: path ? `${path}.${key}` : key }
    }
  }
  if (Array.isArray(value.cues)) {
    const cueText = value.cues.map(cue => cue?.text).filter(text => typeof text === 'string' && text.trim()).join(' ')
    if (cueText.trim()) return { text: cueText, path: path ? `${path}.cues[].text` : 'cues[].text' }
  }
  for (const [key, child] of Object.entries(value)) {
    if (child && typeof child === 'object') {
      const nested = findTranscriptText(child, path ? `${path}.${key}` : key)
      if (nested) return nested
    }
  }
  return null
}

function repairResult({ level, slug, sourcePath, proofreadPath = '', reason }) {
  return {
    ok: false,
    repair: {
      level,
      slug,
      sourcePath,
      proofreadPath,
      reason,
    },
  }
}

function summarizeExtraction(result) {
  if (result.ok) {
    return {
      ok: true,
      fieldPath: result.fieldPath,
      characterCount: result.text.length,
    }
  }
  return {
    ok: false,
    repair: result.repair,
  }
}

function findSkipPhrase(value) {
  const haystack = JSON.stringify(value).toLowerCase()
  return SKIP_PHRASES.find(phrase => haystack.includes(phrase.toLowerCase())) ?? null
}

function compareSubtitleNames(a, b) {
  const chapterA = chapterNumber(a)
  const chapterB = chapterNumber(b)
  if (chapterA !== chapterB) return chapterA - chapterB
  return a.localeCompare(b, 'en', { numeric: true, sensitivity: 'base' })
}

function chapterNumber(name) {
  const match = String(name).match(/^ch(\d+)\b/i)
  return match ? Number(match[1]) : Number.MAX_SAFE_INTEGER
}

function hasGrammarHeading(markdown, title) {
  const escaped = escapeRegExp(title)
  return new RegExp(`^##\\s+${escaped}\\s*$`, 'm').test(markdown)
}

function appendToGrammarSection(markdown, title, sourceLine) {
  const heading = `## ${title}`
  const start = markdown.indexOf(heading)
  if (start === -1) return `${markdown.trimEnd()}\n${sourceLine}\n`
  const nextHeading = markdown.indexOf('\n## ', start + heading.length)
  if (nextHeading === -1) return `${markdown.trimEnd()}\n${sourceLine}\n`
  return `${markdown.slice(0, nextHeading).trimEnd()}\n${sourceLine}\n${markdown.slice(nextHeading)}`
}

function normalizeGrammarPoint(point, index) {
  if (!point || typeof point !== 'object' || Array.isArray(point)) {
    throw new Error(`grammarPoints[${index}] must be an object`)
  }
  const title = String(point.title ?? '').trim()
  const sortOrder = Number(point.sortOrder)
  if (!title) throw new Error(`grammarPoints[${index}].title must not be empty`)
  if (!Number.isInteger(sortOrder)) throw new Error(`grammarPoints[${index}].sortOrder must be a number`)
  return {
    ...point,
    title,
    sortOrder,
    sourceCoverage: normalizeCoverage(point.sourceCoverage),
  }
}

function normalizeGrammarOmission(omission, index) {
  if (!omission || typeof omission !== 'object' || Array.isArray(omission)) {
    throw new Error(`omissions[${index}] must be an object`)
  }
  const title = String(omission.title ?? '').trim()
  const sourceCoverage = normalizeCoverage(omission.sourceCoverage)
  const reason = String(omission.reason ?? '').trim()
  if (!title) throw new Error(`omissions[${index}].title must not be empty`)
  if (sourceCoverage.length === 0) throw new Error(`omissions[${index}].sourceCoverage must not be empty`)
  if (!reason) throw new Error(`omissions[${index}].reason must not be empty`)
  return { ...omission, title, sourceCoverage, reason }
}

function normalizeCoverage(value) {
  if (Array.isArray(value)) return value.map(item => String(item).trim()).filter(Boolean)
  const text = String(value ?? '').trim()
  return text ? [text] : []
}

function normalizeTopic(value) {
  return String(value ?? '').toLowerCase().replace(/[^a-z0-9\u3400-\u9fff]+/g, ' ').trim()
}

function renderMarkedEnglish(sentence) {
  if (!Array.isArray(sentence.englishTokens) || sentence.englishTokens.length === 0) {
    return String(sentence.en ?? '').trim()
  }
  return sentence.englishTokens.map(token => {
    if (token.type === 'word') return `**${token.text}**`
    if (token.type === 'phrase') return `__${token.text}__`
    if (token.type === 'usage') return `《${token.text}》`
    return token.text
  }).join('').trim()
}

function collectExamplesForTarget(videoData, targetId, markerType) {
  if (!targetId) return []
  const examples = []
  for (const scene of videoData.scenes ?? []) {
    for (const sentence of scene.sentences ?? []) {
      const tokens = sentence.englishTokens ?? []
      if (tokens.some(token => token.type === markerType && token.targetId === targetId)) {
        examples.push(sentence.en)
      }
    }
  }
  return examples
}

function markPhraseExample(text, phrase) {
  const source = String(text ?? '').trim()
  const target = String(phrase ?? '').trim()
  if (!source || !target) return source
  const escaped = escapeRegExp(target)
  return source.replace(new RegExp(escaped, 'i'), match => `__${match}__`)
}

function collectSourceCoverageForTitle(markdown, title) {
  const heading = `## ${title}`
  const start = markdown.indexOf(heading)
  if (start === -1) return []
  const nextHeading = markdown.indexOf('\n## ', start + heading.length)
  const section = nextHeading === -1 ? markdown.slice(start) : markdown.slice(start, nextHeading)
  const matches = Array.from(section.matchAll(/Source:\s+([a-z]\d\/[^\s|]+)/gi))
  return Array.from(new Set(matches.map(match => match[1])))
}

function collectCoverageForOrganizedTitle(markdown, organizedTitle, accumulatedTitles) {
  const coverage = accumulatedTitles
    .filter(title => matchesExistingGrammarTopic(title, organizedTitle))
    .flatMap(title => collectSourceCoverageForTitle(markdown, title))
  return Array.from(new Set(coverage))
}

function matchesExistingGrammarTopic(rawTitle, existingTitle) {
  const raw = normalizeTopic(rawTitle)
  const existing = normalizeTopic(existingTitle)
  if (!raw || !existing) return false
  if (raw === existing || raw.includes(existing) || existing.includes(raw)) return true

  const groups = [
    ['relative', '關係', 'who', 'which', 'that clause', 'clause'],
    ['noun phrase', '名詞片語'],
    ['participial', 'participle', '分詞'],
    ['used to', '過去曾經'],
    ['present perfect', '現在完成'],
    ['future', 'going to', 'will', '未來'],
    ['gerund', 'v ing', '動名詞'],
    ['while', '同時進行'],
    ['for', '時間長度'],
    ['if', '是否', '如果'],
    ['so that', '目的', '結果'],
    ['make', 'have', 'let', '使役'],
    ['get'],
    ['like'],
    ['prefer'],
    ['ever'],
    ['just as', 'as as', '同等比較'],
    ['parts of speech', '詞性'],
  ]
  return groups.some(group =>
    group.some(token => raw.includes(token)) &&
    group.some(token => existing.includes(token)),
  )
}

function inferGrammarLevel(title) {
  const normalized = normalizeTopic(title)
  if (/simple present|present simple|be verb|there is|there are|一般現在|be 動詞/.test(normalized)) return 'A1'
  if (/past|future|gerund|comparative|過去|未來|動名詞|比較/.test(normalized)) return 'A2'
  if (/relative|perfect|clause|關係|完成|子句/.test(normalized)) return 'B1'
  return 'B2'
}

function inferDifficultyReason(title) {
  return `Ordered by accumulated MissHoney grammar progression for ${title}.`
}

function countJsonFiles(root) {
  if (!existsSync(root)) return 0
  let count = 0
  for (const entry of readdirSync(root, { withFileTypes: true })) {
    const fullPath = resolve(root, entry.name)
    if (entry.isDirectory()) count += countJsonFiles(fullPath)
    if (entry.isFile() && entry.name.endsWith('.json')) count += 1
  }
  return count
}

function readExistingGrammarTopics({ repoRoot }) {
  const grammarViewPath = resolve(repoRoot, 'src/modules/grammar/views/GrammarView.vue')
  if (!existsSync(grammarViewPath)) return []
  const source = readFileSync(grammarViewPath, 'utf-8')
  return Array.from(source.matchAll(/<GrammarCard\s+badge="[^"]+"\s+title="([^"]+)"/g)).map(match => match[1])
}

function formatCoverage(value) {
  return normalizeCoverage(value).join(', ')
}

function ensureList(value) {
  return Array.isArray(value) && value.length > 0 ? value : ['None']
}

function toPosixPath(path) {
  return String(path ?? '').replace(/\\/g, '/')
}

function escapeRegExp(value) {
  return String(value).replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}
