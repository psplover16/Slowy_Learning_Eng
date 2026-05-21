import { test, expect, type ConsoleMessage } from '@playwright/test'

test.describe('ch2 smoke', () => {
  let consoleErrorCount = 0

  test.beforeEach(({ page }) => {
    consoleErrorCount = 0
    page.on('console', (msg: ConsoleMessage) => {
      if (msg.type() === 'error') consoleErrorCount += 1
    })
  })

  test('renders /ch2 with correct title and no console errors', async ({ page }) => {
    const response = await page.goto('/ch2', { waitUntil: 'networkidle' })
    expect(response, 'no response for /ch2').not.toBeNull()
    expect(response!.ok(), 'non-2xx for /ch2').toBe(true)
    await expect(page.locator('main')).toBeVisible()
    await expect(page.locator('h1')).toContainText('語言究竟是怎麼學會的')
    expect(consoleErrorCount, 'console.error fired on /ch2').toBe(0)
  })

  test('quick nav shows 全文/單字/片語/句型 buttons', async ({ page }) => {
    await page.goto('/ch2', { waitUntil: 'networkidle' })
    const nav = page.locator('[data-testid="ch2-quick-nav"]')
    await expect(nav).toBeVisible()
    const buttons = nav.locator('button')
    await expect(buttons).toHaveCount(4)
    await expect(buttons.nth(0)).toHaveText('全文')
    await expect(buttons.nth(1)).toHaveText('單字')
    await expect(buttons.nth(2)).toHaveText('片語')
    await expect(buttons.nth(3)).toHaveText('句型')
  })

  test('vocabulary, phrases, and breakdown sections are visible', async ({ page }) => {
    await page.goto('/ch2', { waitUntil: 'networkidle' })
    await expect(page.locator('#ch2-section-vocabulary')).toBeVisible()
    await expect(page.locator('#ch2-section-phrases')).toBeVisible()
    await expect(page.locator('#ch2-section-breakdown')).toBeVisible()
  })

  test('bilingual section is visible', async ({ page }) => {
    await page.goto('/ch2', { waitUntil: 'networkidle' })
    await expect(page.locator('#ch2-section-bilingual')).toBeVisible()
  })
})
