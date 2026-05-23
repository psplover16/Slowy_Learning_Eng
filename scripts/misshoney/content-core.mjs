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

  if (isLikelyCueFragment(en)) {
    errors.push(`${location}.en looks like a cue fragment or unpolished sentence`)
  }
}

function isCopiedTranslation(en, tc) {
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
  return /這句主要在談.+可以先掌握整句意思/.test(String(value))
}

function isLikelyCueFragment(sentence) {
  const text = String(sentence).trim()
  if (!text) return true
  if (!/[.!?。！？]$/.test(text)) return true

  const lower = text.toLowerCase()
  const withoutPunctuation = lower.replace(/[.!?。！？]+$/, '').trim()
  const wordCount = lower.split(/\s+/).filter(Boolean).length

  if (/^who want\b/.test(lower)) return true
  if (/\b(routine|daily|food|made|comes|favorite)\s+\1\b/.test(lower)) return true
  if (/\bmy daily routine my daily\b/.test(lower)) return true
  if (/\byour favorite dinner at 1100 p\.m\./.test(lower)) return true
  if (/\bi go to sleep i love sleeping i love feeling\b/.test(lower)) return true
  if (/\b(with|for|to|from|about|at|in|on|of|who|what|where|when|why|how)$/.test(withoutPunctuation)) return true
  if (/\b(and|or|but|so|because|it'?s)$/.test(withoutPunctuation)) return true
  if (/^(in|after|before|at|for)\b/.test(withoutPunctuation) && wordCount <= 4) return true
  if (/^my favorite [a-z]+$/.test(withoutPunctuation)) return true
  if (/\b(sugar sugar makes|you fat)\b/.test(withoutPunctuation)) return true
  if (/\bbut i think$/.test(withoutPunctuation)) return true
  if (/\bin mexico in mexico\b/.test(withoutPunctuation)) return true
  if (wordCount > 38) return true

  return false
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
