<script setup lang="ts">
import { ref, watch } from 'vue'
import { md5 } from 'js-md5'
import ToolShell from '@/components/ToolShell.vue'
import CopyButton from '@/components/CopyButton.vue'

type Alg = 'md5' | 'sha1' | 'sha256' | 'sha384' | 'sha512'

const SHA_NAMES: Record<Exclude<Alg, 'md5'>, string> = {
  sha1: 'SHA-1',
  sha256: 'SHA-256',
  sha384: 'SHA-384',
  sha512: 'SHA-512',
}

const ALGORITHMS: { value: Alg; label: string }[] = [
  { value: 'md5', label: 'MD5' },
  { value: 'sha1', label: 'SHA-1' },
  { value: 'sha256', label: 'SHA-256' },
  { value: 'sha384', label: 'SHA-384' },
  { value: 'sha512', label: 'SHA-512' },
]

const input = ref('')
const alg = ref<Alg>('sha256')
const output = ref('')

async function compute() {
  const data = input.value
  if (!data) {
    output.value = ''
    return
  }
  if (alg.value === 'md5') {
    output.value = md5(data)
    return
  }
  const buf = await crypto.subtle.digest(
    SHA_NAMES[alg.value],
    new TextEncoder().encode(data),
  )
  output.value = Array.from(new Uint8Array(buf))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('')
}

watch([input, alg], compute, { immediate: true })
</script>

<template>
  <ToolShell title="Hash 生成器">
    <textarea
      v-model="input"
      class="input hs-in"
      rows="6"
      spellcheck="false"
      placeholder="输入要计算摘要的文本"
    ></textarea>
    <div class="hs-bar">
      <label class="hs-label" for="hs-alg">算法</label>
      <select id="hs-alg" v-model="alg" class="input hs-select">
        <option v-for="a in ALGORITHMS" :key="a.value" :value="a.value">{{ a.label }}</option>
      </select>
    </div>
    <div v-if="output" class="hs-out-wrap">
      <div class="hs-out-head">
        <span class="hs-out-label">摘要（hex）</span>
        <CopyButton :text="output" />
      </div>
      <pre class="hs-out">{{ output }}</pre>
    </div>
  </ToolShell>
</template>

<style scoped>
.hs-bar {
  display: flex;
  align-items: center;
  gap: 10px;
  margin: 12px 0;
}
.hs-label {
  font-size: 13px;
  color: var(--color-text-muted);
}
.hs-select {
  width: 180px;
  padding: 6px 10px;
  font-size: 13px;
}
.hs-out-wrap {
  margin-top: 8px;
}
.hs-out-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 8px;
}
.hs-out-label {
  font-size: 12px;
  color: var(--color-text-muted);
}
.hs-out {
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
