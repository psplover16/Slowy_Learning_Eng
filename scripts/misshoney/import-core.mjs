/**
 * Pure helper functions for the MissHoney import pipeline.
 * No network access, no filesystem I/O — all functions are testable in isolation.
 */

/**
 * Assigns displayOrder to learnable items in reverse originalIndex order.
 * Skipped items receive no displayOrder and no slug.
 * @param {Array<{videoId: string, originalIndex: number, skipped: boolean}>} items
 * @returns {Array} items with displayOrder added to learnable entries
 */
export function assignDisplayOrders(items) {
  const learnable = items
    .filter(i => !i.skipped)
    .sort((a, b) => b.originalIndex - a.originalIndex)

  let order = 1
  const orderMap = new Map()
  for (const item of learnable) {
    orderMap.set(getItemId(item), order++)
  }

  return items.map(item => {
    if (item.skipped) return { ...item }
    return { ...item, displayOrder: orderMap.get(getItemId(item)) }
  })
}

function getItemId(item) {
  return item.videoId ?? item.id
}

/**
 * Derives a video slug from display order and English title.
 * Format: ch[displayOrder]-[kebab-case-title]
 * @param {number} displayOrder
 * @param {string} title
 * @returns {string}
 */
export function deriveSlug(displayOrder, title) {
  const kebab = title
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
  return `ch${displayOrder}-${kebab}`
}

/**
 * Normalizes raw transcript cues: trims text, strips HTML tags, deduplicates consecutive identical text.
 * @param {Array<{start: number, end: number, text: string}>} cues
 * @returns {Array<{start: number, end: number, text: string}>}
 */
export function normalizeTranscriptCues(cues) {
  const cleaned = cues.map(cue => ({
    ...cue,
    text: cue.text
      .replace(/<[^>]+>/g, '')
      .trim(),
  }))

  const deduped = []
  for (const cue of cleaned) {
    if (deduped.length === 0 || deduped[deduped.length - 1].text !== cue.text) {
      deduped.push(cue)
    } else {
      // Extend the end time of the previous cue
      deduped[deduped.length - 1] = {
        ...deduped[deduped.length - 1],
        end: cue.end,
      }
    }
  }

  return deduped
}

/**
 * Plans output file paths for a given level and slug.
 * All paths are under _private/misshoney/ — never under src/modules/playlists/data/.
 * @param {string} level - 'a1' | 'a2' | 'b1' | 'b2'
 * @param {string} slug
 * @returns {{ transcript: string, inventory: string, skipped: string, importSummary: string }}
 */
export function planOutputPaths(level, slug) {
  return {
    transcript: `_private/misshoney/transcripts/${level}/${slug}.json`,
    inventory: `_private/misshoney/inventory/${level}.json`,
    skipped: `_private/misshoney/skipped/${level}.json`,
    importSummary: '_private/misshoney/import-summary.json',
  }
}

/**
 * Maps a yt-dlp error message to a SkippedVideoEntry reason.
 * @param {string} errorMessage
 * @returns {'member-only' | 'private' | 'no-english-captions' | 'unavailable' | 'geo-restricted'}
 */
export function mapSkippedReason(errorMessage) {
  const msg = errorMessage.toLowerCase()
  if (msg.includes('members only') || msg.includes('member-only') || msg.includes('members-only')) {
    return 'member-only'
  }
  if (msg.includes('this video is private') || msg.includes('private video')) {
    return 'private'
  }
  if (
    msg.includes('no subtitles') ||
    msg.includes('no captions') ||
    msg.includes('subtitles not available') ||
    msg.includes('no transcript')
  ) {
    return 'no-english-captions'
  }
  if (msg.includes('not available in your country') || msg.includes('geo') || msg.includes('region')) {
    return 'geo-restricted'
  }
  return 'unavailable'
}

/**
 * Selects English subtitle entries from yt-dlp subtitles/automatic_captions maps.
 * Prefer exact "en", then any language key that starts with "en" such as "en-US".
 * @param {Record<string, Array<{ ext: string, url: string }>>} tracks
 * @returns {Array<{ ext: string, url: string }> | null}
 */
export function selectEnglishSubtitleEntries(tracks) {
  if (!tracks || typeof tracks !== 'object') return null
  if (Array.isArray(tracks.en) && tracks.en.length > 0) return tracks.en

  const englishKey = Object.keys(tracks)
    .sort()
    .find(key => key.toLowerCase().startsWith('en'))

  return englishKey && Array.isArray(tracks[englishKey]) && tracks[englishKey].length > 0
    ? tracks[englishKey]
    : null
}

/**
 * Parses yt-dlp --print output and returns the first JSON object line.
 * yt-dlp may print NA before a later JSON object when one requested field is absent.
 * @param {string} stdout
 * @returns {object | null}
 */
export function parseYtDlpJsonPrintOutput(stdout) {
  if (!stdout) return null

  const jsonLine = stdout
    .split('\n')
    .map(line => line.trim())
    .find(line => line.startsWith('{'))

  if (!jsonLine) return null

  try {
    return JSON.parse(jsonLine)
  } catch {
    return null
  }
}

/**
 * Selects a json3 English subtitle entry, preferring manual subtitles over auto captions.
 * @param {{ subtitles?: object, automaticCaptions?: object }} params
 * @returns {{ ext: string, url: string } | null}
 */
export function selectJson3EnglishSubtitleEntry({ subtitles, automaticCaptions }) {
  const manual = findJson3Entry(selectEnglishSubtitleEntries(subtitles))
  if (manual) return manual

  return findJson3Entry(selectEnglishSubtitleEntries(automaticCaptions))
}

function findJson3Entry(entries) {
  if (!Array.isArray(entries)) return null
  return entries.find(entry => entry?.ext === 'json3' && entry.url) ?? null
}

/**
 * Builds a normalized inventory item from raw yt-dlp playlist entry data.
 * @param {{ id: string, title: string, url: string, originalIndex: number }} entry
 * @param {boolean} skipped
 * @returns {object}
 */
export function buildInventoryItem(entry, skipped) {
  return {
    videoId: entry.id,
    title: entry.title ?? '',
    youtubeUrl: entry.url ?? `https://www.youtube.com/watch?v=${entry.id}`,
    originalIndex: entry.originalIndex,
    skipped,
  }
}

/**
 * Merges normalized transcript cues into a single paragraph of text.
 * @param {Array<{text: string}>} cues
 * @returns {string}
 */
export function mergeCuesToText(cues) {
  return cues.map(c => c.text).join(' ').replace(/\s+/g, ' ').trim()
}
