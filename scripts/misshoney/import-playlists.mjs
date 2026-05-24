#!/usr/bin/env node
/**
 * MissHoney playlist import CLI.
 * Reads sources.json, fetches playlist metadata and English captions via yt-dlp,
 * and writes raw outputs under _private/misshoney/.
 * Never writes to src/modules/playlists/data/videos/.
 */
import { execSync, spawnSync } from 'node:child_process'
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import {
  assignDisplayOrders,
  deriveSlug,
  normalizeTranscriptCues,
  planOutputPaths,
  buildInventoryItem,
  mergeCuesToText,
  parseYtDlpJsonPrintOutput,
  selectJson3EnglishSubtitleEntry,
} from './import-core.mjs'

const __dirname = dirname(fileURLToPath(import.meta.url))
const REPO_ROOT = resolve(__dirname, '../..')
const SOURCES_PATH = resolve(__dirname, 'sources.json')

const args = process.argv.slice(2)
const HELP = args.includes('--help') || args.includes('-h')
const CHECK_EXISTING = args.includes('--check-existing')

if (HELP) {
  console.log(`
MissHoney Import Tool

Usage:
  npm run misshoney:import                 Fetch playlists and captions from YouTube
  npm run misshoney:import -- --check-existing  Verify existing raw outputs without fetching

Options:
  --help, -h         Show this help message
  --check-existing   Check existing raw outputs without calling YouTube

Environment:
  YT_DLP_PATH   Path to yt-dlp binary (falls back to 'yt-dlp' on PATH)

Output directories (never touches src/modules/playlists/data/):
  _private/misshoney/inventory/<level>.json
  _private/misshoney/transcripts/<level>/<slug>.json
  _private/misshoney/skipped/<level>.json
  _private/misshoney/import-summary.json
`)
  process.exit(0)
}

const sources = JSON.parse(readFileSync(SOURCES_PATH, 'utf-8'))

if (CHECK_EXISTING) {
  runCheckExisting(sources)
} else {
  await runImport(sources)
}

function getYtDlpPath() {
  const envPath = process.env.YT_DLP_PATH
  if (envPath) return envPath

  try {
    execSync('yt-dlp --version', { stdio: 'pipe' })
    return 'yt-dlp'
  } catch {
    console.error(
      'Error: yt-dlp not found.\n' +
      'Please install yt-dlp and make sure it is on your PATH, ' +
      'or set the YT_DLP_PATH environment variable to the full path of the yt-dlp binary.\n' +
      'Install: https://github.com/yt-dlp/yt-dlp#installation'
    )
    process.exit(1)
  }
}

function ensureDir(dirPath) {
  if (!existsSync(dirPath)) {
    mkdirSync(dirPath, { recursive: true })
  }
}

function writeJson(filePath, data) {
  ensureDir(dirname(filePath))
  writeFileSync(filePath, JSON.stringify(data, null, 2) + '\n', 'utf-8')
}

function fetchPlaylistMetadata(ytdlp, playlistUrl) {
  const result = spawnSync(
    ytdlp,
    ['--flat-playlist', '--dump-json', '--no-warnings', '--ignore-errors', playlistUrl],
    { encoding: 'utf-8', maxBuffer: 50 * 1024 * 1024 }
  )

  if (result.status !== 0 && !result.stdout) {
    throw new Error(`yt-dlp failed: ${result.stderr}`)
  }

  return result.stdout
    .split('\n')
    .filter(line => line.trim())
    .map(line => {
      try { return JSON.parse(line) } catch { return null }
    })
    .filter(Boolean)
}

async function fetchCaptions(ytdlp, videoId) {
  const url = `https://www.youtube.com/watch?v=${videoId}`
  const subtitles = fetchSubtitleTrackMap(ytdlp, url, '%(subtitles)j', 20 * 1024 * 1024)
  let json3Entry = selectJson3EnglishSubtitleEntry({ subtitles })

  if (!json3Entry) {
    const automaticCaptions = fetchSubtitleTrackMap(ytdlp, url, '%(automatic_captions)j', 80 * 1024 * 1024)
    json3Entry = selectJson3EnglishSubtitleEntry({ subtitles: null, automaticCaptions })
  }

  if (!json3Entry) return null

  try {
    const response = await fetch(json3Entry.url, {
      headers: {
        'user-agent': 'Mozilla/5.0',
      },
    })
    if (!response.ok) return null
    return await response.json()
  } catch {
    return null
  }
}

function fetchSubtitleTrackMap(ytdlp, url, printTemplate, maxBuffer) {
  const result = spawnSync(
    ytdlp,
    [
      '--skip-download',
      '--sub-langs', 'en,en-US,en.*',
      '--print', printTemplate,
      '--no-warnings',
      url,
    ],
    { encoding: 'utf-8', maxBuffer }
  )

  if (result.status !== 0 && !result.stdout) return null

  return parseYtDlpJsonPrintOutput(result.stdout)
}

function parseJson3Cues(json3Data) {
  if (!json3Data?.events) return []
  return json3Data.events
    .filter(e => e.segs)
    .map(e => ({
      start: (e.tStartMs ?? 0) / 1000,
      end: ((e.tStartMs ?? 0) + (e.dDurationMs ?? 0)) / 1000,
      text: (e.segs ?? []).map(s => s.utf8 ?? '').join(''),
    }))
    .filter(c => c.text.trim())
}

