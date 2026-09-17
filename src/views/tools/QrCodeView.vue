<script setup lang="ts">
import { ref, watch } from 'vue'
import QRCode from 'qrcode'
import ToolShell from '@/components/ToolShell.vue'
import CopyButton from '@/components/CopyButton.vue'
import { decodeQrFromFile } from '@/utils/qr-decode'

/* ───────── 生成 ───────── */
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

/* ───────── 转换（解码） ───────── */
const decodeResult = ref('')
const decodeError = ref('')
const previewSrc = ref('')
const decoding = ref(false)
const dragging = ref(false)
const fileInput = ref<HTMLInputElement | null>(null)

async function decodeFile(file: File | undefined) {
  if (!file) return
  if (!file.type.startsWith('image/')) {
    resetDecode()
    decodeError.value = '请提供图片文件'
    return
  }
  resetDecode()
  previewSrc.value = URL.createObjectURL(file)
  decoding.value = true
  try {
    const out = await decodeQrFromFile(file)
    if (out == null) {
      decodeError.value = '未识别到二维码，换个更清晰、方正的图试试'
    } else {
      decodeResult.value = out
    }
  } catch {
    decodeError.value = '解码失败，换个更清晰、方正的图试试'
  } finally {
    decoding.value = false
  }
}

function resetDecode() {
  if (previewSrc.value) URL.revokeObjectURL(previewSrc.value)
  previewSrc.value = ''
  decodeResult.value = ''
  decodeError.value = ''
}

function onPaste(e: ClipboardEvent) {
  const item = Array.from(e.clipboardData?.items ?? []).find((i) => i.type.startsWith('image/'))
  const file = item?.getAsFile()
  if (file) {
    e.preventDefault()
    decodeFile(file)
  }
}

function onDrop(e: DragEvent) {
  dragging.value = false
  const file = e.dataTransfer?.files?.[0]
  if (file) {
    e.preventDefault()
    decodeFile(file)
  }
}

function onPick(e: Event) {
  const file = (e.target as HTMLInputElement).files?.[0]
  decodeFile(file)
  // 允许重复选同一文件
  ;(e.target as HTMLInputElement).value = ''
}
</script>

<template>
  <ToolShell title="二维码">
    <!-- 生成 -->
    <section class="block">
      <h3 class="block-title">生成</h3>
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
    </section>

    <!-- 转换 -->
    <section
      class="block decode-zone"
      :class="{ dragging }"
      tabindex="0"
      @paste="onPaste"
      @dragover.prevent="dragging = true"
      @dragleave.prevent="dragging = false"
      @drop.prevent="onDrop"
    >
      <h3 class="block-title">转换</h3>
      <p class="zone-hint">黏贴二维码图片（Ctrl/Cmd + V）、拖拽进来，或选择文件</p>
      <input
        ref="fileInput"
        type="file"
        accept="image/*"
        class="hidden-file"
        @change="onPick"
      />
      <div class="decode-actions">
        <button type="button" class="btn" @click="fileInput?.click()">选择图片</button>
        <button v-if="previewSrc" type="button" class="btn btn-ghost" @click="resetDecode">清空</button>
      </div>

      <div v-if="previewSrc" class="decode-preview">
        <img class="decode-img" :src="previewSrc" alt="待解码图片" />
        <span v-if="decoding" class="decode-state">识别中…</span>
      </div>

      <p v-if="decodeError" class="qr-error">{{ decodeError }}</p>

      <div v-if="decodeResult" class="decode-out">
        <pre class="input decode-text">{{ decodeResult }}</pre>
        <CopyButton :text="decodeResult" />
      </div>
    </section>
  </ToolShell>
</template>

<style scoped>
.block {
  margin-top: 18px;
}
.block:first-child {
  margin-top: 0;
}
.block-title {
  font-size: 14px;
  font-weight: 600;
  color: var(--color-accent);
  margin-bottom: 10px;
}
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

.decode-zone {
  border: 1px dashed var(--color-border);
  border-radius: var(--radius);
  padding: 16px 18px;
  outline: none;
  background: var(--color-surface-2);
}
.decode-zone.dragging {
  border-color: var(--color-accent);
  box-shadow: 0 0 0 1px var(--color-accent);
}
.zone-hint {
  color: var(--color-text-muted);
  font-size: 13px;
  margin-bottom: 12px;
}
.hidden-file {
  display: none;
}
.decode-actions {
  display: flex;
  gap: 10px;
}
.decode-preview {
  margin-top: 14px;
  display: flex;
  align-items: center;
  gap: 14px;
}
.decode-img {
  background: #fff;
  padding: 6px;
  border-radius: var(--radius);
  border: 1px solid var(--color-border);
  max-width: 200px;
  max-height: 200px;
  object-fit: contain;
  image-rendering: pixelated;
}
.decode-state {
  color: var(--color-text-muted);
  font-family: var(--font-mono);
  font-size: 13px;
}
.decode-out {
  margin-top: 14px;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 10px;
}
.decode-text {
  white-space: pre-wrap;
  word-break: break-all;
  margin: 0;
}
</style>
