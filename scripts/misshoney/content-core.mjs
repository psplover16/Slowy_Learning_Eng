/**
 * Pure helper functions for MissHoney content generation pipeline.
 * No network access, no filesystem I/O — all functions are testable in isolation.
 */

/**
 * Builds an authoring scaffold from a normalized transcript.
 * The scaffold contains source material only — no TC translation, no vocabGroups, no phrases.
 * Those are authored by the apply agent.
 *
 * @param {object} transcript - normalized transcript from import pipeline
 * @returns {import('../src/modules/playlists/types').ContentScaffold}
 */
export function buildScaffold(transcript) {
  const { videoId, slug, level, title, youtubeUrl, transcriptText, cues } = transcript

  // Suggest scene boundaries at sentence-ending punctuation or long pauses
  const suggestedSceneBoundaries = suggestSceneBoundaries(cues)

  return {
    videoId,
    slug,
    level,
    title,
    youtubeUrl,
    transcriptText,
    cues,
    suggestedSceneBoundaries,
    authoringChecklist: [
      'Rebuild caption cues into complete, natural English sentences before authoring scenes.',
      'Write natural Traditional Chinese translations for learners; do not copy machine output blindly.',
      'Add scene titles, vocabulary, phrase examples, and sentence breakdowns using the polished schema.',
      'Run npm run misshoney:validate-content before promotion.',
    ],
    polishedContentSkeleton: {
      videoId,
      slug,
      level,
      title,
      youtubeUrl,
      header: {
        podcastLabel: `MissHoney ${String(level).toUpperCase()}`,
        titleZh: '',
        titleEn: title,
        levelTag: String(level).toUpperCase(),
        topicTag: '',
      },
      scenes: [],
      vocabGroups: [],
      phrases: [],
      breakdowns: [],
    },
  }
}

/**
 * Adds structured English marker tokens to PlaylistVideoData from existing
 * vocabulary, phrase, and special usage entries.
 *
 * Existing tokens are preserved by default so hand-proofread content keeps its
 * exact marker density and instance ids.
 *
 * @param {object} data
 * @param {{ preserveExisting?: boolean }} options
 * @returns {object}
 */
export function addInlineTokensToPlaylistVideoData(data, options = {}) {
  const preserveExisting = options.preserveExisting !== false
  const markerCandidates = collectInlineMarkerCandidates(data)

  return {
    ...data,
    scenes: Array.isArray(data?.scenes)
      ? data.scenes.map((scene, sceneIndex) => ({
        ...scene,
        sentences: Array.isArray(scene?.sentences)
          ? scene.sentences.map((sentence, sentenceIndex) => {
            if (
              preserveExisting &&
              Array.isArray(sentence?.englishTokens) &&
              sentence.englishTokens.length > 0
            ) {
              return { ...sentence }
            }

            const markerPrefix = [
              'marker',
              markerSafeSlug(data.level),
              markerSafeSlug(data.slug),
              markerSafeSlug(scene.id || `scene-${sceneIndex + 1}`),
              String(sentenceIndex + 1).padStart(3, '0'),
            ].join('-')

            return {
              ...sentence,
              englishTokens: buildEnglishInlineTokens(
                sentence?.en ?? '',
                markerCandidates,
                markerPrefix
              ),
            }
          })
          : [],
      }))
      : [],
  }
}

/**
 * Heuristic: suggest scene boundaries at cue indexes where a natural pause might occur.
 * Looks for: end of sentence (. ? !), long gap to next cue (>2s), or every ~8 cues as fallback.
 * @param {Array<{start: number, end: number, text: string}>} cues
 * @returns {number[]} array of cue indexes that could be scene boundaries
 */
function suggestSceneBoundaries(cues) {
  if (!cues || cues.length === 0) return []

  const boundaries = []
  for (let i = 0; i < cues.length; i++) {
    const text = cues[i].text.trim()
    const isEndOfSentence = /[.?!]$/.test(text)
    const hasLongPause = i + 1 < cues.length && (cues[i + 1].start - cues[i].end) > 2
    const isFallback = (i + 1) % 8 === 0

    if (isEndOfSentence || hasLongPause || isFallback) {
      boundaries.push(i)
    }
  }

  return boundaries
}

