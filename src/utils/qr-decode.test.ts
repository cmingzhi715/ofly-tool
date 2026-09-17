import { describe, it, expect } from 'vitest'
import QRCode from 'qrcode'
import { decodeQrPixels } from './qr-decode'

// 把 qrcode 矩阵渲染为 RGBA 像素（含 4 格静区），供 jsQR 解码。
function matrixToPixels(text: string): { data: Uint8ClampedArray; w: number; h: number } {
  const qr = QRCode.create(text, { errorCorrectionLevel: 'low' })
  const mod = qr.modules
  const n = mod.size
  const quiet = 4
  const cell = 8
  const dim = (n + quiet * 2) * cell
  const px = new Uint8ClampedArray(dim * dim * 4)
  const idx = (x: number, y: number) => (y * dim + x) * 4
  for (let y = 0; y < dim; y++) {
    for (let x = 0; x < dim; x++) {
      const mx = Math.floor((x / cell) - quiet)
      const my = Math.floor((y / cell) - quiet)
      const dark = mx >= 0 && my >= 0 && mx < n && my < n && mod.get(mx, my)
      const v = dark ? 0 : 255
      px[idx(x, y)] = v
      px[idx(x, y) + 1] = v
      px[idx(x, y) + 2] = v
      px[idx(x, y) + 3] = 255
    }
  }
  return { data: px, w: dim, h: dim }
}

describe('decodeQrPixels', () => {
  it('往返：生成二维码像素 → 解码回原文', () => {
    const text = 'https://example.com/hello?x=1&y=二维码'
    const { data, w, h } = matrixToPixels(text)
    expect(decodeQrPixels(data, w, h)).toBe(text)
  })
  it('纯白图识别不到二维码，返回 null', () => {
    const w = 100
    const h = 100
    const data = new Uint8ClampedArray(w * h * 4).fill(255)
    expect(decodeQrPixels(data, w, h)).toBeNull()
  })
})
