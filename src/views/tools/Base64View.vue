<script setup lang="ts">
import { ref } from 'vue'
import ToolShell from '@/components/ToolShell.vue'
import CopyButton from '@/components/CopyButton.vue'

const input = ref('')
const output = ref('')
const error = ref('')

function toBase64(s: string): string {
  const bytes = new TextEncoder().encode(s)
  let bin = ''
  for (const b of bytes) bin += String.fromCharCode(b)
  return btoa(bin)
}

function fromBase64(s: string): string {
  const bin = atob(s)
  const bytes = new Uint8Array(bin.length)
  for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i)
  return new TextDecoder('utf-8').decode(bytes)
}

function run(mode: 'encode' | 'decode') {
  error.value = ''
  output.value = ''
  const raw = input.value.trim()
  if (!raw) return
  try {
    output.value = mode === 'encode' ? toBase64(raw) : fromBase64(raw)
  } catch {
    error.value = mode === 'decode' ? '不是有效的 Base64 文本' : '转换失败'
  }
}
</script>

<template>
  <ToolShell title="Base64 编解码">
    <textarea
      v-model="input"
      class="input b64-in"
      rows="6"
      spellcheck="false"
      placeholder="输入文本或 Base64"
    ></textarea>
    <div class="b64-actions">
      <button type="button" class="btn" @click="run('encode')">编码为 Base64</button>
      <button type="button" class="btn btn-ghost" @click="run('decode')">从 Base64 解码</button>
    </div>
    <p v-if="error" class="b64-error">{{ error }}</p>
    <div v-if="output" class="b64-out-wrap">
      <div class="b64-out-head">
        <span class="b64-out-label">输出</span>
        <CopyButton :text="output" />
      </div>
      <pre class="b64-out">{{ output }}</pre>
    </div>
  </ToolShell>
</template>

<style scoped>
.b64-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  margin: 12px 0;
}
.b64-error {
  color: var(--color-accent-2);
  font-size: 13px;
  font-family: var(--font-mono);
}
.b64-out-wrap {
  margin-top: 8px;
}
.b64-out-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 8px;
}
.b64-out-label {
  font-size: 12px;
  color: var(--color-text-muted);
}
.b64-out {
  background: var(--color-surface-2);
  border: 1px solid var(--color-border);
  border-radius: var(--radius);
  padding: 14px;
  overflow: auto;
  word-break: break-all;
  font-family: var(--font-mono);
  font-size: 13px;
  line-height: 1.7;
}
</style>
