#!/usr/bin/env node
/**
 * MissHoney content promotion CLI.
 * Copies validated generated-content JSON files into src/modules/playlists/data/videos/<level>/
 * and regenerates or updates the matching src/modules/playlists/data/<level>.ts metadata file.
 * Refuses to promote if validation fails.
 */
import { existsSync, mkdirSync, readFileSync, readdirSync, writeFileSync, copyFileSync } from 'node:fs'
import { resolve, dirname, basename } from 'node:path'
import { fileURLToPath } from 'node:url'
import { execSync } from 'node:child_process'
import { findPlaylistSourceUrl, validatePlaylistVideoData, planPromotionPaths } from './content-core.mjs'

const __dirname = dirname(fileURLToPath(import.meta.url))
const REPO_ROOT = resolve(__dirname, '../..')
const SOURCES_PATH = resolve(__dirname, 'sources.json')

const args = process.argv.slice(2)
const HELP = args.includes('--help') || args.includes('-h')
const ALL = args.includes('--all')
const LEVELS = ['a1', 'a2', 'b1', 'b2']

const levelIndex = args.indexOf('--level')
const LEVEL = levelIndex !== -1 ? args[levelIndex + 1] : null

if (HELP) {
  console.log(`
MissHoney Content Promotion Tool

Usage:
  npm run misshoney:promote-content -- --level a1   Promote one level
  npm run misshoney:promote-content -- --all         Promote all levels

Options:
  --help, -h       Show this help
  --level <level>  Promote a specific level
  --all            Promote all levels

This command:
1. Validates all generated-content JSON files for the level
2. Refuses to promote if any file fails validation
3. Copies passing files to src/modules/playlists/data/videos/<level>/
4. Regenerates src/modules/playlists/data/<level>.ts with ready entries
`)
  process.exit(0)
}

if (!ALL && !LEVEL) {
  console.error('Error: specify --level <level> or --all')
  process.exit(1)
}

if (LEVEL && !LEVELS.includes(LEVEL)) {
  console.error(`Error: unknown level "${LEVEL}". Valid levels: ${LEVELS.join(', ')}`)
  process.exit(1)
}

const levelsToProcess = ALL ? LEVELS : [LEVEL]
const sources = existsSync(SOURCES_PATH)
  ? JSON.parse(readFileSync(SOURCES_PATH, 'utf-8'))
  : []
let globalErrors = 0

for (const level of levelsToProcess) {
  console.log(`\n[${level.toUpperCase()}] Promoting content...`)

  const generatedDir = resolve(REPO_ROOT, `_private/misshoney/generated-content/${level}`)
  const destDir = resolve(REPO_ROOT, `src/modules/playlists/data/videos/${level}`)
  const metadataPath = resolve(REPO_ROOT, `src/modules/playlists/data/${level}.ts`)
  const skippedPath = resolve(REPO_ROOT, `_private/misshoney/skipped/${level}.json`)
  const inventoryPath = resolve(REPO_ROOT, `_private/misshoney/inventory/${level}.json`)

  if (!existsSync(generatedDir)) {
    console.warn(`  ⚠ No generated-content directory: ${generatedDir}`)
    console.warn(`  Run the apply agent to author content, then validate with npm run misshoney:validate-content.`)
    continue
  }

  const generatedFiles = readdirSync(generatedDir).filter(f => f.endsWith('.json'))

  if (generatedFiles.length === 0) {
    console.warn(`  ⚠ No generated files found in ${generatedDir}`)
    continue
  }

  // Validate all files first — refuse to promote if any fail
  const validatedFiles = []
  let levelValidationErrors = 0

  for (const filename of generatedFiles) {
    const filePath = resolve(generatedDir, filename)
    const slug = basename(filename, '.json')
    try {
      const data = JSON.parse(readFileSync(filePath, 'utf-8'))
      const result = validatePlaylistVideoData(data)
      if (result.valid) {
        validatedFiles.push({ filename, data, slug })
      } else {
        console.error(`  ✗ Validation failed for ${slug}:`)
        for (const error of result.errors) {
          console.error(`      - ${error}`)
        }
        levelValidationErrors++
      }
    } catch (err) {
      console.error(`  ✗ Parse error in ${filename}: ${err.message}`)
      levelValidationErrors++
    }
  }

  if (levelValidationErrors > 0) {
    console.error(`  Refusing to promote ${level}: ${levelValidationErrors} file(s) failed validation.`)
    console.error(`  Fix errors and re-run: npm run misshoney:validate-content -- --level ${level}`)
    globalErrors += levelValidationErrors
    continue
  }

  // Copy validated files to app data directory
  mkdirSync(destDir, { recursive: true })
  for (const { filename, slug } of validatedFiles) {
    const src = resolve(generatedDir, filename)
    const dst = resolve(destDir, filename)
    copyFileSync(src, dst)
    console.log(`  ✓ promoted ${slug}`)
  }

  // Read skipped report and inventory for metadata generation
  const skippedData = existsSync(skippedPath)
    ? JSON.parse(readFileSync(skippedPath, 'utf-8'))
    : []
  const inventoryData = existsSync(inventoryPath)
    ? JSON.parse(readFileSync(inventoryPath, 'utf-8'))
    : []

  // Build the metadata file
  const metadataContent = buildMetadataFile(
    level,
    validatedFiles,
    inventoryData,
    skippedData,
    findPlaylistSourceUrl(sources, level)
  )
  writeFileSync(metadataPath, metadataContent, 'utf-8')
  console.log(`  ✓ updated ${level}.ts (${validatedFiles.length} ready, ${skippedData.length} skipped)`)
}

