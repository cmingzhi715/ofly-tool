<script setup lang="ts">
import { ref } from 'vue'

const props = defineProps<{ text: string }>()
const copied = ref(false)

async function copy() {
  if (!props.text) return
  try {
    await navigator.clipboard.writeText(props.text)
  } catch {
    // 降级：旧浏览器 / 非安全上下文，用 textarea 选中复制
    const ta = document.createElement('textarea')
    ta.value = props.text
    document.body.appendChild(ta)
    ta.select()
    try {
      document.execCommand('copy')
    } finally {
      ta.remove()
    }
  }
  copied.value = true
  setTimeout(() => (copied.value = false), 1500)
}
</script>

<template>
  <button
    type="button"
    class="btn btn-ghost copy-btn"
    :disabled="!text"
    @click="copy"
  >
    {{ copied ? '已复制' : '复制结果' }}
  </button>
</template>

<style scoped>
.copy-btn {
  font-size: 12px;
  padding: 6px 14px;
}
.copy-btn:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}
</style>
