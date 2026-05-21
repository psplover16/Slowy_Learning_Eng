import { test, expect, type ConsoleMessage } from '@playwright/test'

test.describe('ch3 smoke', () => {
  let consoleErrorCount = 0

  test.beforeEach(({ page }) => {
    consoleErrorCount = 0
    page.on('console', (msg: ConsoleMessage) => {
      if (msg.type() === 'error') consoleErrorCount += 1
    })
  })

  test('renders /ch3 with correct title and no console errors', async ({ page }) => {
    const response = await page.goto('/ch3', { waitUntil: 'networkidle' })
    expect(response, 'no response for /ch3').not.toBeNull()
    expect(response!.ok(), 'non-2xx for /ch3').toBe(true)
    await expect(page.locator('main')).toBeVisible()
    await expect(page.locator('h1')).toContainText('傳統學習法為何無法帶來流暢')
    expect(consoleErrorCount, 'console.error fired on /ch3').toBe(0)
  })

  test('quick nav shows 全文/單字/片語 buttons (3 buttons, no 句型)', async ({ page }) => {
    await page.goto('/ch3', { waitUntil: 'networkidle' })
    const nav = page.locator('[data-testid="ch3-quick-nav"]')
    await expect(nav).toBeVisible()
    const buttons = nav.locator('button')
    await expect(buttons).toHaveCount(3)
    await expect(buttons.nth(0)).toHaveText('全文')
    await expect(buttons.nth(1)).toHaveText('單字')
    await expect(buttons.nth(2)).toHaveText('片語')
  })

  test('bilingual section is visible', async ({ page }) => {
    await page.goto('/ch3', { waitUntil: 'networkidle' })
    await expect(page.locator('#ch3-section-bilingual')).toBeVisible()
  })

  test('vocabulary and phrases sections are visible', async ({ page }) => {
    await page.goto('/ch3', { waitUntil: 'networkidle' })
    await expect(page.locator('#ch3-section-vocabulary')).toBeVisible()
    await expect(page.locator('#ch3-section-phrases')).toBeVisible()
  })
})
