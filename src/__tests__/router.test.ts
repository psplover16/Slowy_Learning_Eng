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

  it.each(['ch1', 'ch2', 'ch3', 'ch4'])('resolves /%s to the matching chapter route', (chapterId) => {
    const resolved = router.resolve(`/${chapterId}`)
    expect(resolved.matched.length).toBeGreaterThan(0)
    expect(resolved.matched[0].name).toBe(chapterId)
  })

  it.each(['ch1', 'ch2', 'ch3', 'ch4'])('injects %s as props.id for chapter routes', (chapterId) => {
    const resolved = router.resolve(`/${chapterId}`)
    const record = resolved.matched[0]
    // The route's props function should produce the concrete chapter id for the resolved route.
    const propsFn = record.props.default as (route: typeof resolved) => Record<string, unknown>
    expect(typeof propsFn).toBe('function')
    expect(propsFn(resolved)).toEqual({ id: chapterId })
  })
})
