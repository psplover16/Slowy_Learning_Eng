#!/usr/bin/env node
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import {
  buildPlaylistVideoDataFromProofread,
  parseProofreadMarkdown,
  resolveVideoMetadata,
} from './proofread-core.mjs'
import { validatePlaylistVideoData } from './content-core.mjs'

const __dirname = dirname(fileURLToPath(import.meta.url))
const REPO_ROOT = resolve(__dirname, '../..')
const args = process.argv.slice(2)

if (args.includes('--help') || args.includes('-h')) {
  console.log(`
MissHoney Proofread Parser

Usage:
  npm run misshoney:parse-proofread -- --input _private/proofread_result.md --out _private/proofread_draft.json
  npm run misshoney:parse-proofread -- --input _private/proofread_result.md --format playlist-video --level a1 --slug ch1-slow-english-for-beginners-a1-listening-practice --out _private/misshoney/generated-content/a1/ch1-slow-english-for-beginners-a1-listening-practice.json

Options:
  --input <path>          Markdown file containing the JSON code block
  --out <path>            Output JSON path; stdout is used when omitted
  --format <format>       draft (default) or playlist-video
  --level <level>         Required for playlist-video format
  --slug <slug>           Required for playlist-video format
`)
  process.exit(0)
}

try {
  const input = getRequiredArg('--input')
  const format = getArg('--format') ?? 'draft'
  const inputPath = resolve(REPO_ROOT, input)
  if (!existsSync(inputPath)) {
    throw new Error(`input file not found: ${input}`)
  }

  const draft = parseProofreadMarkdown(readFileSync(inputPath, 'utf-8'))
  const output = format === 'playlist-video'
    ? buildAndValidatePlaylistVideo(draft)
    : draft

  const out = getArg('--out')
  if (out) {
    writeJsonFile(resolve(REPO_ROOT, out), output)
    console.log(`Wrote parsed proofread JSON: ${out}`)
  } else {
    console.log(JSON.stringify(output, null, 2))
  }
} catch (error) {
  console.error(`Proofread parser failed: ${error.message}`)
  process.exit(1)
}

function buildAndValidatePlaylistVideo(draft) {
  const level = getRequiredArg('--level')
  const slug = getRequiredArg('--slug')
  const metadata = resolveVideoMetadata({ repoRoot: REPO_ROOT, level, slug })
  const content = buildPlaylistVideoDataFromProofread({ metadata, draft })
  const result = validatePlaylistVideoData(content)

  if (!result.valid) {
    throw new Error([
      `generated PlaylistVideoData failed validation: level=${level} slug=${slug}`,
      ...result.errors.map(error => `- ${error}`),
    ].join('\n'))
  }

  return content
}

function getArg(name) {
  const index = args.indexOf(name)
  if (index === -1) return null
  const value = args[index + 1]
  return value && !value.startsWith('--') ? value : null
}

function getRequiredArg(name) {
  const value = getArg(name)
  if (!value) {
    throw new Error(`missing ${name}`)
  }
  return value
}

function writeJsonFile(filePath, data) {
  mkdirSync(dirname(filePath), { recursive: true })
  writeFileSync(filePath, JSON.stringify(data, null, 2) + '\n', 'utf-8')
}
