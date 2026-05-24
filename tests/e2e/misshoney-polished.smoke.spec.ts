import { test, expect, type ConsoleMessage } from '@playwright/test'

const readyVideos = [
  { level: 'a1', slug: 'ch1-slow-english-for-beginners-a1-listening-practice' },
  { level: 'a1', slug: 'ch18-english-listening-practice-for-beginners-my-weekend-a1-a2' },
  { level: 'a2', slug: 'ch1-slow-english-stories-level-a2-listening-a-weird-phone-call' },
  { level: 'a2', slug: 'ch29-what-you-taught-me-about-hope-slow-english-listening' },
  { level: 'b1', slug: 'ch1-slow-english-listening-intermediate-practice-talking-about-my-hobbies' },
  { level: 'b1', slug: 'ch21-slow-english-listening-practice-makeup-routine' },
  { level: 'b2', slug: 'ch1-slow-english-listening-for-upper-intermediate-talking-about-comfort-foods' },
  { level: 'b2', slug: 'ch17-how-she-became-fluent-in-english-intermediate-listening-practice' },
]

test.describe('MissHoney polished content smoke', () => {
  let consoleErrorCount = 0

  test.beforeEach(({ page }) => {
    consoleErrorCount = 0
    page.on('console', (msg: ConsoleMessage) => {
      if (msg.type() === 'error') consoleErrorCount += 1
    })
  })

  test('home renders separated MissHoney navigation cards without completion controls', async ({ page }) => {
    await page.goto('/', { waitUntil: 'networkidle' })

    const section = page.getByTestId('misshoney-section')
    await expect(section).toBeVisible()

    const cards = section.locator('[data-testid^="misshoney-playlist-"]')
    await expect(cards).toHaveCount(4)
    await expect(section.getByTestId('completion-toggle')).toHaveCount(0)

    const firstBox = await cards.nth(0).boundingBox()
    const secondBox = await cards.nth(1).boundingBox()
    expect(firstBox).not.toBeNull()
    expect(secondBox).not.toBeNull()
    expect(secondBox!.y - (firstBox!.y + firstBox!.height)).toBeGreaterThanOrEqual(8)
    expect(consoleErrorCount).toBe(0)
  })

  test('A1 playlist uses article-style cards with completion controls', async ({ page }) => {
    await page.goto('/a1', { waitUntil: 'networkidle' })

    await expect(page.getByRole('heading', { name: 'MissHoney A1' })).toBeVisible()
    const cards = page.getByTestId('playlist-video-card')
    await expect(cards.first()).toBeVisible()
    await expect(cards.first().getByTestId('completion-toggle')).toBeVisible()
    await expect(cards.first()).toHaveAttribute('href', /\/a1\/ch/)
    expect(consoleErrorCount).toBe(0)
  })

  for (const { level, slug } of readyVideos) {
    test(`${level.toUpperCase()} ${slug} ready video renders polished learning sections`, async ({ page }) => {
      await page.goto(`/${level}/${slug}`, { waitUntil: 'networkidle' })

      await expect(page.getByTestId('playlist-reading-header')).toBeVisible()
      await expect(page.getByText('YouTube 原聲影片')).toBeVisible()
      await expect(page.locator(`[id="${level}-${slug}-section-bilingual"]`)).toBeVisible()
      await expect(page.locator(`[id="${level}-${slug}-section-vocabulary"]`)).toBeVisible()
      await expect(page.locator(`[id="${level}-${slug}-section-phrases"]`)).toBeVisible()
      await expect(page.locator(`[id="${level}-${slug}-section-breakdown"]`)).toBeVisible()
      await expect(page.locator(`[data-testid="${level}-${slug}-quick-nav"]`)).toBeVisible()
      expect(consoleErrorCount).toBe(0)
    })
  }

  for (const { level, slug } of readyVideos) {
    test(`${level.toUpperCase()} ${slug} supports A/B/C marker return flow and grammar quick nav`, async ({ page }) => {
      await page.goto(`/${level}/${slug}`, { waitUntil: 'networkidle' })

      for (const kind of ['word', 'phrase', 'usage']) {
        const marker = page.getByTestId(`playlist-marker-${kind}`).first()
        await expect(marker).toBeVisible()

        const targetId = await marker.getAttribute('data-target-id')
        const instanceId = await marker.getAttribute('data-marker-instance')
        expect(targetId).toBeTruthy()
        expect(instanceId).toBeTruthy()

        const target = page.locator(`[id="${targetId}"]`)
        await marker.click()
        await expect(target).toHaveClass(/playlist-learning-item--active/)

        await page.getByTestId('back-to-word-fab').click()
        await expect(page.locator(`[data-marker-instance="${instanceId}"]`))
          .toHaveAttribute('data-last-return-target', 'true')
      }

      await page.getByTestId(`quick-nav-${level}-${slug}-section-breakdown`).click()
      await expect(page.locator(`[id="${level}-${slug}-section-breakdown"]`)).toBeVisible()
      expect(consoleErrorCount).toBe(0)
    })
  }

  test('A1 ch1 supports marker jump, highlight, return, and special usages', async ({ page }) => {
    const slug = 'ch1-slow-english-for-beginners-a1-listening-practice'
    await page.goto(`/a1/${slug}`, { waitUntil: 'networkidle' })

    await expect(page.locator(`[id="a1-${slug}-section-usages"]`)).toBeVisible()

    const marker = page.getByTestId('playlist-marker-word').first()
    await expect(marker).toBeVisible()

    const targetId = await marker.getAttribute('data-target-id')
    expect(targetId).toBeTruthy()

    const target = page.locator(`[id="${targetId}"]`)
    await marker.click()
    await expect(target).toHaveClass(/playlist-learning-item--active/)

    await page.getByTestId('back-to-word-fab').click()
    await expect(marker).toHaveAttribute('data-last-return-target', 'true')
    expect(consoleErrorCount).toBe(0)
  })

  test('A1 refreshed rollout video supports marker jump and grammar quick nav', async ({ page }) => {
    const slug = 'ch18-english-listening-practice-for-beginners-my-weekend-a1-a2'
    await page.goto(`/a1/${slug}`, { waitUntil: 'networkidle' })

    await expect(page.locator(`[id="a1-${slug}-section-usages"]`)).toBeVisible()
    await expect(page.locator(`[id="a1-${slug}-section-breakdown"]`)).toBeVisible()
    await expect(page.getByTestId(`quick-nav-a1-${slug}-section-breakdown`)).toBeVisible()

    const marker = page.getByTestId('playlist-marker-word').first()
    await expect(marker).toBeVisible()

    const targetId = await marker.getAttribute('data-target-id')
    expect(targetId).toBeTruthy()

    const target = page.locator(`[id="${targetId}"]`)
    await marker.click()
    await expect(target).toHaveClass(/playlist-learning-item--active/)
    expect(consoleErrorCount).toBe(0)
  })

  test('A1 ch1 marker flow works in a mobile viewport', async ({ page }) => {
    const slug = 'ch1-slow-english-for-beginners-a1-listening-practice'
    await page.setViewportSize({ width: 390, height: 844 })
    await page.goto(`/a1/${slug}`, { waitUntil: 'networkidle' })

    await expect(page.locator(`[id="a1-${slug}-section-usages"]`)).toBeVisible()

    const marker = page.getByTestId('playlist-marker-usage').first()
    const targetId = await marker.getAttribute('data-target-id')
    expect(targetId).toBeTruthy()

    const target = page.locator(`[id="${targetId}"]`)
    await marker.click()
    await expect(target).toHaveClass(/playlist-learning-item--active/)
    expect(consoleErrorCount).toBe(0)
  })
})
