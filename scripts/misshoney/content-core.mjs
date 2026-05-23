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

  if (!data.videoId) errors.push('videoId is required')
  if (!data.slug) errors.push('slug is required')
  if (!data.level) errors.push('level is required')
  if (!data.title) errors.push('title is required')
  if (!data.youtubeUrl) errors.push('youtubeUrl is required')

  // Scenes validation
  if (!Array.isArray(data.scenes) || data.scenes.length === 0) {
    errors.push('scenes must be a non-empty array')
  } else {
    for (let si = 0; si < data.scenes.length; si++) {
      const scene = data.scenes[si]
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
      if (!Array.isArray(group.items)) {
        errors.push(`vocabGroups[${gi}].items must be an array`)
      } else {
        for (let ii = 0; ii < group.items.length; ii++) {
          const item = group.items[ii]
          if (!item.word || !item.word.trim()) {
            errors.push(`vocabGroups[${gi}].items[${ii}].word must not be empty`)
          }
          if (!item.pos || !item.pos.trim()) {
            errors.push(`vocabGroups[${gi}].items[${ii}].pos must not be empty`)
          }
          if (!item.meaning || !item.meaning.trim()) {
            errors.push(`vocabGroups[${gi}].items[${ii}].meaning must not be empty`)
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
      }
      if (!Array.isArray(phrase.examples) || phrase.examples.length === 0) {
        errors.push(`phrases[${pi}].examples must be a non-empty array`)
      }
    }
  }

  return { valid: errors.length === 0, errors }
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
