import { test, expect } from '@playwright/test'

test('默认皮肤为 neon', async ({ page }) => {
  await page.goto('/')
  await expect(page.locator('html')).toHaveAttribute('data-skin', 'neon')
})

test('切换皮肤并刷新后保持（localStorage 持久化）', async ({ page }) => {
  await page.goto('/')
  await page.getByRole('button', { name: /霓虹/ }).click()
  await expect(page.locator('html')).toHaveAttribute('data-skin', 'crt')
  await page.reload()
  await expect(page.locator('html')).toHaveAttribute('data-skin', 'crt')
})

test('从首页导航到 JSON 工具页', async ({ page }) => {
  await page.goto('/')
  await page.getByRole('link', { name: /JSON 格式化/ }).first().click()
  await expect(page).toHaveURL(/\/tools\/json-formatter/)
  await expect(page.getByRole('heading', { name: 'JSON 格式化' })).toBeVisible()
})
