#!/usr/bin/env node
/**
 * MissHoney content validation CLI.
 * Validates generated and promoted PlaylistVideoData files for schema correctness
 * and content completeness (non-empty TC translations, required arrays, etc.).
 */
import { existsSync, readFileSync, readdirSync } from 'node:fs'
import { resolve, dirname, basename } from 'node:path'
import { fileURLToPath } from 'node:url'
import { validatePlaylistVideoData, countLevelCoverage } from './content-core.mjs'

const __dirname = dirname(fileURLToPath(import.meta.url))
const REPO_ROOT = resolve(__dirname, '../..')

const args = process.argv.slice(2)
const HELP = args.includes('--help') || args.includes('-h')
const ALL = args.includes('--all')
const GENERATED_ONLY = args.includes('--generated-only')
const RAW_ONLY = args.includes('--raw-only')
const LEVELS = ['a1', 'a2', 'b1', 'b2']

const levelIndex = args.indexOf('--level')
const LEVEL = levelIndex !== -1 ? args[levelIndex + 1] : null

if (HELP) {
  console.log(`
MissHoney Content Validation Tool

Usage:
  npm run misshoney:validate-content -- --level a1   Validate one level
  npm run misshoney:validate-content -- --all         Validate all levels

Options:
  --help, -h          Show this help
  --level <level>     Validate a specific level
  --all               Validate all levels
  --generated-only    Only validate _private/misshoney/generated-content/
  --raw-only          Only check _private/misshoney/ coverage (no schema validation)

Exit codes:
  0  All validated files pass
  1  One or more files have validation errors
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
let globalErrors = 0

for (const level of levelsToProcess) {
  console.log(`\n[${level.toUpperCase()}]`)

  const transcriptDir = resolve(REPO_ROOT, `_private/misshoney/transcripts/${level}`)
  const scaffoldDir = resolve(REPO_ROOT, `_private/misshoney/content-scaffolds/${level}`)
  const generatedDir = resolve(REPO_ROOT, `_private/misshoney/generated-content/${level}`)
  const promotedDir = resolve(REPO_ROOT, `src/modules/playlists/data/videos/${level}`)

  const transcriptSlugs = existsSync(transcriptDir)
    ? readdirSync(transcriptDir).filter(f => f.endsWith('.json')).map(f => basename(f, '.json'))
    : []
  const scaffoldSlugs = existsSync(scaffoldDir)
    ? readdirSync(scaffoldDir).filter(f => f.endsWith('.json')).map(f => basename(f, '.json'))
    : []
  const generatedSlugs = existsSync(generatedDir)
    ? readdirSync(generatedDir).filter(f => f.endsWith('.json')).map(f => basename(f, '.json'))
    : []
  const promotedSlugs = existsSync(promotedDir)
    ? readdirSync(promotedDir).filter(f => f.endsWith('.json')).map(f => basename(f, '.json'))
    : []

  const skippedPath = resolve(REPO_ROOT, `_private/misshoney/skipped/${level}.json`)
  const skippedCount = existsSync(skippedPath)
    ? JSON.parse(readFileSync(skippedPath, 'utf-8')).length
    : 0

  // Coverage report
  const coverage = countLevelCoverage({
    level, transcriptSlugs, scaffoldSlugs, generatedSlugs, promotedSlugs, skippedCount,
  })
  console.log(`  Transcripts: ${coverage.transcriptCount}, Scaffolds: ${coverage.scaffoldCount}, Generated: ${coverage.generatedCount}, Promoted: ${coverage.promotedCount}, Skipped: ${coverage.skippedCount}`)

  if (RAW_ONLY) continue

  // Schema validation of generated content
  const dirsToValidate = GENERATED_ONLY
    ? [{ dir: generatedDir, label: 'generated' }]
    : [
        { dir: generatedDir, label: 'generated' },
        { dir: promotedDir, label: 'promoted' },
      ]

  for (const { dir, label } of dirsToValidate) {
    if (!existsSync(dir)) {
      console.log(`  ⚠ No ${label} content directory: ${dir}`)
      continue
    }

    const files = readdirSync(dir).filter(f => f.endsWith('.json'))
    let levelErrors = 0

    for (const filename of files) {
      const filePath = resolve(dir, filename)
      const slug = basename(filename, '.json')
      try {
        const data = JSON.parse(readFileSync(filePath, 'utf-8'))
        const result = validatePlaylistVideoData(data)
        if (result.valid) {
          console.log(`  ✓ [${label}] ${slug}`)
        } else {
          console.error(`  ✗ [${label}] ${slug}:`)
          for (const error of result.errors) {
            console.error(`      - ${error}`)
          }
          levelErrors++
          globalErrors++
        }
      } catch (err) {
        console.error(`  ✗ [${label}] ${slug}: parse error — ${err.message}`)
        levelErrors++
        globalErrors++
      }
    }

    if (levelErrors > 0) {
      console.error(`  ${levelErrors} file(s) failed validation in ${label}`)
    }
  }

  // Coverage completeness check (only in --all mode)
  if (ALL && !coverage.isComplete) {
    const missingGenerated = transcriptSlugs.filter(s => !generatedSlugs.includes(s))
    const missingPromoted = generatedSlugs.filter(s => !promotedSlugs.includes(s))
    if (missingGenerated.length > 0) {
      console.error(`  Missing generated content for: ${missingGenerated.join(', ')}`)
      globalErrors += missingGenerated.length
    }
    if (missingPromoted.length > 0) {
      console.error(`  Missing promoted content for: ${missingPromoted.join(', ')}`)
      globalErrors += missingPromoted.length
    }
  }
}

if (globalErrors > 0) {
  console.error(`\nValidation failed: ${globalErrors} error(s).`)
  process.exit(1)
} else {
  console.log('\nAll content validated successfully.')
  process.exit(0)
}
