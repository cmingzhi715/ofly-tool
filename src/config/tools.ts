export interface ToolMeta {
  id: string
  name: string
  short: string
  desc: string
  path: string
}

export const tools: ToolMeta[] = [
  { id: 'json-formatter', name: 'JSON 格式化', short: 'JSON', desc: '格式化 / 校验 / 压缩', path: '/tools/json-formatter' },
  { id: 'hash-generator', name: 'Hash 生成器', short: 'HASH', desc: 'MD5 / SHA1 / SHA256 / SHA512', path: '/tools/hash-generator' },
  { id: 'base64', name: 'Base64 编解码', short: 'BASE64', desc: '文本编码与解码', path: '/tools/base64' },
  { id: 'timestamp', name: '时间戳转换', short: 'TS', desc: 'Unix ↔ 日期，秒 / 毫秒', path: '/tools/timestamp' },
  { id: 'url-codec', name: 'URL 编码 / 解码', short: 'URL', desc: '百分号编码与解码', path: '/tools/url-codec' },
  { id: 'text-diff', name: '文本 Diff 对比', short: 'DIFF', desc: '两段文本差异高亮', path: '/tools/text-diff' },
  { id: 'qrcode', name: '二维码生成', short: 'QR', desc: '文本 / URL → 二维码', path: '/tools/qrcode' },
]
