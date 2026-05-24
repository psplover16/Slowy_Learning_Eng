#!/usr/bin/env node
/**
 * MissHoney content scaffold CLI.
 * Reads raw transcripts from _private/misshoney/transcripts/<level>/
 * and writes authoring scaffolds to _private/misshoney/content-scaffolds/<level>/<slug>.json.
 * Does NOT produce TC translations, vocabGroups, or phrases — those are authored by the apply agent.
 * Does NOT modify app content under src/modules/playlists/data/videos/.
 */
import { existsSync, mkdirSync, readFileSync, readdirSync, writeFileSync } from 'node:fs'
import { resolve, dirname, basename } from 'node:path'
import { fileURLToPath } from 'node:url'
import { buildScaffold } from './content-core.mjs'

const __dirname = dirname(fileURLToPath(import.meta.url))
const REPO_ROOT = resolve(__dirname, '../..')

const args = process.argv.slice(2)
const HELP = args.includes('--help') || args.includes('-h')
const ALL = args.includes('--all')
const LEVELS = ['a1', 'a2', 'b1', 'b2']

const levelIndex = args.indexOf('--level')
const LEVEL = levelIndex !== -1 ? args[levelIndex + 1] : null

if (HELP) {
  console.log(`
MissHoney Scaffold Content Tool

Usage:
  npm run misshoney:scaffold-content -- --level a1   Scaffold one level
  npm run misshoney:scaffold-content -- --all         Scaffold all levels

Options:
  --help, -h       Show this help
  --level <level>  Process a specific level (a1, a2, b1, b2)
  --all            Process all levels

Input:  _private/misshoney/transcripts/<level>/<slug>.json
Output: _private/misshoney/content-scaffolds/<level>/<slug>.json

Note: This command only creates authoring scaffolds (source material + suggested scene
boundaries). It does NOT produce Traditional Chinese translations, vocabulary groups,
or phrase explanations. Those are authored by the apply agent from the scaffolds.
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
let totalScaffolded = 0
let totalErrors = 0

for (const level of levelsToProcess) {
  console.log(`\n[${level.toUpperCase()}] Scaffolding content...`)
  const transcriptDir = resolve(REPO_ROOT, `_private/misshoney/transcripts/${level}`)
  const scaffoldDir = resolve(REPO_ROOT, `_private/misshoney/content-scaffolds/${level}`)

  if (!existsSync(transcriptDir)) {
    console.warn(`  ⚠ No transcripts directory: ${transcriptDir}`)
    console.warn(`  Run npm run misshoney:import first.`)
    continue
  }

  const transcriptFiles = readdirSync(transcriptDir).filter(f => f.endsWith('.json'))

  if (transcriptFiles.length === 0) {
    console.warn(`  ⚠ No transcript files found in ${transcriptDir}`)
    continue
  }

  mkdirSync(scaffoldDir, { recursive: true })
  let levelScaffolded = 0
  let levelErrors = 0

  for (const filename of transcriptFiles) {
    const transcriptPath = resolve(transcriptDir, filename)
    const scaffoldPath = resolve(scaffoldDir, filename)
    const slug = basename(filename, '.json')

    try {
      const transcript = JSON.parse(readFileSync(transcriptPath, 'utf-8'))
      const scaffold = buildScaffold(transcript)
      writeFileSync(scaffoldPath, JSON.stringify(scaffold, null, 2) + '\n', 'utf-8')
      console.log(`  ✓ ${slug}`)
      levelScaffolded++
    } catch (err) {
      console.error(`  ✗ ${slug}: ${err.message}`)
      levelErrors++
    }
  }

  console.log(`  → ${levelScaffolded} scaffolds created, ${levelErrors} errors`)
  totalScaffolded += levelScaffolded
  totalErrors += levelErrors
}

console.log(`\nDone. ${totalScaffolded} scaffolds total.`)
if (totalErrors > 0) {
  process.exit(1)
}
