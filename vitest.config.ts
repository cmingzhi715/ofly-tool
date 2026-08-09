import { defineConfig } from 'vitest/config'

// 仅收集 src 下的 .test.ts，避免与 tests/e2e 的 Playwright 测试冲突
export default defineConfig({
  test: {
    include: ['src/**/*.test.ts'],
  },
})