/**
 * Validates a PlaylistVideoData object for schema correctness and content completeness.
 * @param {object} data
 * @returns {{ valid: boolean, errors: string[] }}
 */
export function validatePlaylistVideoData(data) {
  const errors = []

  if (!data || typeof data !== 'object') {
    return { valid: false, errors: ['content must be an object'] }
  }

  if (!data.videoId) errors.push('videoId is required')
  if (!data.slug) errors.push('slug is required')
  if (!data.level) errors.push('level is required')
  if (!data.title) errors.push('title is required')
  if (!data.youtubeUrl) errors.push('youtubeUrl is required')
  validateHeader(data.header, errors)
  const learningTargets = collectLearningTargets(data, errors)

  // Scenes validation
  if (!Array.isArray(data.scenes) || data.scenes.length === 0) {
    errors.push('scenes must be a non-empty array')
  } else {
    for (let si = 0; si < data.scenes.length; si++) {
      const scene = data.scenes[si]
      if (!scene.id || !String(scene.id).trim()) {
        errors.push(`scenes[${si}].id must not be empty`)
      }
      if (!scene.no || !String(scene.no).trim()) {
        errors.push(`scenes[${si}].no must not be empty`)
      }
      if (!scene.titleZh || !String(scene.titleZh).trim()) {
        errors.push(`scenes[${si}].titleZh must not be empty`)
      }
      if (!scene.titleEn || !String(scene.titleEn).trim()) {
        errors.push(`scenes[${si}].titleEn must not be empty`)
      }
      if (!Array.isArray(scene.tags)) {
        errors.push(`scenes[${si}].tags must be an array`)
      }
      if (!Array.isArray(scene.sentences) || scene.sentences.length === 0) {
        errors.push(`scenes[${si}].sentences must be a non-empty array`)
      } else {
        for (let pi = 0; pi < scene.sentences.length; pi++) {
          const pair = scene.sentences[pi]
          if (!pair.en || !pair.en.trim()) {
            errors.push(`scenes[${si}].sentences[${pi}].en must not be empty`)
          }
          if (!pair.tc || !pair.tc.trim()) {
            errors.push(`scenes[${si}].sentences[${pi}].tc must not be empty`)
          }
          validateSentenceQuality(pair, errors, si, pi)
          validateEnglishTokens(pair.englishTokens, learningTargets, errors, si, pi)
        }
      }
    }
  }

  // VocabGroups validation
  if (!Array.isArray(data.vocabGroups) || data.vocabGroups.length === 0) {
    errors.push('vocabGroups must be a non-empty array')
  } else {
    for (let gi = 0; gi < data.vocabGroups.length; gi++) {
      const group = data.vocabGroups[gi]
      if (!group.title || !String(group.title).trim()) {
        errors.push(`vocabGroups[${gi}].title must not be empty`)
      }
      if (!Array.isArray(group.items)) {
        errors.push(`vocabGroups[${gi}].items must be an array`)
      } else {
        for (let ii = 0; ii < group.items.length; ii++) {
          const item = group.items[ii]
          if (!item.english || !String(item.english).trim()) {
            errors.push(`vocabGroups[${gi}].items[${ii}].english must not be empty`)
          }
          if (!item.kk || !String(item.kk).trim()) {
            errors.push(`vocabGroups[${gi}].items[${ii}].kk must not be empty`)
          }
          if (!item.partOfSpeech || !String(item.partOfSpeech).trim()) {
            errors.push(`vocabGroups[${gi}].items[${ii}].partOfSpeech must not be empty`)
          }
          if (!item.meaning || !String(item.meaning).trim()) {
            errors.push(`vocabGroups[${gi}].items[${ii}].meaning must not be empty`)
          } else if (isPlaceholderTranslation(item.meaning)) {
            errors.push(`vocabGroups[${gi}].items[${ii}].meaning looks like a placeholder translation`)
          }
        }
      }
    }
  }

  validateSpecialUsages(data.usages, errors)

  // Phrases validation
  if (!Array.isArray(data.phrases) || data.phrases.length === 0) {
    errors.push('phrases must be a non-empty array')
  } else {
    for (let pi = 0; pi < data.phrases.length; pi++) {
      const phrase = data.phrases[pi]
      if (!phrase.phrase || !phrase.phrase.trim()) {
        errors.push(`phrases[${pi}].phrase must not be empty`)
      }
      if (!phrase.meaning || !phrase.meaning.trim()) {
        errors.push(`phrases[${pi}].meaning must not be empty`)
      } else if (isPlaceholderTranslation(phrase.meaning)) {
        errors.push(`phrases[${pi}].meaning looks like a placeholder translation`)
      }
      if (!Array.isArray(phrase.examples) || phrase.examples.length === 0) {
        errors.push(`phrases[${pi}].examples must be a non-empty array`)
      } else {
        for (let ei = 0; ei < phrase.examples.length; ei++) {
          const example = phrase.examples[ei]
          if (!example.en || !String(example.en).trim()) {
            errors.push(`phrases[${pi}].examples[${ei}].en must not be empty`)
          }
          if (!example.tc || !String(example.tc).trim()) {
            errors.push(`phrases[${pi}].examples[${ei}].tc must not be empty`)
          } else if (isPlaceholderTranslation(example.tc)) {
            errors.push(`phrases[${pi}].examples[${ei}].tc looks like a placeholder translation`)
          }
        }
      }
    }
  }

  // Sentence breakdown validation
  if (!Array.isArray(data.breakdowns) || data.breakdowns.length === 0) {
    errors.push('breakdowns must be a non-empty array')
  } else {
    for (let bi = 0; bi < data.breakdowns.length; bi++) {
      const breakdown = data.breakdowns[bi]
      if (!breakdown.id || !String(breakdown.id).trim()) {
        errors.push(`breakdowns[${bi}].id must not be empty`)
      }
      if (!breakdown.sentence || !String(breakdown.sentence).trim()) {
        errors.push(`breakdowns[${bi}].sentence must not be empty`)
      }
      if (!breakdown.translation || !String(breakdown.translation).trim()) {
        errors.push(`breakdowns[${bi}].translation must not be empty`)
      } else if (isPlaceholderTranslation(breakdown.translation)) {
        errors.push(`breakdowns[${bi}].translation looks like a placeholder translation`)
      }
      if (!Array.isArray(breakdown.points) || breakdown.points.length === 0) {
        errors.push(`breakdowns[${bi}].points must be a non-empty array`)
      } else {
        for (let pi = 0; pi < breakdown.points.length; pi++) {
          const point = breakdown.points[pi]
          if (!point.label || !String(point.label).trim()) {
            errors.push(`breakdowns[${bi}].points[${pi}].label must not be empty`)
          }
          if (!point.text || !String(point.text).trim()) {
            errors.push(`breakdowns[${bi}].points[${pi}].text must not be empty`)
          }
          if (!point.note || !String(point.note).trim()) {
            errors.push(`breakdowns[${bi}].points[${pi}].note must not be empty`)
          }
        }
      }
    }
  }

  return { valid: errors.length === 0, errors }
}

