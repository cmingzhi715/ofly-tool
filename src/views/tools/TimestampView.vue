<script setup lang="ts">
import { ref } from 'vue'
import ToolShell from '@/components/ToolShell.vue'

const tsInput = ref('')
const unit = ref<'s' | 'ms'>('s')
const tsResult = ref('')

const dtInput = ref('')
const dtResult = ref('')

const pad = (n: number) => String(n).padStart(2, '0')

function formatLocal(d: Date): string {
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`
}

function tsToDate() {
  const raw = tsInput.value.trim()
  if (!raw) {
    tsResult.value = ''
    return
  }
  const v = Number(raw)
  if (!Number.isFinite(v)) {
    tsResult.value = '请输入有效的时间戳数字'
    return
  }
  const d = new Date(unit.value === 's' ? v * 1000 : v)
  if (Number.isNaN(d.getTime())) {
    tsResult.value = '超出可表示的时间范围'
    return
  }
  tsResult.value = `本地时间：${formatLocal(d)}\nUTC：${d.toISOString().replace('T', ' ').slice(0, 19)} UTC`
}

function dtToTs() {
  if (!dtInput.value) {
    dtResult.value = ''
    return
  }
  const d = new Date(dtInput.value)
  if (Number.isNaN(d.getTime())) {
    dtResult.value = '无效的日期时间'
    return
  }
  dtResult.value = `秒：${Math.floor(d.getTime() / 1000)}\n毫秒：${d.getTime()}`
}

function useNow() {
  const now = new Date()
  dtInput.value = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}T${pad(now.getHours())}:${pad(now.getMinutes())}`
  dtToTs()
}
</script>

<template>
  <ToolShell title="时间戳转换">
    <div class="ts-panel">
      <h3 class="ts-sec-title">时间戳 → 日期时间</h3>
      <div class="ts-row">
        <input v-model="tsInput" type="text" class="input ts-in" placeholder="例如 1700000000" />
        <select v-model="unit" class="input ts-unit">
          <option value="s">秒</option>
          <option value="ms">毫秒</option>
        </select>
        <button type="button" class="btn" @click="tsToDate">转换</button>
      </div>
      <pre v-if="tsResult" class="ts-result">{{ tsResult }}</pre>
    </div>

    <div class="ts-panel">
      <h3 class="ts-sec-title">日期时间 → 时间戳</h3>
      <div class="ts-row">
        <input v-model="dtInput" type="datetime-local" class="input ts-dt" />
        <button type="button" class="btn" @click="dtToTs">转换</button>
        <button type="button" class="btn btn-ghost" @click="useNow">使用当前时间</button>
      </div>
      <pre v-if="dtResult" class="ts-result">{{ dtResult }}</pre>
    </div>
  </ToolShell>
</template>

<style scoped>
.ts-panel + .ts-panel {
  margin-top: 20px;
}
.ts-sec-title {
  font-size: 14px;
  color: var(--color-text-muted);
  margin-bottom: 10px;
}
.ts-row {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}
.ts-in {
  flex: 1;
  min-width: 200px;
  padding: 8px 12px;
}
.ts-unit {
  width: 90px;
  padding: 8px 10px;
}
.ts-dt {
  flex: 1;
  min-width: 220px;
  padding: 8px 12px;
}
.ts-result {
  margin-top: 10px;
  background: var(--color-surface-2);
  border: 1px solid var(--color-border);
  border-radius: var(--radius);
  padding: 12px 14px;
  font-family: var(--font-mono);
  font-size: 13px;
  line-height: 1.8;
  white-space: pre-wrap;
}
</style>
