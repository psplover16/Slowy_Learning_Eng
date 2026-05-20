#!/usr/bin/env node
// Pure Node 22 ESM publish script for the gh-pages worktree.
// No third-party dependencies.

import {
  existsSync,
  readdirSync,
  rmSync,
  mkdirSync,
  writeFileSync,
  statSync,
  copyFileSync,
  readFileSync,
} from 'node:fs'
import { join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

/**
 * Entries at the gh-pages worktree root that must NEVER be removed by
 * any deployment target. `CNAME` is included defensively so a future
 * custom domain does not get wiped by a production publish.
 */
export const ROOT_ENTRIES_ALWAYS_PRESERVED = new Set([
  '.git',
  '.nojekyll',
  'CNAME',
  'staging',
])

const COMPRESSED_EXTENSIONS = ['.gz', '.br']

function assertValidTarget(target) {
  if (target !== 'production' && target !== 'staging') {
    throw new Error(
      `publishPages: unknown target '${target}', expected 'production' or 'staging'`,
    )
  }
}

function assertDistReady(distPath) {
  if (!existsSync(distPath)) {
    throw new Error(`publishPages: dist path does not exist: ${distPath}`)
  }
  const stats = statSync(distPath)
  if (!stats.isDirectory()) {
    throw new Error(`publishPages: dist path is not a directory: ${distPath}`)
  }
  const entries = readdirSync(distPath)
  if (entries.length === 0) {
    throw new Error(`publishPages: dist directory is empty: ${distPath}`)
  }
}

function isPreCompressed(name) {
  return COMPRESSED_EXTENSIONS.some((ext) => name.endsWith(ext))
}

/**
 * Recursively copy `srcDir` into `destDir`. Files with `.gz` or `.br`
 * extensions are skipped.
 */
function copyTreeSkippingCompressed(srcDir, destDir, collected = []) {
  if (!existsSync(destDir)) {
    mkdirSync(destDir, { recursive: true })
  }
  for (const entry of readdirSync(srcDir, { withFileTypes: true })) {
    const srcPath = join(srcDir, entry.name)
    const destPath = join(destDir, entry.name)
    if (entry.isDirectory()) {
      copyTreeSkippingCompressed(srcPath, destPath, collected)
    } else if (entry.isFile()) {
      if (isPreCompressed(entry.name)) continue
      copyFileSync(srcPath, destPath)
      collected.push(entry.name)
    }
  }
  return collected
}

function removeRootEntriesExceptPreserved(worktreeRoot) {
  const removed = []
  for (const entry of readdirSync(worktreeRoot)) {
    if (ROOT_ENTRIES_ALWAYS_PRESERVED.has(entry)) continue
    rmSync(join(worktreeRoot, entry), { recursive: true, force: true })
    removed.push(entry)
  }
  return removed
}

function emptyDirectory(dirPath) {
  const removed = []
  if (!existsSync(dirPath)) {
    mkdirSync(dirPath, { recursive: true })
    return removed
  }
  for (const entry of readdirSync(dirPath)) {
    rmSync(join(dirPath, entry), { recursive: true, force: true })
    removed.push(entry)
  }
  return removed
}

function writeNoJekyll(worktreeRoot) {
  writeFileSync(join(worktreeRoot, '.nojekyll'), '', 'utf-8')
}

/**
 * Synchronize a built dist directory into the gh-pages worktree for
 * either the production or staging deployment target.
 *
 * @param {{ worktreeRoot: string, distPath: string, target: 'production' | 'staging' }} args
 * @returns {{ target: string, targetPath: string, removedRootEntries: string[], removedTargetEntries: string[], copiedEntries: string[] }}
 */
export function syncPublishedSite({ worktreeRoot, distPath, target }) {
  // Fail fast BEFORE mutating anything
  assertValidTarget(target)
  assertDistReady(distPath)

  if (!existsSync(worktreeRoot)) {
    throw new Error(`publishPages: worktreeRoot does not exist: ${worktreeRoot}`)
  }

  let removedRootEntries = []
  let removedTargetEntries = []
  let targetPath

  if (target === 'production') {
    targetPath = worktreeRoot
    removedRootEntries = removeRootEntriesExceptPreserved(worktreeRoot)
  } else {
    // staging
    // Defensive: if a stale index.html at the root contains '/src/' it was
    // produced by a dev-mode push, so remove it before publishing staging.
    const rootIndex = join(worktreeRoot, 'index.html')
    if (existsSync(rootIndex)) {
      const contents = readFileSync(rootIndex, 'utf-8')
      if (contents.includes('/src/')) {
        rmSync(rootIndex, { force: true })
        removedRootEntries.push('index.html')
      }
    }
    targetPath = join(worktreeRoot, 'staging')
    removedTargetEntries = emptyDirectory(targetPath)
  }

  const copiedEntries = copyTreeSkippingCompressed(distPath, targetPath)

  // Always rewrite .nojekyll at the worktree root
  writeNoJekyll(worktreeRoot)

  return {
    target,
    targetPath,
    removedRootEntries,
    removedTargetEntries,
    copiedEntries,
  }
}

/**
 * @param {{ target: string, targetPath: string, removedRootEntries: string[], removedTargetEntries: string[], copiedEntries: string[] }} result
 */
export function formatPublishSummary(result) {
  const lines = []
  lines.push(`publishPages: published target=${result.target}`)
  lines.push(`  targetPath: ${result.targetPath}`)
  lines.push(`  removed at root: ${result.removedRootEntries.length}`)
  lines.push(`  removed at target: ${result.removedTargetEntries.length}`)
  lines.push(`  copied entries: ${result.copiedEntries.length}`)
  return lines.join('\n')
}

/**
 * @param {string} target
 */
export function formatNoPublishChangesMessage(target) {
  return `publishPages: no content changes for target=${target}, skipping commit.`
}

// CLI entry: only run when this file is invoked directly via `node`.
const isDirectInvocation =
  import.meta.url === `file://${fileURLToPath(import.meta.url).replace(/\\/g, '/')}` ||
  process.argv[1] === fileURLToPath(import.meta.url)

if (isDirectInvocation) {
  const args = parseCliArgs(process.argv.slice(2))
  try {
    const result = syncPublishedSite({
      worktreeRoot: resolve(args.worktree),
      distPath: resolve(args.dist),
      target: args.target,
    })
    console.log(formatPublishSummary(result))
  } catch (err) {
    console.error(`publishPages error: ${err.message}`)
    process.exit(1)
  }
}

function parseCliArgs(argv) {
  const out = {}
  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i]
    if (arg === '--worktree') out.worktree = argv[++i]
    else if (arg === '--dist') out.dist = argv[++i]
    else if (arg === '--target') out.target = argv[++i]
  }
  if (!out.worktree || !out.dist || !out.target) {
    throw new Error(
      'publishPages: required CLI flags: --worktree <path> --dist <path> --target <production|staging>',
    )
  }
  return out
}
