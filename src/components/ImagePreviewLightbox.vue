<script setup lang="ts">
import { onBeforeUnmount, onMounted } from 'vue'

const props = defineProps<{
  url: string | null
  name: string
  index: number
  total: number
}>()
const emit = defineEmits<{ close: []; prev: []; next: [] }>()

function onKeydown(e: KeyboardEvent) {
  if (e.key === 'ArrowLeft') emit('prev')
  else if (e.key === 'ArrowRight') emit('next')
  else if (e.key === 'Escape') emit('close')
}

onMounted(() => {
  window.addEventListener('keydown', onKeydown)
  document.body.style.overflow = 'hidden'
})
onBeforeUnmount(() => {
  window.removeEventListener('keydown', onKeydown)
  document.body.style.overflow = ''
})
</script>

<template>
  <div class="ipl-backdrop" @click.self="emit('close')">
    <div class="ipl-card">
      <div class="ipl-head">
        <span class="ipl-title">{{ name }} · {{ index + 1 }} / {{ total }}</span>
        <button type="button" class="ipl-close" @click="emit('close')">✕</button>
      </div>
      <img v-if="url" class="ipl-img" :src="url" :alt="name" />
    </div>
    <button type="button" class="ipl-nav ipl-prev" @click="emit('prev')">‹</button>
    <button type="button" class="ipl-nav ipl-next" @click="emit('next')">›</button>
  </div>
</template>

<style scoped>
.ipl-backdrop {
  position: fixed;
  inset: 0;
  background: var(--overlay-ink);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}
.ipl-card {
  background: var(--color-surface-2);
  border: 1px solid var(--color-border);
  border-radius: var(--radius);
  padding: 12px;
  display: flex;
  flex-direction: column;
  gap: 10px;
  max-width: 92vw;
  max-height: 92vh;
}
.ipl-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
}
.ipl-title {
  font-family: var(--font-mono);
  font-size: 13px;
  color: var(--color-text-muted);
}
.ipl-close {
  border: 1px solid var(--color-border);
  background: var(--color-surface);
  color: var(--color-text);
  border-radius: var(--radius);
  width: 28px;
  height: 28px;
  cursor: pointer;
  font-size: 14px;
  line-height: 1;
}
.ipl-close:hover {
  color: var(--color-accent-2);
  border-color: var(--color-accent-2);
}
.ipl-img {
  max-width: 88vw;
  max-height: 82vh;
  object-fit: contain;
  border: 1px solid var(--color-border);
  border-radius: var(--radius);
}
.ipl-nav {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  border: 1px solid var(--color-border);
  background: var(--color-surface);
  color: var(--color-text);
  border-radius: var(--radius);
  width: 44px;
  height: 44px;
  font-size: 24px;
  line-height: 1;
  cursor: pointer;
}
.ipl-nav:hover {
  color: var(--color-accent-2);
  border-color: var(--color-accent-2);
}
.ipl-prev { left: 12px; }
.ipl-next { right: 12px; }
</style>
