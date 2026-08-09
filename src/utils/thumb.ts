/** 缩略图尺寸：较长边缩放到 max（默认 64），保持宽高比；原图更小时不放大 */
export function thumbSize(
  w: number,
  h: number,
  max = 64,
): { w: number; h: number } {
  const scale = Math.min(1, max / Math.max(w, h))
  return {
    w: Math.max(1, Math.round(w * scale)),
    h: Math.max(1, Math.round(h * scale)),
  }
}
