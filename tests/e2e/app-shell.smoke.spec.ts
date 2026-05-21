import { test, expect, type ConsoleMessage } from '@playwright/test'

/**
 * App-shell smoke: deep-link each main route, assert the NavBar + route
 * content render, and ensure the cumulative `console.error` count across
 * the entire spec stays at zero.
 */

const routes: Array<{ path: string; selector: string }> = [
  // Home: HomeView renders an article list inside <main>
  { path: '/', selector: 'main' },
  { path: '/grammar', selector: 'main' },
  { path: '/ch1', selector: 'main' },
  { path: '/ch2', selector: 'main' },
  { path: '/ch3', selector: 'main' },
]

test.describe('app shell smoke', () => {
  let consoleErrorCount = 0

  test.beforeEach(({ page }) => {
    consoleErrorCount = 0
    page.on('console', (msg: ConsoleMessage) => {
      if (msg.type() === 'error') consoleErrorCount += 1
    })
  })

  for (const { path, selector } of routes) {
    test(`renders ${path} without console errors`, async ({ page }) => {
      const response = await page.goto(path, { waitUntil: 'networkidle' })
      expect(response, `no response for ${path}`).not.toBeNull()
      expect(response!.ok(), `non-2xx for ${path}`).toBe(true)
      // NavBar
      await expect(page.locator('[data-testid="nav-home"]')).toBeVisible()
      // Route content container
      await expect(page.locator(selector).first()).toBeVisible()
      // No console errors on this route
      expect(consoleErrorCount, `console.error fired on ${path}`).toBe(0)
    })
  }
})
