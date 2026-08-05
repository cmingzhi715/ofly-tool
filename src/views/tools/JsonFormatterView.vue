<script setup lang="ts">
import { computed, ref } from 'vue'
import Prism from 'prismjs'
import 'prismjs/components/prism-json'
import ToolShell from '@/components/ToolShell.vue'
import CopyButton from '@/components/CopyButton.vue'

const input = ref('')
const output = ref('')
const status = ref('')
const error = ref('')

const outputHtml = computed(() =>
  output.value ? Prism.highlight(output.value, Prism.languages.json!, 'json') : '',
)

function run(mode: 'pretty' | 'minify' | 'validate') {
  error.value = ''
  status.value = ''
  output.value = ''
  const raw = input.value.trim()
  if (!raw) return
  let parsed: unknown
  try {
    parsed = JSON.parse(raw)
  } catch (e) {
    error.value = e instanceof Error ? e.message : 'JSON 解析失败'
    return
  }
  if (mode === 'validate') {
    status.value = 'JSON 有效'
    return
  }
  output.value = JSON.stringify(parsed, null, mode === 'pretty' ? 2 : 0)
}
</script>

<template>
  <ToolShell title="JSON 格式化">
    <textarea
      v-model="input"
      class="input js-in"
      rows="10"
      spellcheck="false"
      placeholder='{"name":"ofly","online":true}'
    ></textarea>
    <div class="js-actions">
      <button type="button" class="btn" @click="run('pretty')">格式化 JSON</button>
      <button type="button" class="btn btn-ghost" @click="run('validate')">校验 JSON</button>
      <button type="button" class="btn btn-ghost" @click="run('minify')">压缩 JSON</button>
    </div>
    <p v-if="error" class="js-error">解析失败：{{ error }}</p>
    <p v-if="status" class="js-status">✓ {{ status }}</p>
    <div v-if="output" class="js-out-wrap">
      <div class="js-out-head">
        <span class="js-out-label">输出</span>
        <CopyButton :text="output" />
      </div>
      <pre class="js-out"><code v-html="outputHtml"></code></pre>
    </div>
  </ToolShell>
</template>

<style scoped>
.js-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  margin: 12px 0;
}
.js-error {
  color: var(--color-accent-2);
  background: var(--color-surface-2);
  border: 1px solid var(--color-border);
  border-radius: var(--radius);
  padding: 10px 14px;
  font-family: var(--font-mono);
  font-size: 13px;
}
.js-status {
  color: var(--color-accent);
  font-size: 13px;
  font-family: var(--font-mono);
}
.js-out-wrap {
  margin-top: 14px;
}
.js-out-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 8px;
}
.js-out-label {
  font-size: 12px;
  color: var(--color-text-muted);
}
.js-out {
  background: var(--color-surface-2);
  border: 1px solid var(--color-border);
  border-radius: var(--radius);
  padding: 14px;
  overflow: auto;
  max-height: 420px;
  font-family: var(--font-mono);
  font-size: 13px;
  line-height: 1.7;
}
</style>