if (globalErrors > 0) {
  console.error(`\nPromotion failed: ${globalErrors} error(s). No partial promotion was performed for failing levels.`)
  process.exit(1)
} else {
  console.log('\nPromotion complete.')
}

function buildMetadataFile(level, promotedFiles, inventoryData, skippedData, playlistUrl) {
  const promotedSlugs = new Set(promotedFiles.map(f => f.slug))
  const skippedVideoIds = new Set(skippedData.map(s => s.videoId).filter(Boolean))

  // Build ready videos from promoted files
  const readyEntries = promotedFiles.map(({ data, slug }) => {
    const inv = inventoryData.find(i => i.slug === slug) ?? {}
    return {
      videoId: data.videoId,
      slug,
      title: data.title,
      titleZh: data.header?.titleZh,
      originalIndex: inv.originalIndex ?? 0,
      displayOrder: inv.displayOrder ?? 0,
      status: 'ready',
      contentLoader: `import('./videos/${level}/${slug}.json')`,
    }
  })

  // Build pendingTranscript videos from inventory that weren't promoted
  const pendingEntries = inventoryData
    .filter(i => !promotedSlugs.has(i.slug) && !skippedVideoIds.has(i.videoId))
    .map(inv => ({
      videoId: inv.videoId,
      slug: inv.slug,
      title: inv.title,
      titleZh: inv.titleZh,
      originalIndex: inv.originalIndex ?? 0,
      displayOrder: inv.displayOrder ?? 0,
      status: 'pendingTranscript',
      contentLoader: null,
    }))

  const allVideos = [...readyEntries, ...pendingEntries]
    .sort((a, b) => a.displayOrder - b.displayOrder)

  const skippedEntries = skippedData.map(s => ({
    videoId: s.videoId,
    title: s.title,
    youtubeUrl: s.youtubeUrl,
    originalIndex: s.originalIndex,
    reason: s.reason,
  }))

  // Build TypeScript source
  const levelUpper = level.toUpperCase()
  const videosLines = allVideos.map(v => {
    if (v.status === 'ready') {
      return `  {
    videoId: '${v.videoId}',
    slug: '${v.slug}',
    title: '${escapeStr(v.title)}',
    ${v.titleZh ? `titleZh: '${escapeStr(v.titleZh)}',\n    ` : ''}originalIndex: ${v.originalIndex},
    displayOrder: ${v.displayOrder},
    status: 'ready',
    contentLoader: () => ${v.contentLoader}.then((mod) => ({ default: mod.default as unknown as PlaylistVideoData })),
  }`
    }
    return `  {
    videoId: '${v.videoId}',
    slug: '${v.slug}',
    title: '${escapeStr(v.title)}',
    ${v.titleZh ? `titleZh: '${escapeStr(v.titleZh)}',\n    ` : ''}originalIndex: ${v.originalIndex},
    displayOrder: ${v.displayOrder},
    status: 'pendingTranscript',
    contentLoader: null,
  }`
  })

  const skippedLines = skippedEntries.map(s => {
    return `  {
    ${s.videoId ? `videoId: '${s.videoId}',\n    ` : ''}${s.title ? `title: '${escapeStr(s.title)}',\n    ` : ''}youtubeUrl: '${s.youtubeUrl}',
    originalIndex: ${s.originalIndex},
    reason: '${s.reason}',
  }`
  })

  return `import type { PlaylistData, PlaylistVideoData } from '../types'

const ${levelUpper}: PlaylistData = {
  level: '${level}',
  title: 'MissHoney ${levelUpper}',
  youtubePlaylistUrl: '${escapeStr(playlistUrl)}',
  videos: [
${videosLines.join(',\n')}
  ],
  skippedVideos: [
${skippedLines.join(',\n')}
  ],
}

export default ${levelUpper}
`
}

function escapeStr(s) {
  return String(s ?? '').replace(/'/g, "\\'").replace(/\n/g, ' ')
}
