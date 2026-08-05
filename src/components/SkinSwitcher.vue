<script setup lang="ts">
import { useSkinStore } from '@/stores/skin'

const skin = useSkinStore()
</script>

<template>
  <button type="button" class="skin-switch" @click="skin.toggle()">
    <span class="ss-dot" aria-hidden="true"></span>
    {{ skin.skin === 'neon' ? '霓虹' : '复古 CRT' }}
  </button>
</template>

<style scoped>
.skin-switch {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  background: var(--color-surface);
  color: var(--color-accent);
  border: 1px solid var(--color-border);
  border-radius: var(--radius);
  padding: 6px 12px;
  font-size: 12px;
  letter-spacing: 0.08em;
  cursor: pointer;
}
.skin-switch:hover {
  color: var(--color-accent-2);
  box-shadow: 0 0 12px var(--glow-accent);
}
.ss-dot {
  width: 7px;
  height: 7px;
  border-radius: 50%;
  background: var(--color-accent);
  box-shadow: 0 0 8px var(--glow-accent);
}
</style>
