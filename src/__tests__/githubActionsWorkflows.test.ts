import { describe, it, expect } from 'vitest'
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'

// Minimal YAML reads — to avoid pulling a YAML parser dependency we
// validate via well-formed string assertions on the raw workflow files.
// This still validates the contract (the workflows are authored by hand
// and the spec only requires presence + ordering of key directives).

const repoRoot = resolve(__dirname, '../..')
const ciPath = resolve(repoRoot, '.github/workflows/ci.yml')
const cdPath = resolve(repoRoot, '.github/workflows/cd.yml')

function readWorkflow(path: string): string {
  return readFileSync(path, 'utf-8')
}

describe('CI workflow validation', () => {
  const ci = readWorkflow(ciPath)

  it('declares workflow name "CI"', () => {
    expect(ci).toMatch(/^name:\s*CI\s*$/m)
  })

  it('triggers on pull_request', () => {
    expect(ci).toMatch(/\bpull_request\s*:/m)
  })

  it('triggers on push but ignores gh-pages', () => {
    expect(ci).toMatch(/push\s*:/m)
    expect(ci).toMatch(/branches-ignore\s*:/m)
    expect(ci).toMatch(/gh-pages/)
  })

  it('declares permissions.contents: read', () => {
    expect(ci).toMatch(/permissions\s*:/m)
    expect(ci).toMatch(/contents\s*:\s*read/m)
  })

  it('runs on ubuntu-latest', () => {
    expect(ci).toMatch(/runs-on\s*:\s*ubuntu-latest/m)
  })

  it('uses actions/setup-node@v4 with Node.js 22 and npm cache', () => {
    expect(ci).toMatch(/uses\s*:\s*actions\/setup-node@v4/)
    expect(ci).toMatch(/node-version\s*:\s*['"]?22['"]?/)
    expect(ci).toMatch(/cache\s*:\s*['"]?npm['"]?/)
  })

  it('runs steps in the required order', () => {
    const order = [
      /actions\/checkout@/,
      /actions\/setup-node@v4/,
      /npm ci/,
      /npm run lint/,
      /npm run typecheck/,
      /npm run test:unit/,
      /npm run build/,
      /npx playwright install chromium/,
      /npm run test:e2e/,
    ]
    let cursor = 0
    for (const re of order) {
      const idx = ci.slice(cursor).search(re)
      expect(idx, `step ${re} missing or out of order after position ${cursor}`).toBeGreaterThanOrEqual(0)
      cursor += idx + 1
    }
  })

  it('uploads playwright-diagnostics artifact on failure with if-no-files-found: ignore', () => {
    expect(ci).toMatch(/if\s*:\s*failure\(\)/)
    expect(ci).toMatch(/actions\/upload-artifact@v4/)
    expect(ci).toMatch(/name\s*:\s*playwright-diagnostics/)
    expect(ci).toMatch(/playwright-report/)
    expect(ci).toMatch(/test-results/)
    expect(ci).toMatch(/if-no-files-found\s*:\s*ignore/)
  })
})

describe('CD workflow deployment targets', () => {
  const cd = readWorkflow(cdPath)

  it('declares workflow name "CD"', () => {
    expect(cd).toMatch(/^name:\s*CD\s*$/m)
  })

  it('triggers on push to dev and main branches only', () => {
    expect(cd).toMatch(/push\s*:/m)
    expect(cd).toMatch(/branches\s*:/m)
    expect(cd).toMatch(/\bdev\b/)
    expect(cd).toMatch(/\bmain\b/)
  })

  it('declares permissions.contents: write', () => {
    expect(cd).toMatch(/permissions\s*:/m)
    expect(cd).toMatch(/contents\s*:\s*write/m)
  })

  it('declares concurrency with cancel-in-progress: true', () => {
    expect(cd).toMatch(/concurrency\s*:/m)
    expect(cd).toMatch(/group\s*:\s*\$\{\{\s*github\.workflow\s*\}\}-\$\{\{\s*github\.ref\s*\}\}/)
    expect(cd).toMatch(/cancel-in-progress\s*:\s*true/)
  })

  it('uses Node.js 22 with npm cache', () => {
    expect(cd).toMatch(/uses\s*:\s*actions\/setup-node@v4/)
    expect(cd).toMatch(/node-version\s*:\s*['"]?22['"]?/)
    expect(cd).toMatch(/cache\s*:\s*['"]?npm['"]?/)
  })

  it('checks out with fetch-depth: 0', () => {
    expect(cd).toMatch(/fetch-depth\s*:\s*0/)
  })

  it('maps main → production with /Slowy_Learning_Eng/', () => {
    expect(cd).toMatch(/PUBLISH_TARGET=production/)
    expect(cd).toMatch(/VITE_APP_BASE_PATH=\/Slowy_Learning_Eng\//)
    expect(cd).toMatch(/VITE_APP_START_URL=\/Slowy_Learning_Eng\//)
  })

  it('maps dev → staging with /Slowy_Learning_Eng/staging/', () => {
    expect(cd).toMatch(/PUBLISH_TARGET=staging/)
    expect(cd).toMatch(/VITE_APP_BASE_PATH=\/Slowy_Learning_Eng\/staging\//)
    expect(cd).toMatch(/VITE_APP_START_URL=\/Slowy_Learning_Eng\/staging\//)
  })

  it('invokes publishPages.mjs with --worktree, --dist, --target', () => {
    expect(cd).toMatch(/node scripts\/publishPages\.mjs/)
    expect(cd).toMatch(/--worktree/)
    expect(cd).toMatch(/--dist/)
    expect(cd).toMatch(/--target/)
  })

  it('handles both first deploy (orphan) and subsequent deploy (fetch)', () => {
    expect(cd).toMatch(/git fetch origin gh-pages/)
    expect(cd).toMatch(/git worktree add/)
    expect(cd).toMatch(/--orphan gh-pages/)
  })

  it('skips empty commits and uses the deploy commit message format', () => {
    expect(cd).toMatch(/git diff --cached --quiet/)
    expect(cd).toMatch(/deploy: publish/)
    expect(cd).toMatch(/git push origin gh-pages/)
  })
})
