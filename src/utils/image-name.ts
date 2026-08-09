/** 批量输出文件名规范化：空回退、清洗非法字符、保证以给定扩展名结尾 */
export function finalizeOutName(base: string, origName: string, ext: string): string {
  const clean = base.trim().replace(/[\\/:*?"<>|]/g, '-')
  const stem = clean || origName.replace(/\.[^.]+$/, '')
  // 非点开头且带扩展名 → 替换；否则追加
  return /^.+\.\w{1,5}$/.test(stem) ? stem.replace(/\.[^.]+$/, `.${ext}`) : `${stem}.${ext}`
}

/** 返回数组中重复出现的名字（去重） */
export function findDuplicateNames(names: string[]): string[] {
  const seen = new Set<string>()
  const dup = new Set<string>()
  for (const n of names) {
    if (seen.has(n)) dup.add(n)
    else seen.add(n)
  }
  return [...dup]
}
