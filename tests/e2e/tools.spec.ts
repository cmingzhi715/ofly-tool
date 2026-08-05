// tests/e2e/tools.spec.ts
import { test, expect } from '@playwright/test'

test('JSON 格式化：格式化与压缩', async ({ page }) => {
  await page.goto('/tools/json-formatter')
  await page.locator('.js-in').fill('{"a":1,"b":[1,2]}')
  await page.getByRole('button', { name: '格式化 JSON' }).click()
  const out = page.locator('.js-out')
  await expect(out).toContainText('"a": 1')
  await expect(out).toContainText('"b":')
  await page.locator('.js-in').fill('{"a":1}')
  await page.getByRole('button', { name: '压缩 JSON' }).click()
  await expect(page.locator('.js-out')).toHaveText('{"a":1}')
})

test('JSON 校验：非法 JSON 显示错误', async ({ page }) => {
  await page.goto('/tools/json-formatter')
  await page.locator('.js-in').fill('{bad json}')
  await page.getByRole('button', { name: '校验 JSON' }).click()
  await expect(page.locator('.js-error')).toBeVisible()
})
