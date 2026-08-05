<script setup lang="ts">
import { ref } from 'vue'
import ToolShell from '@/components/ToolShell.vue'
import CopyButton from '@/components/CopyButton.vue'

const input = ref('')
const output = ref('')

type Op = 'upper' | 'lower' | 'title' | 'lineno' | 'unique' | 'sort'

function run(op: Op) {
  const text = input.value
  if (!text) {
    output.value = ''
    return
  }
  switch (op) {
    case 'upper':
      output.value = text.toUpperCase()
      break
    case 'lower':
      output.value = text.toLowerCase()
      break
    case 'title':
      output.value = text.replace(/\b\w/g, (c) => c.toUpperCase())
      break
    case 'lineno':
      output.value = text.split('\n').map((l, i) => `${i + 1}\t${l}`).join('\n')
      break
    case 'unique':
      output.value = [...new Set(text.split('\n'))].join('\n')
      break
    case 'sort':
      output.value = text.split('\n').sort().join('\n')
      break
  }
}
</script>

<template>
  <ToolShell title="文本小工具">
    <textarea
      v-model="input"
      class="input tx-in"
      rows="8"
      spellcheck="false"
      placeholder="输入多行文本"
    ></textarea>
    <div class="tx-actions">
      <button type="button" class="btn" @click="run('upper')">转大写</button>
      <button type="button" class="btn btn-ghost" @click="run('lower')">转小写</button>
      <button type="button" class="btn btn-ghost" @click="run('title')">首字母大写</button>
      <button type="button" class="btn btn-ghost" @click="run('lineno')">添加行号</button>
      <button type="button" class="btn btn-ghost" @click="run('unique')">去重行</button>
      <button type="button" class="btn btn-ghost" @click="run('sort')">排序行</button>
    </div>
    <div v-if="output" class="tx-out-wrap">
      <div class="tx-out-head">
        <span class="tx-out-label">输出</span>
        <CopyButton :text="output" />
      </div>
      <pre class="tx-out">{{ output }}</pre>
    </div>
  </ToolShell>
</template>

<style scoped>
.tx-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  margin: 12px 0;
}
.tx-out-wrap {
  margin-top: 8px;
}
.tx-out-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 8px;
}
.tx-out-label {
  font-size: 12px;
  color: var(--color-text-muted);
}
.tx-out {
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
