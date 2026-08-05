// tests/e2e/tools-p1.spec.ts
import { test, expect } from '@playwright/test'

test('文本 Diff：差异高亮', async ({ page }) => {
  await page.goto('/tools/text-diff')
  await page.locator('.df-in').nth(0).fill('a\nb\nc')
  await page.locator('.df-in').nth(1).fill('a\nx\nc')
  await page.getByRole('button', { name: '对比' }).click()
  await expect(page.locator('.diff-rem')).toContainText('- b')
  await expect(page.locator('.diff-add')).toContainText('+ x')
})

test('二维码：输入文本生成二维码', async ({ page }) => {
  await page.goto('/tools/qrcode')
  await page.locator('.qr-in').fill('https://example.com')
  await expect(page.locator('.qr-img')).toBeVisible()
  const src = await page.locator('.qr-img').getAttribute('src')
  expect(src).toMatch(/^data:image\/png/)
})
