import { test, expect } from '@playwright/test'

test('应用可加载，根节点渲染内容', async ({ page }) => {
  await page.goto('/')
  await expect(page.locator('#app')).not.toBeEmpty()
})