function collectLearningTargets(data, errors) {
  const wordIds = new Set()
  const phraseIds = new Set()
  const usageIds = new Set()
  const explicitLemmas = new Map()

  if (Array.isArray(data.vocabGroups)) {
    for (let gi = 0; gi < data.vocabGroups.length; gi++) {
      const group = data.vocabGroups[gi]
      if (!Array.isArray(group?.items)) continue
      for (let ii = 0; ii < group.items.length; ii++) {
        const item = group.items[ii]
        if (!item || typeof item !== 'object') continue
        const targetId = item.id || makeAnchorId('word', item.lemma || item.english)
        if (targetId) wordIds.add(String(targetId))

        if (item.lemma && String(item.lemma).trim()) {
          const lemma = normalizeLemma(item.lemma)
          if (explicitLemmas.has(lemma)) {
            errors.push(`duplicate vocabulary lemma: ${lemma}`)
          } else {
            explicitLemmas.set(lemma, `vocabGroups[${gi}].items[${ii}]`)
          }
        }
      }
    }
  }

  if (Array.isArray(data.phrases)) {
    for (const phrase of data.phrases) {
      if (!phrase || typeof phrase !== 'object') continue
      const targetId = phrase.id || makeAnchorId('phrase', phrase.phrase)
      if (targetId) phraseIds.add(String(targetId))
    }
  }

  if (Array.isArray(data.usages)) {
    for (const usage of data.usages) {
      if (!usage || typeof usage !== 'object') continue
      const targetId = usage.id || makeAnchorId('usage', `${usage.word}-${usage.usage}`)
      if (targetId) usageIds.add(String(targetId))
    }
  }

  return { wordIds, phraseIds, usageIds }
}

