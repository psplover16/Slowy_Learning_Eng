#!/usr/bin/env node
import { execSync, spawnSync } from 'node:child_process'
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import {
  mergeCuesToText,
  normalizeTranscriptCues,
  parseYtDlpJsonPrintOutput,
  selectJson3EnglishSubtitleEntry,
} from './import-core.mjs'
import {
  formatTranscriptUnavailableError,
  resolveVideoMetadata,
} from './proofread-core.mjs'

const __dirname = dirname(fileURLToPath(import.meta.url))
const REPO_ROOT = resolve(__dirname, '../..')
const args = process.argv.slice(2)

if (args.includes('--help') || args.includes('-h')) {
  console.log(`
MissHoney Single Transcript Fetch

Usage:
  npm run misshoney:fetch-transcript -- --level a1 --slug ch1-slow-english-for-beginners-a1-listening-practice --out _private/tmp.txt

Options:
  --level <level>  Playlist level: a1, a2, b1, b2
  --slug <slug>    Promoted video slug
  --out <path>     Output text file to overwrite
  --refresh        Ignore cached _private transcript JSON and call YouTube/yt-dlp
`)
  process.exit(0)
}

const level = getRequiredArg('--level')
const slug = getRequiredArg('--slug')
const out = getRequiredArg('--out')
const refresh = args.includes('--refresh')
const metadata = resolveVideoMetadata({ repoRoot: REPO_ROOT, level, slug })
const outPath = resolve(REPO_ROOT, out)

try {
  const transcriptText = refresh
    ? await fetchTranscriptFromYoutube(metadata)
    : await loadCachedOrFetch(metadata)

  writeTextFile(outPath, transcriptText)
  console.log(`Wrote transcript: ${out}`)
} catch (error) {
  console.error(formatTranscriptUnavailableError({
    level,
    slug,
    youtubeUrl: metadata.youtubeUrl,
    reason: error.reason ?? 'transcript-fetch-failed',
  }))
  if (error.message) console.error(error.message)
  process.exit(1)
}

function getRequiredArg(name) {
  const index = args.indexOf(name)
  const value = index === -1 ? '' : args[index + 1]
  if (!value || value.startsWith('--')) {
    console.error(`Error: missing ${name}`)
    process.exit(1)
  }
  return value
}

async function loadCachedOrFetch(metadata) {
  const cachePath = resolve(REPO_ROOT, '_private/misshoney/transcripts', metadata.level, `${metadata.slug}.json`)
  if (existsSync(cachePath)) {
    const cached = JSON.parse(readFileSync(cachePath, 'utf-8'))
    const transcriptText = String(cached.transcriptText ?? '').trim()
    if (transcriptText) return transcriptText
  }
  return fetchTranscriptFromYoutube(metadata)
}

async function fetchTranscriptFromYoutube(metadata) {
  const ytdlp = getYtDlpPath()
  const subtitles = fetchSubtitleTrackMap(ytdlp, metadata.youtubeUrl, '%(subtitles)j', 20 * 1024 * 1024)
  let json3Entry = selectJson3EnglishSubtitleEntry({ subtitles })

  if (!json3Entry) {
    const automaticCaptions = fetchSubtitleTrackMap(ytdlp, metadata.youtubeUrl, '%(automatic_captions)j', 80 * 1024 * 1024)
    json3Entry = selectJson3EnglishSubtitleEntry({ subtitles: null, automaticCaptions })
  }

  if (!json3Entry) {
    throw Object.assign(new Error('No public English transcript track found.'), {
      reason: 'no-public-english-transcript',
    })
  }

  let json3Data
  try {
    const response = await fetch(json3Entry.url, {
      headers: { 'user-agent': 'Mozilla/5.0' },
    })
    if (!response.ok) {
      throw new Error(`caption request failed: ${response.status}`)
    }
    json3Data = await response.json()
  } catch (error) {
    throw Object.assign(new Error(`Unable to download transcript: ${error.message}`), {
      reason: 'no-public-english-transcript',
    })
  }

  const cues = normalizeTranscriptCues(parseJson3Cues(json3Data))
  const transcriptText = mergeCuesToText(cues)
  if (!transcriptText) {
    throw Object.assign(new Error('Downloaded transcript was empty.'), {
      reason: 'no-public-english-transcript',
    })
  }

  return transcriptText
}

function getYtDlpPath() {
  const envPath = process.env.YT_DLP_PATH
  if (envPath) return envPath

  try {
    execSync('yt-dlp --version', { stdio: 'pipe' })
    return 'yt-dlp'
  } catch {
    throw Object.assign(new Error('yt-dlp not found on PATH; install yt-dlp or set YT_DLP_PATH.'), {
      reason: 'transcript-fetch-failed',
    })
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
    .filter(event => event.segs)
    .map(event => ({
      start: (event.tStartMs ?? 0) / 1000,
      end: ((event.tStartMs ?? 0) + (event.dDurationMs ?? 0)) / 1000,
      text: (event.segs ?? []).map(segment => segment.utf8 ?? '').join(''),
    }))
    .filter(cue => cue.text.trim())
}

function writeTextFile(filePath, content) {
  mkdirSync(dirname(filePath), { recursive: true })
  writeFileSync(filePath, String(content).trim() + '\n', 'utf-8')
}
