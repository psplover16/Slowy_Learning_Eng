#!/usr/bin/env node
import { writeFileSync } from 'node:fs'
import { resolve } from 'node:path'
import {
  buildGrammarAccumulationFromStep1,
  buildGrammarDealFromAccumulation,
  listOriginalSubtitleSources,
  syncStep1Outputs,
  validateStep1Tree,
  writeBackProofreadToApp,
  writeFinalVerificationReport,
  writeRunManifest,
} from './full-refresh-core.mjs'

const args = process.argv.slice(2)
const REPO_ROOT = process.cwd()

if (args.includes('--help') || args.includes('-h')) {
  console.log(`
MissHoney Full Refresh Tool

Usage:
  npm run misshoney:full-refresh -- --dry-run
  npm run misshoney:full-refresh -- --sync-step1
  npm run misshoney:full-refresh -- --build-grammar
  npm run misshoney:full-refresh -- --final-report

Options:
  --dry-run          Write the source/lifecycle manifest only
  --sync-step1       Populate _private/tmp/step1 from existing proofread results or validated route data
  --validate-step1   Validate all _private/tmp/step1 outputs
  --write-back       Overwrite app route video data from validated step1 JSON
  --build-grammar    Build _private/tmp/grammar.md and _private/tmp/grammar_deal.md from step1 outputs
  --final-report     Write _private/tmp/final-verification-report.md
`)
  process.exit(0)
}

try {
  if (args.includes('--dry-run')) {
    const manifest = writeRunManifest({ repoRoot: REPO_ROOT })
    console.log(`Manifest written. sourceCount=${manifest.sourceCount}`)
  }

  if (args.includes('--sync-step1')) {
    const result = syncStep1Outputs({ repoRoot: REPO_ROOT })
    console.log(`Step1 sync complete. sources=${result.sources.length} synced=${result.synced.length} repairs=${result.repairs.length}`)
    writeJson('_private/tmp/misshoney-step1-sync.json', {
      synced: result.synced.map(item => ({
        level: item.level,
        slug: item.slug,
        sourcePath: item.sourceRelativePath,
        proofreadPath: item.proofreadPath,
        method: item.method,
      })),
      repairs: result.repairs,
    })
  }

  if (args.includes('--validate-step1')) {
    const result = validateStep1Tree({ repoRoot: REPO_ROOT })
    console.log(`Step1 validation complete. sources=${result.sources.length} success=${result.successes.length} repairs=${result.repairs.length}`)
    if (result.repairs.length > 0) {
      writeJson('_private/tmp/misshoney-step1-repairs.json', result.repairs)
      process.exitCode = 1
    }
  }

  if (args.includes('--write-back')) {
    const validation = validateStep1Tree({ repoRoot: REPO_ROOT })
    const repairs = [...validation.repairs]
    const written = []
    for (const item of validation.successes) {
      const result = writeBackProofreadToApp({
        repoRoot: REPO_ROOT,
        level: item.level,
        slug: item.slug,
        sourcePath: item.sourceRelativePath,
        proofreadPath: item.outputPath,
      })
      if (result.written) {
        written.push({
          level: item.level,
          slug: item.slug,
          destinationPath: result.destinationPath,
        })
      } else {
        repairs.push(result.repair)
      }
    }
    writeJson('_private/tmp/misshoney-writeback.json', { written, repairs })
    console.log(`Write-back complete. written=${written.length} repairs=${repairs.length}`)
    if (repairs.length > 0) process.exitCode = 1
  }

  if (args.includes('--build-grammar')) {
    const accumulation = buildGrammarAccumulationFromStep1({ repoRoot: REPO_ROOT })
    const deal = buildGrammarDealFromAccumulation({ repoRoot: REPO_ROOT })
    console.log(`Grammar built. accumulated=${accumulation.successes.length} grammarPoints=${deal.grammarPoints.length}`)
  }

  if (args.includes('--final-report')) {
    const pages = [
      '/a1/ch1-slow-english-for-beginners-a1-listening-practice',
      '/a1/ch18-english-listening-practice-for-beginners-my-weekend-a1-a2',
      '/a2/ch1-slow-english-stories-level-a2-listening-a-weird-phone-call',
      '/a2/ch29-what-you-taught-me-about-hope-slow-english-listening',
      '/b1/ch1-slow-english-listening-intermediate-practice-talking-about-my-hobbies',
      '/b1/ch21-slow-english-listening-practice-makeup-routine',
      '/b2/ch1-slow-english-listening-for-upper-intermediate-talking-about-comfort-foods',
      '/b2/ch17-how-she-became-fluent-in-english-intermediate-listening-practice',
      '/ch1',
      '/ch2',
      '/ch3',
      '/ch4',
    ]
    const commandResults = parseJsonArg('--command-results') ?? []
    const risks = parseJsonArg('--risks') ?? [
      'A1 ch1 step1 was synthesized from validated app route data because no legacy proofread-result Markdown existed.',
    ]
    const result = writeFinalVerificationReport({
      repoRoot: REPO_ROOT,
      uiSmokePages: pages,
      commandResults,
      risks,
    })
    console.log(`Final verification report written: ${result.outPath}`)
  }

  if (args.length === 0) {
    const sources = listOriginalSubtitleSources({ repoRoot: REPO_ROOT })
    console.log(`MissHoney full refresh sources: ${sources.length}`)
  }
} catch (error) {
  console.error(`MissHoney full refresh failed: ${error.message}`)
  process.exit(1)
}

function writeJson(relativePath, data) {
  writeFileSync(resolve(REPO_ROOT, relativePath), `${JSON.stringify(data, null, 2)}\n`, 'utf-8')
}

function parseJsonArg(name) {
  const index = args.indexOf(name)
  if (index === -1) return null
  const value = args[index + 1]
  if (!value || value.startsWith('--')) return null
  return JSON.parse(value)
}
