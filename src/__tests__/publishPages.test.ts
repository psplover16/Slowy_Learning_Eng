import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import { mkdtempSync, rmSync, mkdirSync, writeFileSync, existsSync, readdirSync, readFileSync } from 'node:fs'
import { join } from 'node:path'
import { tmpdir } from 'node:os'
import {
  syncPublishedSite,
  formatPublishSummary,
  formatNoPublishChangesMessage,
} from '../../scripts/publishPages.mjs'

function mkTempRoot(): string {
  return mkdtempSync(join(tmpdir(), 'publishPages-'))
}

function writeFile(path: string, contents: string) {
  writeFileSync(path, contents, 'utf-8')
}

function listSorted(path: string): string[] {
  return readdirSync(path).sort()
}

describe('Protected GitHub Pages publishing — syncPublishedSite', () => {
  let root: string
  let worktreeRoot: string
  let distPath: string

  beforeEach(() => {
    root = mkTempRoot()
    worktreeRoot = join(root, 'worktree')
    distPath = join(root, 'dist')
    mkdirSync(worktreeRoot, { recursive: true })
    mkdirSync(distPath, { recursive: true })
  })

  afterEach(() => {
    rmSync(root, { recursive: true, force: true })
  })

  describe('production target', () => {
    it('preserves .git, .nojekyll, CNAME, staging at the root', () => {
      // Set up worktree with preserved + non-preserved entries
      mkdirSync(join(worktreeRoot, '.git'))
      writeFile(join(worktreeRoot, '.nojekyll'), '')
      writeFile(join(worktreeRoot, 'CNAME'), 'example.com')
      mkdirSync(join(worktreeRoot, 'staging'))
      writeFile(join(worktreeRoot, 'staging', 'index.html'), '<html></html>')
      writeFile(join(worktreeRoot, 'legacy.txt'), 'old')
      writeFile(join(worktreeRoot, 'index.html'), '<old/>')
      mkdirSync(join(worktreeRoot, 'assets-old'))
      writeFile(join(worktreeRoot, 'assets-old', 'x.js'), 'x')

      // Set up dist with new content
      writeFile(join(distPath, 'index.html'), '<new/>')
      mkdirSync(join(distPath, 'assets'))
      writeFile(join(distPath, 'assets', 'app.js'), 'app')

      syncPublishedSite({ worktreeRoot, distPath, target: 'production' })

      const entries = listSorted(worktreeRoot)
      expect(entries).toContain('.git')
      expect(entries).toContain('.nojekyll')
      expect(entries).toContain('CNAME')
      expect(entries).toContain('staging')
      expect(entries).toContain('index.html')
      expect(entries).toContain('assets')
      expect(entries).not.toContain('legacy.txt')
      expect(entries).not.toContain('assets-old')
      // staging subdir untouched
      expect(existsSync(join(worktreeRoot, 'staging', 'index.html'))).toBe(true)
      // CNAME preserved with original contents
      expect(readFileSync(join(worktreeRoot, 'CNAME'), 'utf-8')).toBe('example.com')
      // new content copied
      expect(readFileSync(join(worktreeRoot, 'index.html'), 'utf-8')).toBe('<new/>')
      expect(readFileSync(join(worktreeRoot, 'assets', 'app.js'), 'utf-8')).toBe('app')
    })

    it('writes an empty .nojekyll at the worktree root after publishing', () => {
      writeFile(join(distPath, 'index.html'), '<html/>')
      syncPublishedSite({ worktreeRoot, distPath, target: 'production' })
      expect(existsSync(join(worktreeRoot, '.nojekyll'))).toBe(true)
      expect(readFileSync(join(worktreeRoot, '.nojekyll'), 'utf-8')).toBe('')
    })

    it('skips .gz and .br files when copying', () => {
      writeFile(join(distPath, 'index.html'), '<html/>')
      writeFile(join(distPath, 'app.js'), 'app')
      writeFile(join(distPath, 'app.js.gz'), 'gzipped')
      writeFile(join(distPath, 'app.js.br'), 'brotli')

      syncPublishedSite({ worktreeRoot, distPath, target: 'production' })

      const entries = listSorted(worktreeRoot)
      expect(entries).toContain('app.js')
      expect(entries).not.toContain('app.js.gz')
      expect(entries).not.toContain('app.js.br')
    })
  })

  describe('staging target', () => {
    it('cleans <worktree>/staging/ and copies dist/ into it without touching production root', () => {
      // Production content already at root
      writeFile(join(worktreeRoot, 'index.html'), '<prod-index/>')
      mkdirSync(join(worktreeRoot, 'assets'))
      writeFile(join(worktreeRoot, 'assets', 'main.js'), 'prod')
      mkdirSync(join(worktreeRoot, 'staging'))
      writeFile(join(worktreeRoot, 'staging', 'old.html'), 'old-staging')

      // Dist with new staging build
      writeFile(join(distPath, 'index.html'), '<staging-index/>')
      mkdirSync(join(distPath, 'assets'))
      writeFile(join(distPath, 'assets', 'main.js'), 'staging')

      syncPublishedSite({ worktreeRoot, distPath, target: 'staging' })

      // Production root preserved
      expect(readFileSync(join(worktreeRoot, 'index.html'), 'utf-8')).toBe('<prod-index/>')
      expect(readFileSync(join(worktreeRoot, 'assets', 'main.js'), 'utf-8')).toBe('prod')
      // Staging old content gone, new content present
      expect(existsSync(join(worktreeRoot, 'staging', 'old.html'))).toBe(false)
      expect(readFileSync(join(worktreeRoot, 'staging', 'index.html'), 'utf-8')).toBe('<staging-index/>')
      expect(readFileSync(join(worktreeRoot, 'staging', 'assets', 'main.js'), 'utf-8')).toBe('staging')
      // .nojekyll written at root
      expect(existsSync(join(worktreeRoot, '.nojekyll'))).toBe(true)
    })

    it('removes a stale index.html at the worktree root if it contains "/src/"', () => {
      writeFile(join(worktreeRoot, 'index.html'), '<script src="/src/app/main.ts"></script>')
      writeFile(join(distPath, 'index.html'), '<staging/>')

      syncPublishedSite({ worktreeRoot, distPath, target: 'staging' })

      // Stale index.html removed; staging copy still applied
      expect(existsSync(join(worktreeRoot, 'index.html'))).toBe(false)
      expect(readFileSync(join(worktreeRoot, 'staging', 'index.html'), 'utf-8')).toBe('<staging/>')
    })

    it('leaves a clean root index.html (no /src/) in place under staging target', () => {
      writeFile(join(worktreeRoot, 'index.html'), '<prod-index/>')
      writeFile(join(distPath, 'index.html'), '<staging/>')

      syncPublishedSite({ worktreeRoot, distPath, target: 'staging' })

      expect(readFileSync(join(worktreeRoot, 'index.html'), 'utf-8')).toBe('<prod-index/>')
    })

    it('skips .gz and .br files when copying into staging', () => {
      writeFile(join(distPath, 'index.html'), '<html/>')
      writeFile(join(distPath, 'app.js'), 'app')
      writeFile(join(distPath, 'app.js.gz'), 'gz')
      writeFile(join(distPath, 'app.js.br'), 'br')

      syncPublishedSite({ worktreeRoot, distPath, target: 'staging' })

      const stagingEntries = listSorted(join(worktreeRoot, 'staging'))
      expect(stagingEntries).toContain('app.js')
      expect(stagingEntries).not.toContain('app.js.gz')
      expect(stagingEntries).not.toContain('app.js.br')
    })
  })

  describe('failure modes', () => {
    it('throws when dist directory does not exist', () => {
      rmSync(distPath, { recursive: true, force: true })
      expect(() =>
        syncPublishedSite({ worktreeRoot, distPath, target: 'production' }),
      ).toThrow()
    })

    it('throws when dist is empty', () => {
      // distPath already exists, empty
      expect(() =>
        syncPublishedSite({ worktreeRoot, distPath, target: 'production' }),
      ).toThrow()
    })

    it('throws on unknown target', () => {
      writeFile(join(distPath, 'index.html'), 'x')
      expect(() =>
        // @ts-expect-error intentionally invalid target
        syncPublishedSite({ worktreeRoot, distPath, target: 'preview' }),
      ).toThrow()
    })

    it('does not modify the worktree when dist is empty', () => {
      writeFile(join(worktreeRoot, 'sentinel.txt'), 'keep')
      try {
        syncPublishedSite({ worktreeRoot, distPath, target: 'production' })
      } catch {
        // expected
      }
      expect(existsSync(join(worktreeRoot, 'sentinel.txt'))).toBe(true)
    })

    it('does not modify the worktree when target is invalid', () => {
      writeFile(join(distPath, 'index.html'), 'x')
      writeFile(join(worktreeRoot, 'sentinel.txt'), 'keep')
      try {
        // @ts-expect-error intentionally invalid target
        syncPublishedSite({ worktreeRoot, distPath, target: 'nope' })
      } catch {
        // expected
      }
      expect(existsSync(join(worktreeRoot, 'sentinel.txt'))).toBe(true)
    })
  })
})

describe('formatPublishSummary', () => {
  it('returns a non-empty string mentioning the target', () => {
    const result = {
      target: 'production',
      targetPath: '/tmp/wt',
      removedRootEntries: ['legacy.txt'],
      removedTargetEntries: [],
      copiedEntries: ['index.html', 'assets'],
    }
    const out = formatPublishSummary(result)
    expect(typeof out).toBe('string')
    expect(out.length).toBeGreaterThan(0)
    expect(out).toContain('production')
  })
})

describe('formatNoPublishChangesMessage', () => {
  it('returns a non-empty string mentioning the target', () => {
    const out = formatNoPublishChangesMessage('staging')
    expect(typeof out).toBe('string')
    expect(out.length).toBeGreaterThan(0)
    expect(out).toContain('staging')
  })
})
