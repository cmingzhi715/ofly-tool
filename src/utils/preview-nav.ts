/** 翻页：从 current 沿 dir（1=下一张，-1=上一张）寻找下一个有预览的行索引；跳过无预览行，头尾循环；找不到返回 null */
export function nextPreviewIndex(
  hasPreview: boolean[],
  current: number,
  dir: 1 | -1,
): number | null {
  const n = hasPreview.length
  if (n === 0) return null
  for (let step = 1; step <= n; step++) {
    const idx = (current + dir * step + n) % n
    if (hasPreview[idx]) return idx
  }
  return null
}