function validateEnglishTokens(tokens, targets, errors, sceneIndex, sentenceIndex) {
  if (tokens === undefined) return

  const location = `scenes[${sceneIndex}].sentences[${sentenceIndex}].englishTokens`
  if (!Array.isArray(tokens) || tokens.length === 0) {
    errors.push(`${location} must be a non-empty array when present`)
    return
  }

  for (let ti = 0; ti < tokens.length; ti++) {
    const token = tokens[ti]
    const tokenLocation = `${location}[${ti}]`
    if (!token || typeof token !== 'object') {
      errors.push(`${tokenLocation} must be an object`)
      continue
    }

    if (token.text === undefined || String(token.text).length === 0) {
      errors.push(`${tokenLocation}.text must not be empty`)
    }

    const type = String(token.type ?? '')
    if (!['text', 'word', 'phrase', 'usage'].includes(type)) {
      errors.push(`${tokenLocation}.type must be text, word, phrase, or usage`)
      continue
    }

    if (type === 'text') continue

    if (!token.targetId || !String(token.targetId).trim()) {
      errors.push(`${tokenLocation}.targetId must not be empty`)
      continue
    }
    if (!token.instanceId || !String(token.instanceId).trim()) {
      errors.push(`${tokenLocation}.instanceId must not be empty`)
    }

    const targetId = String(token.targetId)
    const matchingTargets = {
      word: targets.wordIds,
      phrase: targets.phraseIds,
      usage: targets.usageIds,
    }[type]

    if (!matchingTargets.has(targetId)) {
      errors.push(`${tokenLocation} target does not resolve: token="${token.text}" targetId="${targetId}"`)
    }
  }
}

function collectInlineMarkerCandidates(data) {
  const candidates = []

  if (Array.isArray(data?.phrases)) {
    for (const phrase of data.phrases) {
      const text = String(phrase?.phrase ?? '').trim()
      if (!text) continue
      candidates.push({
        type: 'phrase',
        text,
        targetId: phrase.id || makeAnchorId('phrase', text),
        priority: 0,
      })
    }
  }

  if (Array.isArray(data?.usages)) {
    for (const usage of data.usages) {
      const text = String(usage?.word ?? '').trim()
      if (!text) continue
      candidates.push({
        type: 'usage',
        text,
        targetId: usage.id || makeAnchorId('usage', `${usage.word}-${usage.usage}`),
        priority: 1,
      })
    }
  }

  if (Array.isArray(data?.vocabGroups)) {
    const seenWordTargets = new Set()
    for (const group of data.vocabGroups) {
      if (!Array.isArray(group?.items)) continue
      for (const item of group.items) {
        if (!item || typeof item !== 'object') continue
        const targetId = item.id || makeAnchorId('word', item.lemma || item.english)
        const texts = uniqueStrings([item.english, item.lemma])
        for (const text of texts) {
          const key = `${targetId}:${normalizeInlineLookup(text)}`
          if (!text || seenWordTargets.has(key)) continue
          seenWordTargets.add(key)
          candidates.push({
            type: 'word',
            text,
            targetId,
            priority: 2,
          })
        }
      }
    }
  }

  return candidates
    .filter(candidate => candidate.targetId && candidate.text.length >= 2)
    .sort((a, b) => b.text.length - a.text.length || a.priority - b.priority)
}

function buildEnglishInlineTokens(source, candidates, markerPrefix) {
  const text = String(source ?? '')
  if (!text) return [{ type: 'text', text: '' }]

  const matches = findInlineMatches(text, candidates)
  if (matches.length === 0) return [{ type: 'text', text }]

  const tokens = []
  let cursor = 0
  let markerIndex = 1

  for (const match of matches) {
    if (match.start > cursor) {
      tokens.push({ type: 'text', text: text.slice(cursor, match.start) })
    }

    tokens.push({
      type: match.type,
      text: text.slice(match.start, match.end),
      targetId: match.targetId,
      instanceId: `${markerPrefix}-${String(markerIndex).padStart(3, '0')}`,
    })
    markerIndex += 1
    cursor = match.end
  }

  if (cursor < text.length) {
    tokens.push({ type: 'text', text: text.slice(cursor) })
  }

  return mergeAdjacentTextTokens(tokens)
}

