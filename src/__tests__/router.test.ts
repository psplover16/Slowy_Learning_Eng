import { describe, it, expect } from 'vitest'
import { router } from '../app/router/index'
import { chapters } from '../shared/config/chapters'

describe('router', () => {
  it('defines the static / and /grammar routes', () => {
    const paths = router.getRoutes().map((r) => r.path)
    expect(paths).toContain('/')
    expect(paths).toContain('/grammar')
  })

  it('uses history mode (HTML5)', () => {
    expect(router.options.history.base).toBeDefined()
  })

  it('generates one chapter route per chapters config entry', () => {
    const chapterIds = new Set(chapters.map((c) => c.id))
    const chapterRoutesFromRouter = router.getRoutes().filter((r) => chapterIds.has(String(r.name)))
    expect(chapterRoutesFromRouter.length).toBe(chapters.length)
  })

  it('resolves /ch1 to a route named "ch1"', () => {
    const resolved = router.resolve('/ch1')
    expect(resolved.matched.length).toBeGreaterThan(0)
    expect(resolved.matched[0].name).toBe('ch1')
  })

  it('injects the chapter id as props.id for chapter routes', () => {
    const resolved = router.resolve('/ch1')
    const record = resolved.matched[0]
    // The route's props function should produce { id: 'ch1' } for the resolved route
    const propsFn = record.props.default as (route: typeof resolved) => Record<string, unknown>
    expect(typeof propsFn).toBe('function')
    expect(propsFn(resolved)).toEqual({ id: 'ch1' })
  })
})
