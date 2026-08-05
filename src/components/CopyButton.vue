<script setup lang="ts">
import { ref } from 'vue'

const props = defineProps<{ text: string }>()
const copied = ref(false)

async function copy() {
  if (!props.text) return
  await navigator.clipboard.writeText(props.text)
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
