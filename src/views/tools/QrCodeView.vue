<script setup lang="ts">
import { ref, watch } from 'vue'
import QRCode from 'qrcode'
import ToolShell from '@/components/ToolShell.vue'

const text = ref('')
const dataUrl = ref('')
const error = ref('')

async function generate() {
  error.value = ''
  const raw = text.value.trim()
  if (!raw) {
    dataUrl.value = ''
    return
  }
  try {
    dataUrl.value = await QRCode.toDataURL(raw, { width: 240, margin: 1 })
  } catch {
    error.value = '内容过长，无法生成二维码'
    dataUrl.value = ''
  }
}

watch(text, generate, { immediate: true })

function download() {
  if (!dataUrl.value) return
  const a = document.createElement('a')
  a.href = dataUrl.value
  a.download = 'qrcode.png'
  a.click()
}
</script>

<template>
  <ToolShell title="二维码生成">
    <textarea
      v-model="text"
      class="input qr-in"
      rows="5"
      spellcheck="false"
      placeholder="输入文本或 URL"
    ></textarea>
    <p v-if="error" class="qr-error">{{ error }}</p>
    <div v-if="dataUrl" class="qr-out">
      <img class="qr-img" :src="dataUrl" alt="二维码" />
      <button type="button" class="btn btn-ghost qr-dl" @click="download">下载 PNG</button>
    </div>
  </ToolShell>
</template>

<style scoped>
.qr-error {
  color: var(--color-accent-2);
  font-size: 13px;
  font-family: var(--font-mono);
  margin-top: 8px;
}
.qr-out {
  margin-top: 14px;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 12px;
}
.qr-img {
  background: #fff;
  padding: 8px;
  border-radius: var(--radius);
  border: 1px solid var(--color-border);
  width: 240px;
  height: 240px;
  image-rendering: pixelated;
}
</style>