function findInlineMatches(source, candidates) {
  const lower = source.toLowerCase()
  const rawMatches = []

  for (const candidate of candidates) {
    const needle = candidate.text.toLowerCase()
    let start = lower.indexOf(needle)
    while (start !== -1) {
      const end = start + needle.length
      if (hasInlineBoundary(source, start, end)) {
        rawMatches.push({
          ...candidate,
          start,
          end,
          length: end - start,
        })
      }
      start = lower.indexOf(needle, start + 1)
    }
  }

  rawMatches.sort((a, b) => (
    a.start - b.start ||
    b.length - a.length ||
    a.priority - b.priority ||
    a.text.localeCompare(b.text)
  ))

  const selected = []
  let cursor = 0
  for (const match of rawMatches) {
    if (match.start < cursor) continue
    selected.push(match)
    cursor = match.end
  }
  return selected
}

function hasInlineBoundary(source, start, end) {
  const before = start > 0 ? source[start - 1] : ''
  const after = end < source.length ? source[end] : ''
  return !isInlineWordChar(before) && !isInlineWordChar(after)
}

function isInlineWordChar(char) {
  return /[A-Za-z0-9']/.test(char)
}

function mergeAdjacentTextTokens(tokens) {
  const merged = []
  for (const token of tokens) {
    if (!token.text) continue
    const previous = merged[merged.length - 1]
    if (token.type === 'text' && previous?.type === 'text') {
      previous.text += token.text
    } else {
      merged.push(token)
    }
  }
  return merged.length ? merged : [{ type: 'text', text: '' }]
}

function validateSpecialUsages(usages, errors) {
  if (usages === undefined) return

  if (!Array.isArray(usages)) {
    errors.push('usages must be an array when present')
    return
  }

  for (let ui = 0; ui < usages.length; ui++) {
    const usage = usages[ui]
    if (!usage || typeof usage !== 'object') {
      errors.push(`usages[${ui}] must be an object`)
      continue
    }

    for (const key of ['id', 'word', 'familiarMeaning', 'usage', 'translation']) {
      if (!usage[key] || !String(usage[key]).trim()) {
        errors.push(`usages[${ui}].${key} must not be empty`)
      }
    }

    if (!Array.isArray(usage.examples) || usage.examples.length === 0) {
      errors.push(`usages[${ui}].examples must be a non-empty array`)
      continue
    }

    for (let ei = 0; ei < usage.examples.length; ei++) {
      const example = usage.examples[ei]
      if (typeof example === 'string') {
        if (!example.trim()) errors.push(`usages[${ui}].examples[${ei}] must not be empty`)
        continue
      }
      if (!example?.en || !String(example.en).trim()) {
        errors.push(`usages[${ui}].examples[${ei}].en must not be empty`)
      }
      if (!example?.tc || !String(example.tc).trim()) {
        errors.push(`usages[${ui}].examples[${ei}].tc must not be empty`)
      }
    }
  }
}

function validateHeader(header, errors) {
  if (!header || typeof header !== 'object') {
    errors.push('header is required')
    return
  }

  for (const key of ['podcastLabel', 'titleZh', 'titleEn', 'levelTag']) {
    if (!header[key] || !String(header[key]).trim()) {
      errors.push(`header.${key} must not be empty`)
    }
  }
}

function validateSentenceQuality(pair, errors, sceneIndex, sentenceIndex) {
  if (!pair?.en || !pair?.tc) return

  const en = String(pair.en).trim()
  const tc = String(pair.tc).trim()
  const location = `scenes[${sceneIndex}].sentences[${sentenceIndex}]`

  if (isCopiedTranslation(en, tc)) {
    errors.push(`${location}.translation must be natural Traditional Chinese, not copied English`)
  }

  if (hasUnresolvedMarkers(tc)) {
    errors.push(`${location}.tc contains unresolved replacement markers`)
  }

  if (isPlaceholderTranslation(tc)) {
    errors.push(`${location}.tc looks like a placeholder translation`)
  }

  if (isLikelyMisalignedTranslation(en, tc)) {
    errors.push(`${location}.translation looks misaligned with the English sentence`)
  }

  if (isLikelyCueFragment(en)) {
    errors.push(`${location}.en looks like a cue fragment or unpolished sentence: "${en}"`)
  }
}

function isLikelyMisalignedTranslation(en, tc) {
  const englishWordCount = String(en).match(/[a-z0-9]+(?:['-][a-z0-9]+)?/gi)?.length ?? 0
  const chineseLength = String(tc).replace(/\s+/g, '').length
  const chineseSentenceCount = (String(tc).match(/[。！？]/g) ?? []).length

  if (englishWordCount === 0) return false
  if (englishWordCount > 18) return false
  if (chineseSentenceCount >= 3 && chineseLength > Math.max(90, englishWordCount * 12)) return true
  return chineseLength > Math.max(160, englishWordCount * 30)
}

function isCopiedTranslation(en, tc) {
  if (/[\u3400-\u9fff]/.test(String(tc))) return false

  const normalize = value => String(value)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, ' ')
    .trim()
  return normalize(en).length > 0 && normalize(en) === normalize(tc)
}

function hasUnresolvedMarkers(value) {
  return /(?:TODO|TBD|FIXME|\{\{|\}\}|@@|待翻譯|待補)/i.test(String(value))
}

function isPlaceholderTranslation(value) {
  const text = String(value).trim()
  return (
    /這句主要在談.+可以先掌握整句意思/.test(text) ||
    /相關的常用字$/.test(text) ||
    /^常用說法，可用來表達「.+」這個意思$/.test(text)
  )
}

function isLikelyCueFragment(sentence) {
  const text = String(sentence).trim()
  if (!text) return true
  if (!/[.!?。！？]["']?$/.test(text)) return true

  const lower = text.toLowerCase()
  const withoutPunctuation = lower.replace(/[.!?。！？]+["']?$/, '').trim()
  const wordCount = lower.split(/\s+/).filter(Boolean).length

  if (/^who want\b/.test(lower)) return true
  if (/\b(routine|daily|food|made|comes|favorite)\s+\1\b/.test(lower)) return true
  if (/\bmy daily routine my daily\b/.test(lower)) return true
  if (/\bslo english\b/.test(lower)) return true
  if (/\byour favorite dinner at 1100 p\.m\./.test(lower)) return true
  if (/\bi go to sleep i love sleeping i love feeling\b/.test(lower)) return true
  if (/^who do you .+ with$/.test(withoutPunctuation)) return false
  if (/^after [a-z]+ing,?\s+i\s+[a-z]+/.test(withoutPunctuation)) return false
  if (/[.,]\?$/.test(text)) return true
  if (/\.\s+a podcast\b/.test(text)) return true
  if (/\.["']\.$/.test(text)) return true
  if (isCompleteQuestion(text, withoutPunctuation)) return false
  if (isNaturalTagQuestion(withoutPunctuation)) return false
  if (isNaturalEllipticalAnswer(withoutPunctuation)) return false
  if (isNaturalPhrasalVerbEnding(withoutPunctuation)) return false
  if (/\b(with|for|to|from|about|at|in|on|of|who|what|where|when|why|how)$/.test(withoutPunctuation)) return true
  if (/\b(and|or|but|so|because|it'?s|the|a|an|i)$/.test(withoutPunctuation)) return true
  if (/\bso,\s*$/.test(withoutPunctuation)) return true
  if (/\bwhat did i do who is this\b/.test(withoutPunctuation)) return true
  if (/^i do who is this$/.test(withoutPunctuation)) return true
  if (/\bphone call a strange phone call i$/.test(withoutPunctuation)) return true
  if (/^(in|after|before|at|for)\b/.test(withoutPunctuation) && wordCount <= 4) return true
  if (/^my favorite [a-z]+$/.test(withoutPunctuation)) return true
  if (/\bsugar sugar makes\b/.test(withoutPunctuation)) return true
  if (/^you fat\b/.test(withoutPunctuation)) return true
  if (/\bbut i think$/.test(withoutPunctuation)) return true
  if (/\bin mexico in mexico\b/.test(withoutPunctuation)) return true
  if (wordCount > 38 && !isNaturalListSentence(withoutPunctuation) && completeSentenceCount(text) <= 1) return true

  return false
}

function completeSentenceCount(text) {
  return (String(text).match(/[.!?。！？]["']?(?=\s|$)/g) ?? []).length
}

function isCompleteQuestion(text, withoutPunctuation) {
  if (!/\?$/.test(text)) return false
  const normalizedQuestion = withoutPunctuation.replace(/^(?:and|so|now|okay|well|nice|if so),?\s+/i, '')
  if (/^(?:something|anything|one thing)\s+(?:that|you|i|we|they)\b/.test(normalizedQuestion)) return true
  return /^(who|what|where|when|why|how|which|do|does|did|is|are|am|was|were|can|could|will|would|should|have|has|had)\b/.test(normalizedQuestion)
}

function isNaturalTagQuestion(withoutPunctuation) {
  return /,\s*(?:right|okay|ok|yes|no)$/.test(withoutPunctuation)
}

function isNaturalEllipticalAnswer(withoutPunctuation) {
  return (
    /^(?:i|we|you|they)\s+(?:try|tried|used|need|want|have)\s+to$/.test(withoutPunctuation) ||
    /\bif\s+(?:i|we|you|they)\s+need\s+to$/.test(withoutPunctuation)
  )
}

function isNaturalPhrasalVerbEnding(withoutPunctuation) {
  return (
    /\b(?:check|checked|checking)\s+in$/.test(withoutPunctuation) ||
    /\b(?:hold|held|holding)\s+on$/.test(withoutPunctuation)
  )
}

function isNaturalListSentence(withoutPunctuation) {
  const commaCount = (withoutPunctuation.match(/,/g) ?? []).length
  return commaCount >= 3 && /\b(like|such as|including)\b/.test(withoutPunctuation)
}

function makeAnchorId(prefix, value) {
  const slug = String(value ?? '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
  return slug ? `${prefix}-${slug}` : ''
}

function markerSafeSlug(value) {
  return String(value ?? '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '') || 'item'
}

function normalizeInlineLookup(value) {
  return String(value ?? '').toLowerCase().replace(/[^a-z0-9']+/g, ' ').trim()
}

function uniqueStrings(values) {
  return Array.from(new Set(values.map(value => String(value ?? '').trim()).filter(Boolean)))
}

function normalizeLemma(value) {
  return String(value ?? '').trim().toLowerCase()
}

/**
 * Plans promotion source and destination paths for a given level and slug.
 * @param {string} level - 'a1' | 'a2' | 'b1' | 'b2'
 * @param {string} slug
 * @returns {{ source: string, destination: string }}
 */
export function planPromotionPaths(level, slug) {
  return {
    source: `_private/misshoney/generated-content/${level}/${slug}.json`,
    destination: `src/modules/playlists/data/videos/${level}/${slug}.json`,
  }
}

/**
 * Counts coverage for a level across pipeline stages.
 * @param {object} params
 * @param {string} params.level
 * @param {string[]} params.transcriptSlugs
 * @param {string[]} params.scaffoldSlugs
 * @param {string[]} params.generatedSlugs
 * @param {string[]} params.promotedSlugs
 * @param {number} params.skippedCount
 * @returns {object} coverage counts and isComplete flag
 */
export function countLevelCoverage({ level, transcriptSlugs, scaffoldSlugs, generatedSlugs, promotedSlugs, skippedCount }) {
  const transcriptSet = new Set(transcriptSlugs)
  const scaffoldSet = new Set(scaffoldSlugs)
  const generatedSet = new Set(generatedSlugs)
  const promotedSet = new Set(promotedSlugs)

  const isComplete =
    transcriptSlugs.every(s => scaffoldSet.has(s)) &&
    transcriptSlugs.every(s => generatedSet.has(s)) &&
    transcriptSlugs.every(s => promotedSet.has(s))

  return {
    level,
    transcriptCount: transcriptSet.size,
    scaffoldCount: scaffoldSet.size,
    generatedCount: generatedSet.size,
    promotedCount: promotedSet.size,
    skippedCount,
    isComplete,
  }
}

/**
 * Finds the configured YouTube playlist URL for a level.
 * @param {Array<{ level: string, playlistUrl: string }>} sources
 * @param {string} level
 * @returns {string}
 */
export function findPlaylistSourceUrl(sources, level) {
  if (!Array.isArray(sources)) return ''
  const source = sources.find(item => item?.level === level)
  return typeof source?.playlistUrl === 'string' ? source.playlistUrl : ''
}
