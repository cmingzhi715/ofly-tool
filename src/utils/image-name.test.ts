import { describe, it, expect } from 'vitest'
import { finalizeOutName } from './image-name'

describe('finalizeOutName', () => {
  it('空输入回退为「原名.新扩展」', () => {
    expect(finalizeOutName('', 'photo.jpg', 'png')).toBe('photo.png')
  })
  it('无扩展名则追加新扩展名', () => {
    expect(finalizeOutName('img', 'photo.jpg', 'png')).toBe('img.png')
  })
  it('含扩展名则替换为新扩展名', () => {
    expect(finalizeOutName('img.jpg', 'photo.jpg', 'webp')).toBe('img.webp')
  })
  it('清洗非法字符为 -', () => {
    expect(finalizeOutName('a/b:c', 'x.png', 'jpg')).toBe('a-b-c.jpg')
  })
  it('去首尾空白', () => {
    expect(finalizeOutName('  img  ', 'x.png', 'jpg')).toBe('img.jpg')
  })
  it('点开头的隐藏文件视为无扩展名，追加新扩展', () => {
    expect(finalizeOutName('.hidden', 'x.png', 'jpg')).toBe('.hidden.jpg')
  })
  it('兜底场景：传原文件扩展名时替换为新格式', () => {
    expect(finalizeOutName('img', 'photo.jpg', 'jpg')).toBe('img.jpg')
  })
})