async function runImport(sources) {
  const ytdlp = getYtDlpPath()
  const summaries = []

  for (const source of sources) {
    const { level, title, playlistUrl } = source
    console.log(`\n[${level.toUpperCase()}] ${title}`)
    console.log(`Fetching playlist: ${playlistUrl}`)

    let rawItems
    try {
      rawItems = fetchPlaylistMetadata(ytdlp, playlistUrl)
    } catch (err) {
      console.error(`  Failed to fetch playlist: ${err.message}`)
      summaries.push({ level, inventoryCount: 0, transcriptCount: 0, skippedCount: 0, missingTranscriptCount: 0 })
      continue
    }

    const itemsWithIndex = rawItems.map((item, i) => ({
      ...item,
      originalIndex: i + 1,
      skipped: false,
    }))

    const skippedItems = []
    const learnableItems = []

    for (const item of itemsWithIndex) {
      // Check if video is accessible
      if (item._type === 'url' || item.url) {
        learnableItems.push(item)
      } else {
        skippedItems.push({ ...item, skipped: true })
      }
    }

    const allItems = [...learnableItems.map(i => ({ ...i, skipped: false })), ...skippedItems]
    const withOrders = assignDisplayOrders(allItems)

    const inventory = []
    const skipped = []
    let transcriptCount = 0

    const paths = planOutputPaths(level, 'placeholder')
    const inventoryPath = resolve(REPO_ROOT, paths.inventory)
    const skippedPath = resolve(REPO_ROOT, paths.skipped)

    for (const item of withOrders) {
      if (item.skipped) {
        skipped.push({
          videoId: item.id,
          title: item.title,
          youtubeUrl: item.url ?? `https://www.youtube.com/watch?v=${item.id}`,
          originalIndex: item.originalIndex,
          reason: 'unavailable',
        })
        continue
      }

      const videoId = item.id
      const slug = deriveSlug(item.displayOrder, item.title ?? videoId)
      const invItem = buildInventoryItem({ ...item, id: videoId }, false)

      inventory.push({
        ...invItem,
        slug,
        displayOrder: item.displayOrder,
      })

      // Fetch captions
      console.log(`  [${item.displayOrder}] ${item.title ?? videoId}`)
      const transcriptPath = resolve(REPO_ROOT, `_private/misshoney/transcripts/${level}/${slug}.json`)

      if (existsSync(transcriptPath)) {
        console.log(`    ✓ transcript cached`)
        transcriptCount++
        continue
      }

      const captionData = await fetchCaptions(ytdlp, videoId)
      if (!captionData) {
        console.log(`    ⚠ no English captions — skipping`)
        skipped.push({
          videoId,
          title: item.title,
          youtubeUrl: `https://www.youtube.com/watch?v=${videoId}`,
          originalIndex: item.originalIndex,
          reason: 'no-english-captions',
        })
        inventory[inventory.length - 1] = { ...inventory[inventory.length - 1], status: 'skipped' }
        continue
      }

      const rawCues = parseJson3Cues(captionData)
      const normalizedCues = normalizeTranscriptCues(rawCues)
      const transcriptText = mergeCuesToText(normalizedCues)

      const transcriptData = {
        videoId,
        slug,
        level,
        title: item.title ?? videoId,
        youtubeUrl: `https://www.youtube.com/watch?v=${videoId}`,
        transcriptText,
        cues: normalizedCues,
      }

      writeJson(transcriptPath, transcriptData)
      console.log(`    ✓ transcript saved (${normalizedCues.length} cues)`)
      transcriptCount++
    }

    writeJson(inventoryPath, inventory)
    writeJson(skippedPath, skipped)

    const summary = {
      level,
      inventoryCount: inventory.length,
      transcriptCount,
      skippedCount: skipped.length,
      missingTranscriptCount: inventory.filter(i => i.status !== 'skipped').length - transcriptCount,
    }
    summaries.push(summary)

    console.log(`  → ${inventory.length} learnable, ${transcriptCount} transcripts, ${skipped.length} skipped`)
  }

  const summaryPath = resolve(REPO_ROOT, '_private/misshoney/import-summary.json')
  writeJson(summaryPath, summaries)
  console.log('\nImport complete. Summary written to _private/misshoney/import-summary.json')
}

function runCheckExisting(sources) {
  console.log('Checking existing raw outputs (no YouTube calls)...\n')
  let allOk = true

  for (const source of sources) {
    const { level } = source
    const inventoryPath = resolve(REPO_ROOT, `_private/misshoney/inventory/${level}.json`)
    const skippedPath = resolve(REPO_ROOT, `_private/misshoney/skipped/${level}.json`)

    if (!existsSync(inventoryPath)) {
      console.error(`  [${level}] MISSING inventory: ${inventoryPath}`)
      allOk = false
      continue
    }

    const inventory = JSON.parse(readFileSync(inventoryPath, 'utf-8'))
    const skippedData = existsSync(skippedPath)
      ? JSON.parse(readFileSync(skippedPath, 'utf-8'))
      : []
    const skippedIds = new Set(skippedData.map(s => s.videoId))

    let missing = 0
    for (const item of inventory) {
      if (skippedIds.has(item.videoId) || item.status === 'skipped') continue
      const transcriptPath = resolve(REPO_ROOT, `_private/misshoney/transcripts/${level}/${item.slug}.json`)
      if (!existsSync(transcriptPath)) {
        console.error(`  [${level}] MISSING transcript: ${item.slug}`)
        missing++
        allOk = false
      }
    }

    const transcriptCount = inventory.filter(i => i.status !== 'skipped' && !skippedIds.has(i.videoId)).length - missing
    console.log(`  [${level}] ${transcriptCount} transcripts OK, ${missing} missing, ${skippedData.length} skipped`)
  }

  if (allOk) {
    console.log('\nAll existing outputs are complete.')
    process.exit(0)
  } else {
    console.error('\nSome transcripts are missing. Run `npm run misshoney:import` to fetch them.')
    process.exit(1)
  }
}
