import { describe, it, expect } from 'vitest'
import { thumbSize } from './thumb'

describe('thumbSize', () => {
  it('横图：长边缩放到 64，短边等比', () => {
    expect(thumbSize(1280, 720)).toEqual({ w: 64, h: 36 })
  })
  it('竖图：长边缩放到 64，短边等比', () => {
    expect(thumbSize(720, 1280)).toEqual({ w: 36, h: 64 })
  })
  it('正方形缩放到 64×64', () => {
    expect(thumbSize(100, 100)).toEqual({ w: 64, h: 64 })
  })
  it('原图小于 64 时不放大', () => {
    expect(thumbSize(32, 32)).toEqual({ w: 32, h: 32 })
  })
  it('宽高至少为 1px', () => {
    expect(thumbSize(64, 1)).toEqual({ w: 64, h: 1 })
  })
  it('自定义 max', () => {
    expect(thumbSize(200, 100, 48)).toEqual({ w: 48, h: 24 })
  })
})
