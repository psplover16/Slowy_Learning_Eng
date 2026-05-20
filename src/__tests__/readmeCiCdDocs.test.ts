import { describe, it, expect } from 'vitest'
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'

const repoRoot = resolve(__dirname, '../..')
const readme = readFileSync(resolve(repoRoot, 'README.md'), 'utf-8')
const arch = readFileSync(resolve(repoRoot, 'PROJECT_ARCHITECTURE.md'), 'utf-8')

describe('CI/CD documentation — README.md', () => {
  it('lists the six npm scripts for local validation', () => {
    const scripts = ['lint', 'typecheck', 'test:unit', 'build', 'test:e2e', 'test:ci']
    for (const s of scripts) {
      // Each script must be referenced (in code-fence or inline code)
      expect(readme, `missing script reference: ${s}`).toContain(`${s}`)
    }
    // Heuristic: each script appears alongside `npm run` somewhere
    for (const s of scripts) {
      expect(readme).toMatch(new RegExp(`npm run ${s.replace(/[.:]/g, '\\$&')}`))
    }
  })

  it('describes CI triggers (pull_request and non-gh-pages push)', () => {
    expect(readme.toLowerCase()).toContain('pull_request')
    expect(readme).toContain('gh-pages')
  })

  it('describes CD trigger mapping dev → staging and main → production', () => {
    expect(readme).toMatch(/dev[^\n]*staging/)
    expect(readme).toMatch(/main[^\n]*production/)
  })

  it('documents production URL pattern', () => {
    expect(readme).toMatch(/https:\/\/[^/\s]+\.github\.io\/Slowy_Learning_Eng\//)
  })

  it('documents staging URL pattern', () => {
    expect(readme).toMatch(/https:\/\/[^/\s]+\.github\.io\/Slowy_Learning_Eng\/staging\//)
  })

  it('documents how to set GitHub Pages source to gh-pages branch', () => {
    expect(readme.toLowerCase()).toContain('pages')
    expect(readme).toContain('gh-pages')
  })

  it('recommends branch protection for dev and main', () => {
    // Accept Chinese or English heading
    expect(readme).toMatch(/branch protection|分支保護/i)
    expect(readme).toMatch(/\bdev\b/)
    expect(readme).toMatch(/\bmain\b/)
  })

  it('contains a first-deploy checklist section with 6 numbered steps', () => {
    expect(readme).toMatch(/first-deploy|首次部署/i)
    // The checklist must contain 6 numbered steps (1. ... 6.)
    const numbered = readme.match(/^[ \t]*[1-6]\.\s+/gm) ?? []
    expect(numbered.length).toBeGreaterThanOrEqual(6)
  })
})

describe('CI/CD documentation — PROJECT_ARCHITECTURE.md', () => {
  it('lists the new files added by this change', () => {
    const newFiles = [
      '.github/workflows/ci.yml',
      '.github/workflows/cd.yml',
      'scripts/publishPages.mjs',
      'eslint.config.js',
      'playwright.config.ts',
      'tests/e2e',
    ]
    for (const file of newFiles) {
      expect(arch, `missing file reference: ${file}`).toContain(file)
    }
  })

  it('documents the base path → target → URL mapping', () => {
    // production
    expect(arch).toContain('/Slowy_Learning_Eng/')
    expect(arch.toLowerCase()).toContain('production')
    // staging
    expect(arch).toContain('/Slowy_Learning_Eng/staging/')
    expect(arch.toLowerCase()).toContain('staging')
    // URL pattern hint
    expect(arch).toMatch(/github\.io/)
  })
})
