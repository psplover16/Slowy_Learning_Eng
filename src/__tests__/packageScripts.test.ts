import { describe, it, expect } from 'vitest'
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'

const pkgPath = resolve(__dirname, '../../package.json')
const pkg = JSON.parse(readFileSync(pkgPath, 'utf-8')) as {
  scripts?: Record<string, string>
}

describe('Package script contract', () => {
  const required = ['lint', 'typecheck', 'test:unit', 'build', 'test:e2e', 'test:ci'] as const

  it('exposes the six required scripts', () => {
    expect(pkg.scripts).toBeDefined()
    for (const name of required) {
      expect(pkg.scripts, `missing script: ${name}`).toHaveProperty(name)
      expect(pkg.scripts![name]).toBeTypeOf('string')
      expect(pkg.scripts![name].trim().length).toBeGreaterThan(0)
    }
  })

  it('lint script invokes ESLint over .ts and .vue files', () => {
    const lint = pkg.scripts!.lint
    expect(lint).toContain('eslint')
    expect(lint).toMatch(/\.ts/)
    expect(lint).toMatch(/\.vue/)
  })

  it('typecheck script invokes vue-tsc in --noEmit mode', () => {
    const typecheck = pkg.scripts!.typecheck
    expect(typecheck).toContain('vue-tsc')
    expect(typecheck).toContain('--noEmit')
  })

  it('test:unit script invokes Vitest in run mode', () => {
    expect(pkg.scripts!['test:unit']).toContain('vitest')
    expect(pkg.scripts!['test:unit']).toContain('run')
  })

  it('build script runs typecheck before vite build', () => {
    const build = pkg.scripts!.build
    expect(build).toContain('vue-tsc')
    expect(build).toContain('--noEmit')
    expect(build).toContain('vite build')
    expect(build.indexOf('vue-tsc')).toBeLessThan(build.indexOf('vite build'))
  })

  it('test:e2e script invokes Playwright', () => {
    expect(pkg.scripts!['test:e2e']).toContain('playwright')
  })

  it('test:ci chains lint → typecheck → test:unit → build → test:e2e with &&', () => {
    const ci = pkg.scripts!['test:ci']
    const order = ['lint', 'typecheck', 'test:unit', 'build', 'test:e2e']
    const positions = order.map((name) => ci.indexOf(`npm run ${name}`))
    // Each step must be present
    for (let i = 0; i < order.length; i++) {
      expect(positions[i], `step '${order[i]}' missing from test:ci`).toBeGreaterThanOrEqual(0)
    }
    // Each step must appear in the exact order
    for (let i = 1; i < positions.length; i++) {
      expect(positions[i]).toBeGreaterThan(positions[i - 1])
    }
    // Steps must be chained with &&
    expect(ci.split('&&').length).toBeGreaterThanOrEqual(order.length)
  })
})
