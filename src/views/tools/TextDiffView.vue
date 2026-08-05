<script setup lang="ts">
import { computed, ref } from 'vue'
import { diffLines, type Change } from 'diff'
import ToolShell from '@/components/ToolShell.vue'
import CopyButton from '@/components/CopyButton.vue'

const original = ref('')
const changed = ref('')
const parts = ref<Change[]>([])

interface DiffLine {
  mark: string
  text: string
  cls: 'diff-add' | 'diff-rem' | 'diff-ctx'
}

const lines = computed<DiffLine[]>(() => {
  const out: DiffLine[] = []
  for (const p of parts.value) {
    const cls = p.added ? 'diff-add' : p.removed ? 'diff-rem' : 'diff-ctx'
    const mark = p.added ? '+' : p.removed ? '-' : ' '
    for (const l of p.value.replace(/\n$/, '').split('\n')) {
      out.push({ mark, text: l, cls })
    }
  }
  return out
})

const outputText = computed(() =>
  lines.value.map((l) => `${l.mark} ${l.text}`).join('\n'),
)

function run() {
  parts.value = diffLines(original.value, changed.value)
}
</script>

<template>
  <ToolShell title="文本 Diff 对比">
    <div class="df-grid">
      <textarea
        v-model="original"
        class="input df-in"
        rows="8"
        spellcheck="false"
        placeholder="原文本"
      ></textarea>
      <textarea
        v-model="changed"
        class="input df-in"
        rows="8"
        spellcheck="false"
        placeholder="新文本"
      ></textarea>
    </div>
    <div class="df-actions">
      <button type="button" class="btn" @click="run">对比</button>
    </div>
    <div v-if="lines.length" class="df-out-wrap">
      <div class="df-out-head">
        <span class="df-out-label">差异</span>
        <CopyButton :text="outputText" />
      </div>
      <pre class="df-out"><span
  v-for="(ln, i) in lines"
  :key="i"
  :class="ln.cls"
>{{ ln.mark }} {{ ln.text }}</span></pre>
    </div>
  </ToolShell>
</template>

<style scoped>
.df-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
}
@media (max-width: 760px) {
  .df-grid {
    grid-template-columns: 1fr;
  }
}
.df-in {
  font-size: 13px;
}
.df-actions {
  margin: 12px 0;
}
.df-out-wrap {
  margin-top: 8px;
}
.df-out-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 8px;
}
.df-out-label {
  font-size: 12px;
  color: var(--color-text-muted);
}
.df-out {
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
.df-out span {
  display: block;
}
.diff-add {
  color: var(--color-accent);
}
.diff-rem {
  color: var(--color-accent-2);
}
.diff-ctx {
  color: var(--color-text-muted);
}
</style>
