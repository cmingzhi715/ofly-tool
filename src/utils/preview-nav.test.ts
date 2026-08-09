import { describe, it, expect } from 'vitest'
import { nextPreviewIndex } from './preview-nav'

describe('nextPreviewIndex', () => {
  it('向后找下一张有预览的行', () => {
    expect(nextPreviewIndex([true, true, false, true], 0, 1)).toBe(1)
  })
  it('跳过失败行（无预览）', () => {
    expect(nextPreviewIndex([true, false, true], 0, 1)).toBe(2)
  })
  it('末尾下一张循环到开头', () => {
    expect(nextPreviewIndex([true, true], 1, 1)).toBe(0)
  })
  it('向前找上一张', () => {
    expect(nextPreviewIndex([true, false, true], 2, -1)).toBe(0)
  })
  it('开头上一张循环到末尾', () => {
    expect(nextPreviewIndex([true, false, true], 0, -1)).toBe(2)
  })
  it('只有一张有预览时原地循环返回自身', () => {
    expect(nextPreviewIndex([true, false], 0, 1)).toBe(0)
    expect(nextPreviewIndex([true, false], 0, -1)).toBe(0)
  })
  it('空列表返回 null', () => {
    expect(nextPreviewIndex([], 0, 1)).toBeNull()
  })
  it('全部无预览返回 null', () => {
    expect(nextPreviewIndex([false, false], 0, 1)).toBeNull()
  })
})
