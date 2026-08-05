<script setup lang="ts">
import { ref } from 'vue'
import ToolShell from '@/components/ToolShell.vue'
import CopyButton from '@/components/CopyButton.vue'

const input = ref('')
const output = ref('')
const error = ref('')

function run(mode: 'encode' | 'decode') {
  error.value = ''
  output.value = ''
  const raw = input.value.trim()
  if (!raw) return
  try {
    output.value = mode === 'encode' ? encodeURIComponent(raw) : decodeURIComponent(raw)
  } catch {
    error.value = mode === 'decode' ? '包含无效的百分号编码' : '编码失败'
  }
}
</script>

<template>
  <ToolShell title="URL 编码 / 解码">
    <textarea
      v-model="input"
      class="input url-in"
      rows="6"
      spellcheck="false"
      placeholder="输入要编码/解码的文本"
    ></textarea>
    <div class="url-actions">
      <button type="button" class="btn" @click="run('encode')">编码</button>
      <button type="button" class="btn btn-ghost" @click="run('decode')">解码</button>
    </div>
    <p v-if="error" class="url-error">{{ error }}</p>
    <div v-if="output" class="url-out-wrap">
      <div class="url-out-head">
        <span class="url-out-label">输出</span>
        <CopyButton :text="output" />
      </div>
      <pre class="url-out">{{ output }}</pre>
    </div>
  </ToolShell>
</template>

<style scoped>
.url-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  margin: 12px 0;
}
.url-error {
  color: var(--color-accent-2);
  font-size: 13px;
  font-family: var(--font-mono);
}
.url-out-wrap {
  margin-top: 8px;
}
.url-out-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 8px;
}
.url-out-label {
  font-size: 12px;
  color: var(--color-text-muted);
}
.url-out {
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
