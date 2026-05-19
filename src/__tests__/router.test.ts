import { describe, it, expect } from 'vitest'
import { router } from '../app/router/index'

describe('router', () => {
  it('defines three routes: /, /grammar, /ch1', () => {
    const paths = router.getRoutes().map((r) => r.path)
    expect(paths).toContain('/')
    expect(paths).toContain('/grammar')
    expect(paths).toContain('/ch1')
  })

  it('uses history mode (HTML5)', () => {
    expect(router.options.history.base).toBeDefined()
  })
})
