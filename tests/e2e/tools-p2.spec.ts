// tests/e2e/tools-p2.spec.ts
import { test, expect } from '@playwright/test'

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
  await page.addInitScript(() => {
    // 随机噪点图：内容复杂，转 JPEG 必然变小，确保批量走「成功写入」路径
    const c = document.createElement('canvas')
    c.width = 200
    c.height = 200
    const ctx = c.getContext('2d')!
    const img = ctx.createImageData(200, 200)
    for (let i = 0; i < img.data.length; i += 4) {
      img.data[i] = Math.random() * 255
      img.data[i + 1] = Math.random() * 255
      img.data[i + 2] = Math.random() * 255
      img.data[i + 3] = 255
    }
    ctx.putImageData(img, 0, 0)
    const pngUrl = c.toDataURL('image/png')
    const blobFromUrl = (u: string): Blob => {
      const parts = u.split(',')
      const mime = parts[0].match(/:(.*?);/)![1]
      const bin = atob(parts[1])
      const bytes = new Uint8Array(bin.length)
      for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i)
      return new Blob([bytes], { type: mime })
    }
    const written: string[] = []
    ;(window as unknown as { __written: string[] }).__written = written

    interface FakeWritable {
      write(data: Blob): Promise<void>
      close(): Promise<void>
    }
    interface FakeFileHandle {
      name: string
      kind: 'file'
      getFile(): Promise<File>
      createWritable(): Promise<FakeWritable>
    }
    interface FakeDirHandle {
      name: string
      kind: 'directory'
      entries(): AsyncGenerator<[string, FakeFileHandle | FakeDirHandle]>
      getDirectoryHandle(name: string, opts?: { create?: boolean }): Promise<FakeDirHandle>
      getFileHandle(name: string, opts?: { create?: boolean }): Promise<FakeFileHandle>
    }

    const makeDir = (name: string): FakeDirHandle => {
      const files = new Map<string, Blob>()
      if (name === 'photos') {
        files.set('a.png', blobFromUrl(pngUrl))
        files.set('b.png', blobFromUrl(pngUrl))
      }
      const dirs = new Map<string, FakeDirHandle>()
      const fileHandle = (n: string): FakeFileHandle => ({
        name: n,
        kind: 'file',
        async getFile() {
          return new File([files.get(n)!], n, { type: 'image/png' })
        },
        async createWritable() {
          let stored: Blob = files.get(n)!
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
      })
      return {
        name,
        kind: 'directory',
        async *entries() {
          for (const [n] of files) yield [n, fileHandle(n)]
          for (const [n, d] of dirs) yield [n, d]
        },
        async getDirectoryHandle(n: string, opts?: { create?: boolean }) {
          if (!dirs.has(n) && !opts?.create) throw new Error('not found')
          if (!dirs.has(n)) dirs.set(n, makeDir(n))
          return dirs.get(n)!
        },
        async getFileHandle(n: string, opts?: { create?: boolean }) {
          if (!files.has(n) && !opts?.create) throw new Error('not found')
          if (!files.has(n)) files.set(n, new Blob())
          return fileHandle(n)
        },
      }
    }

    ;(window as unknown as { showDirectoryPicker(): Promise<FakeDirHandle> }).showDirectoryPicker =
      () => Promise.resolve(makeDir('photos'))
  })

  await page.goto('/tools/image-compress')
  await page.locator('.ic-pick').click()
  // 转换前：合并后的单表立即出现，含原文件名
  await expect(page.locator('.ic-table')).toContainText('a.png')
  await expect(page.locator('.ic-table')).toContainText('b.png')
  // 原图缩略图懒加载生成：进入视口后 img 带 blob: src
  await expect(page.locator('.ic-thumb')).toHaveCount(2)
  await expect(page.locator('.ic-thumb').first()).toHaveAttribute('src', /^blob:/)
  // 原大小在转换前即显示
  await expect(page.locator('.ic-table')).toContainText('KB')
  // 输出名可编辑（改回默认值，不影响写入断言）
  const nameInput = page.locator('.ic-outname').first()
  await expect(nameInput).toHaveValue('a.jpg')
  await nameInput.fill('a-edit')
  await expect(nameInput).toHaveValue('a-edit')
  await nameInput.fill('a.jpg')
  await page.locator('.ic-batch-run').click()
  await expect(page.locator('.ic-done')).toContainText('成功 2')
  const written = await page.evaluate(() => (window as unknown as { __written: string[] }).__written)
  expect(written).toEqual(['a.jpg', 'b.jpg'])
  // 转换前后大小对比表
  await expect(page.locator('.ic-table')).toContainText('a.jpg')
  await expect(page.locator('.ic-table')).toContainText('b.jpg')
  await expect(page.locator('.ic-table')).toContainText('KB')
  // 预览列：每行一张 blob 预览图
  await expect(page.locator('.ic-result-thumb')).toHaveCount(2)
  await expect(page.locator('.ic-result-thumb').first()).toHaveAttribute('src', /^blob:/)
  // 灯箱：点击打开 → 方向键翻页 → Esc 关闭
  await page.locator('.ic-result-thumb').first().click()
  await expect(page.locator('.ipl-backdrop')).toBeVisible()
  await expect(page.locator('.ipl-title')).toContainText('a.jpg · 1 / 2')
  await page.keyboard.press('ArrowRight')
  await expect(page.locator('.ipl-title')).toContainText('b.jpg · 2 / 2')
  await page.keyboard.press('ArrowLeft')
  await expect(page.locator('.ipl-title')).toContainText('a.jpg · 1 / 2')
  await page.keyboard.press('Escape')
  await expect(page.locator('.ipl-backdrop')).toHaveCount(0)
})
