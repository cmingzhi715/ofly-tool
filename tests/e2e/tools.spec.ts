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

test('Hash 生成器：SHA-256 与 MD5', async ({ page }) => {
  await page.goto('/tools/hash-generator')
  await page.locator('.hs-in').fill('abc')
  await expect(page.locator('.hs-out')).toHaveText(
    'ba7816bf8f01cfea414140de5dae2223b00361a396177a9cb410ff61f20015ad',
  )
  await page.locator('#hs-alg').selectOption('md5')
  await expect(page.locator('.hs-out')).toHaveText(
    '900150983cd24fb0d6963f7d28e17f72',
  )
})

test('Base64：中文编码与解码往返', async ({ page }) => {
  await page.goto('/tools/base64')
  await page.locator('.b64-in').fill('你好')
  await page.getByRole('button', { name: '编码为 Base64' }).click()
  const out = page.locator('.b64-out')
  await expect(out).toHaveText('5L2g5aW9')
  await page.locator('.b64-in').fill('5L2g5aW9')
  await page.getByRole('button', { name: '从 Base64 解码' }).click()
  await expect(page.locator('.b64-out')).toHaveText('你好')
})

test('时间戳转换：Unix 秒 → UTC 时间', async ({ page }) => {
  await page.goto('/tools/timestamp')
  await page.locator('.ts-in').fill('1700000000')
  await page.getByRole('button', { name: '转换' }).first().click()
  await expect(page.locator('.ts-result').first()).toContainText('2023-11-14')
  await expect(page.locator('.ts-result').first()).toContainText('22:13:20 UTC')
})

test('URL：编码与解码往返', async ({ page }) => {
  await page.goto('/tools/url-codec')
  await page.locator('.url-in').fill('a b&中')
  await page.getByRole('button', { name: '编码' }).click()
  const out = page.locator('.url-out')
  await expect(out).toHaveText('a%20b%26%E4%B8%AD')
  await page.locator('.url-in').fill('a%20b%26%E4%B8%AD')
  await page.getByRole('button', { name: '解码' }).click()
  await expect(page.locator('.url-out')).toHaveText('a b&中')
})
