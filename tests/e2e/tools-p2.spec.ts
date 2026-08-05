// tests/e2e/tools-p2.spec.ts
import { test, expect } from '@playwright/test'

// 1×1 PNG（data URL）
const PNG_B64 =
  'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M/wHwAF/gL+X2o8tQAAAABJRU5ErkJggg=='

async function makePngBuffer(page: import('@playwright/test').Page): Promise<number[]> {
  return page.evaluate(async () => {
    const c = document.createElement('canvas')
    c.width = 100
    c.height = 100
    const ctx = c.getContext('2d')!
    ctx.fillStyle = '#00aaff'
    ctx.fillRect(0, 0, 100, 100)
    const blob = await new Promise<Blob | null>((r) => c.toBlob(r, 'image/png'))
    return Array.from(new Uint8Array((await blob!.arrayBuffer())!))
  })
}

test('图片压缩：单文件转换', async ({ page }) => {
  await page.goto('/tools/image-compress')
  const buf = await makePngBuffer(page)
  await page
    .locator('.ic-single')
    .setInputFiles({ name: 'test.png', mimeType: 'image/png', buffer: Buffer.from(buf) })
  await expect(page.locator('.ic-origin').first()).toContainText('100×100')
  await page.locator('.ic-single-run').click()
  await expect(page.locator('.ic-preview')).toBeVisible()
  await expect(page.locator('.ic-out')).toContainText('KB')
})

test('图片压缩：文件夹批量写入 covered', async ({ page }) => {
  // 用 fake 目录句柄替换 showDirectoryPicker，驱动批量流程
  await page.addInitScript((b64) => {
    const pngUrl = 'data:image/png;base64,' + b64
    const blobFromUrl = (u: string): Blob => {
      const parts = u.split(',')
      const mime = parts[0].match(/:(.*?);/)![1]
      const bin = atob(parts[1])
      const bytes = new Uint8Array(bin.length)
      for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i)
      return new Blob([bytes], { type: mime })
    }
    const written: string[] = []
    ;(window as any).__written = written

    const makeDir = (name: string): any => {
      const files = new Map<string, Blob>()
      if (name === 'photos') {
        files.set('a.png', blobFromUrl(pngUrl))
        files.set('b.png', blobFromUrl(pngUrl))
      }
      const dirs = new Map<string, any>()
      return {
        name,
        kind: 'directory',
        async *entries() {
          for (const [n, b] of files) {
            yield [
              n,
              {
                name: n,
                kind: 'file',
                async getFile() {
                  return new File([b], n, { type: 'image/png' })
                },
              },
            ]
          }
          for (const [n, d] of dirs) yield [n, d]
        },
        async getDirectoryHandle(n: string, opts?: { create?: boolean }) {
          if (!dirs.has(n) && !opts?.create) throw new Error('not found')
          if (!dirs.has(n)) dirs.set(n, makeDir(n))
          return dirs.get(n)
        },
        async getFileHandle(n: string, opts?: { create?: boolean }) {
          if (!files.has(n) && !opts?.create) throw new Error('not found')
          let stored: Blob = files.get(n)!
          return {
            name: n,
            kind: 'file',
            async createWritable() {
              return {
                async write(data: Blob) {
                  stored = data
                },
                async close() {
                  files.set(n, stored)
                  written.push(n)
                },
              }
            },
          }
        },
      }
    }

    ;(window as any).showDirectoryPicker = () => Promise.resolve(makeDir('photos'))
  }, PNG_B64)

  await page.goto('/tools/image-compress')
  await page.locator('.ic-pick').click()
  await expect(page.locator('.ic-list')).toContainText('a.png')
  await page.locator('.ic-batch-run').click()
  await expect(page.locator('.ic-done')).toContainText('成功 2')
  const written = await page.evaluate(() => (window as any).__written)
  expect(written).toEqual(['a.jpg', 'b.jpg'])
  // 转换前后大小对比表
  await expect(page.locator('.ic-table')).toContainText('a.jpg')
  await expect(page.locator('.ic-table')).toContainText('b.jpg')
  await expect(page.locator('.ic-table')).toContainText('KB')
})
