import jsQR from 'jsqr'

/**
 * 解码 RGBA 像素中的二维码 → 文本。纯函数，可在 Node 单测中验证。
 * 返回 null 表示未识别到二维码。
 */
export function decodeQrPixels(
  data: Uint8ClampedArray,
  width: number,
  height: number,
): string | null {
  const res = jsQR(data, width, height, { inversionAttempts: 'attemptBoth' })
  return res?.data ?? null
}

/**
 * 从图片源（ImageBitmap / HTMLImageElement）解码二维码文本。
 * 浏览器侧：绘制到画布读取像素，再交给 decodeQrPixels。
 */
export async function decodeQrFromImage(
  source: ImageBitmap | HTMLImageElement,
): Promise<string | null> {
  const width = 'naturalWidth' in source ? source.naturalWidth : source.width
  const height = 'naturalHeight' in source ? source.naturalHeight : source.height
  if (!width || !height) return null

  const canvas = document.createElement('canvas')
  canvas.width = width
  canvas.height = height
  const ctx = canvas.getContext('2d')
  if (!ctx) return null
  ctx.drawImage(source, 0, 0)
  const { data } = ctx.getImageData(0, 0, width, height)
  return decodeQrPixels(data, width, height)
}

/**
 * 把 File / Blob 解码为 ImageBitmap 后解码二维码。
 * 退化路径（createImageBitmap 不可用）回退到 HTMLImageElement。
 */
export async function decodeQrFromFile(file: Blob): Promise<string | null> {
  if (typeof createImageBitmap === 'function') {
    try {
      const bmp = await createImageBitmap(file)
      return await decodeQrFromImage(bmp)
    } catch {
      // 落到 img 路径
    }
  }
  return await decodeQrViaImg(file)
}

function decodeQrViaImg(file: Blob): Promise<string | null> {
  return new Promise((resolve) => {
    const url = URL.createObjectURL(file)
    const img = new Image()
    img.onload = async () => {
      try {
        resolve(await decodeQrFromImage(img))
      } finally {
        URL.revokeObjectURL(url)
      }
    }
    img.onerror = () => {
      URL.revokeObjectURL(url)
      resolve(null)
    }
    img.src = url
  })
}
