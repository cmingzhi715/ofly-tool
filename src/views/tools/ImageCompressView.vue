<script setup lang="ts">
import { computed, onUnmounted, ref } from 'vue'
import ToolShell from '@/components/ToolShell.vue'
import { finalizeOutName, findDuplicateNames } from '@/utils/image-name'

type Format = 'jpeg' | 'webp' | 'png'

const MIME: Record<Format, string> = {
  jpeg: 'image/jpeg',
  webp: 'image/webp',
  png: 'image/png',
}
const EXT: Record<Format, string> = { jpeg: 'jpg', webp: 'webp', png: 'png' }

const format = ref<Format>('jpeg')
const quality = ref(0.8)
const maxWidth = ref(0)

// 单文件状态
const singleFile = ref<File | null>(null)
const singleOrig = ref('')
const singleOutUrl = ref('')
const singleInfo = ref('')
const keptOriginal = ref(false)
const error = ref('')

// 文件夹批量状态（showDirectoryPicker 为全局函数声明，非 Window 方法）
const fsSupported = typeof showDirectoryPicker === 'function'
const dirHandle = ref<FileSystemDirectoryHandle | null>(null)
const folderName = ref('')
interface BatchItem {
  name: string
  file: File
  thumbUrl: string | null
}
const items = ref<BatchItem[]>([])
const progress = ref({ done: 0, total: 0 })
const doneInfo = ref('')

interface BatchResult {
  name: string
  origKb: string
  newKb: string
  pct: string
  bigger: boolean
}
const results = ref<BatchResult[]>([])
// 批量输出名（与 items 对齐，可编辑）与校验失败的行索引
const outNames = ref<string[]>([])
const invalidRows = ref<number[]>([])

async function decodeImage(file: File): Promise<HTMLImageElement> {
  const url = URL.createObjectURL(file)
  try {
    return await new Promise<HTMLImageElement>((resolve, reject) => {
      const img = new Image()
      img.onload = () => resolve(img)
      img.onerror = () => reject(new Error('图片解码失败'))
      img.src = url
    })
  } finally {
    URL.revokeObjectURL(url)
  }
}

async function convertImage(file: File): Promise<Blob> {
  const img = await decodeImage(file)
  const scale =
    maxWidth.value > 0 && img.naturalWidth > maxWidth.value
      ? maxWidth.value / img.naturalWidth
      : 1
  const w = Math.max(1, Math.round(img.naturalWidth * scale))
  const h = Math.max(1, Math.round(img.naturalHeight * scale))
  const canvas = document.createElement('canvas')
  canvas.width = w
  canvas.height = h
  const ctx = canvas.getContext('2d')
  if (!ctx) throw new Error('浏览器不支持 canvas')
  if (format.value === 'jpeg') {
    ctx.fillStyle = '#fff'
    ctx.fillRect(0, 0, w, h)
  }
  ctx.drawImage(img, 0, 0, w, h)
  if (format.value === 'png') return quantizePng(ctx, w, h)
  const blob = await new Promise<Blob | null>((resolve) =>
    canvas.toBlob(resolve, MIME[format.value], quality.value),
  )
  if (!blob) throw new Error('转换失败')
  return blob
}

// PNG 有损压缩（libimagequant wasm，仅在 PNG 输出时按需加载）
async function quantizePng(ctx: CanvasRenderingContext2D, w: number, h: number): Promise<Blob> {
  const { ImagequantImage, Imagequant } = await import('imagequant')
  const imageData = ctx.getImageData(0, 0, w, h)
  const px = new Uint8Array(imageData.data.buffer, imageData.data.byteOffset, imageData.data.byteLength)
  const image = new ImagequantImage(px, w, h, 0)
  const instance = new Imagequant()
  // 质量滑块 0.1~1 → libimagequant 0~100
  instance.set_quality(0, Math.round(quality.value * 100))
  const output = instance.process(image)
  const png = new Uint8Array(output)
  return new Blob([png], { type: 'image/png' })
}

const outExt = computed(() => EXT[format.value])

function outName(base: string): string {
  return base.replace(/\.[^.]+$/, '') + '.' + outExt.value
}

// ---- 单文件 ----
async function onSingleFile(e: Event) {
  const f = (e.target as HTMLInputElement).files?.[0]
  if (!f) return
  error.value = ''
  singleOutUrl.value = ''
  singleInfo.value = ''
  singleFile.value = f
  try {
    const img = await decodeImage(f)
    singleOrig.value = `${f.name} · ${(f.size / 1024).toFixed(1)} KB · ${img.naturalWidth}×${img.naturalHeight}`
  } catch (err) {
    error.value = err instanceof Error ? err.message : '图片解码失败'
  }
}

async function compressSingle() {
  const f = singleFile.value
  if (!f) {
    error.value = '请先选择图片'
    return
  }
  error.value = ''
  try {
    const blob = await convertImage(f)
    keptOriginal.value = blob.size >= f.size
    if (singleOutUrl.value) URL.revokeObjectURL(singleOutUrl.value)
    if (keptOriginal.value) {
      singleOutUrl.value = URL.createObjectURL(f)
      const grow = (((blob.size - f.size) / f.size) * 100).toFixed(0)
      singleInfo.value = `未压缩，已保留原图（重编码将 +${grow}%）· 原 ${(f.size / 1024).toFixed(1)} KB`
    } else {
      singleOutUrl.value = URL.createObjectURL(blob)
      const change = (((blob.size - f.size) / f.size) * 100).toFixed(0)
      singleInfo.value = `原 ${(f.size / 1024).toFixed(1)} KB → ${(blob.size / 1024).toFixed(1)} KB（${change}%）`
    }
  } catch (err) {
    error.value = err instanceof Error ? err.message : '压缩失败'
  }
}

function downloadSingle() {
  if (!singleOutUrl.value || !singleFile.value) return
  const a = document.createElement('a')
  a.href = singleOutUrl.value
  a.download = keptOriginal.value ? singleFile.value.name : outName(singleFile.value.name)
  a.click()
}

// ---- 文件夹批量 ----
async function pickFolder() {
  if (!fsSupported) {
    error.value = '当前浏览器不支持文件夹写入（需 Chrome/Edge），请用单文件模式'
    return
  }
  try {
    const dir = await showDirectoryPicker()
    dirHandle.value = dir
    folderName.value = dir.name
    await loadFromDir(dir)
  } catch (err) {
    if ((err as Error).name === 'AbortError') return
    error.value = '无法读取文件夹'
  }
}

async function loadFromDir(dir: FileSystemDirectoryHandle) {
  for (const it of items.value) if (it.thumbUrl) URL.revokeObjectURL(it.thumbUrl)
  items.value = []
  outNames.value = []
  invalidRows.value = []
  doneInfo.value = ''
  const isImg = /\.(png|jpe?g|webp|gif|bmp|avif)$/i
  for await (const [, handle] of dir.entries()) {
    if (handle.kind !== 'file') continue
    if (!isImg.test(handle.name)) continue
    const file = await handle.getFile()
    items.value.push({ name: handle.name, file, thumbUrl: null })
    outNames.value.push(outName(handle.name))
  }
}

async function runBatch() {
  if (!dirHandle.value || items.value.length === 0) {
    error.value = '请先选择文件夹'
    return
  }
  error.value = ''
  doneInfo.value = ''
  results.value = []
  // 转换前统一规范化输出名，重名则中止
  const finalNames = items.value.map((it, i) =>
    finalizeOutName(outNames.value[i] ?? '', it.name, outExt.value),
  )
  const dups = findDuplicateNames(finalNames)
  if (dups.length) {
    const dupSet = new Set(dups)
    invalidRows.value = finalNames
      .map((n, i) => (dupSet.has(n) ? i : -1))
      .filter((i) => i >= 0)
    error.value = `输出名重复：${dups.join('、')}`
    return
  }
  invalidRows.value = []
  const coveredName = `${folderName.value}_covered`
  let covered: FileSystemDirectoryHandle
  try {
    covered = await dirHandle.value.getDirectoryHandle(coveredName, { create: true })
  } catch {
    error.value = '无法创建输出文件夹'
    return
  }
  progress.value = { done: 0, total: items.value.length }
  let ok = 0
  let fail = 0
  for (const [i, item] of items.value.entries()) {
    const origKb = (item.file.size / 1024).toFixed(1)
    const finalName = finalNames[i]!
    const userOut = outNames.value[i] ?? ''
    try {
      const blob = await convertImage(item.file)
      // 兜底：结果不比原图小就保留原文件，绝不写出更大的文件
      if (blob.size >= item.file.size) {
        const origExt = item.name.slice(item.name.lastIndexOf('.') + 1)
        const fallbackName = finalizeOutName(userOut, item.name, origExt)
        const fh = await covered.getFileHandle(fallbackName, { create: true })
        const w = await fh.createWritable()
        await w.write(item.file)
        await w.close()
        const grow = (((blob.size - item.file.size) / item.file.size) * 100).toFixed(0)
        results.value.push({
          name: fallbackName,
          origKb,
          newKb: (item.file.size / 1024).toFixed(1),
          pct: `保留原图（+${grow}%）`,
          bigger: true,
        })
      } else {
        const fh = await covered.getFileHandle(finalName, { create: true })
        const w = await fh.createWritable()
        await w.write(blob)
        await w.close()
        const change = ((blob.size - item.file.size) / item.file.size) * 100
        results.value.push({
          name: finalName,
          origKb,
          newKb: (blob.size / 1024).toFixed(1),
          pct: `${change >= 0 ? '+' : ''}${change.toFixed(0)}%`,
          bigger: change > 0,
        })
      }
      ok++
    } catch {
      results.value.push({ name: finalName, origKb, newKb: '失败', pct: '—', bigger: false })
      fail++
    }
    progress.value.done++
  }
  doneInfo.value = `成功 ${ok}，失败 ${fail}，已写入 ${coveredName}/`
}

// 组件卸载：释放所有缩略图 objectURL，断开懒加载观察
onUnmounted(() => {
  for (const it of items.value) if (it.thumbUrl) URL.revokeObjectURL(it.thumbUrl)
})
</script>

<template>
  <ToolShell title="图片压缩 / 格式转换">
    <div class="ic-opts">
      <label class="ic-opt">
        <span>输出格式</span>
        <select v-model="format" class="input ic-format">
          <option value="jpeg">JPEG</option>
          <option value="webp">WebP</option>
          <option value="png">PNG</option>
        </select>
      </label>
      <label class="ic-opt">
        <span>质量（{{ Math.round(quality * 100) }}%）</span>
        <input
          v-model.number="quality"
          type="range"
          min="0.1"
          max="1"
          step="0.05"
          class="ic-quality"
        />
      </label>
      <label class="ic-opt">
        <span>最大宽度（0 = 不缩放）</span>
        <input v-model.number="maxWidth" type="number" min="0" class="input ic-maxwidth" placeholder="不缩放" />
      </label>
    </div>

    <div class="ic-mode">
      <h3 class="ic-mode-title">单文件</h3>
      <input type="file" accept="image/*" class="input ic-single" @change="onSingleFile" />
      <p v-if="singleOrig" class="ic-origin">{{ singleOrig }}</p>
      <div class="ic-actions">
        <button type="button" class="btn ic-single-run" @click="compressSingle">压缩 / 转换</button>
      </div>
      <div v-if="singleOutUrl" class="ic-out">
        <div class="ic-out-head">
          <span class="ic-out-label" :class="{ 'ic-kept': keptOriginal }">{{ singleInfo }}</span>
          <button type="button" class="btn btn-ghost" @click="downloadSingle">下载</button>
        </div>
        <img class="ic-preview" :src="singleOutUrl" alt="压缩结果" />
      </div>
    </div>

    <div class="ic-mode">
      <h3 class="ic-mode-title">文件夹批量</h3>
      <p v-if="!fsSupported" class="ic-warn">
        当前浏览器不支持自动写入文件夹（仅 Chrome / Edge 支持），此模式不可用，请用单文件模式。
      </p>
      <div class="ic-actions">
        <button type="button" class="btn btn-ghost ic-pick" :disabled="!fsSupported" @click="pickFolder">
          选择文件夹
        </button>
      </div>
      <p v-if="folderName" class="ic-origin">已选：{{ folderName }}（{{ items.length }} 个图片）</p>
      <ul v-if="items.length" class="ic-list">
        <li
          v-for="(it, i) in items"
          :key="it.name"
          class="ic-item-row"
          :class="{ 'ic-invalid': invalidRows.includes(i) }"
        >
          <span class="ic-item">{{ it.name }}</span>
          <input
            v-model="outNames[i]"
            class="input ic-outname"
            :placeholder="outName(it.name)"
          />
        </li>
      </ul>
      <div class="ic-actions">
        <button type="button" class="btn ic-batch-run" :disabled="!items.length" @click="runBatch">
          开始转换
        </button>
      </div>
      <p v-if="progress.total" class="ic-progress">进度：{{ progress.done }} / {{ progress.total }}</p>
      <p v-if="doneInfo" class="ic-done">{{ doneInfo }}</p>
      <table v-if="results.length" class="ic-table">
        <thead>
          <tr>
            <th>文件</th>
            <th>原大小</th>
            <th>转换后</th>
            <th>变化</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="r in results" :key="r.name">
            <td class="ic-t-name">{{ r.name }}</td>
            <td>{{ r.origKb }} KB</td>
            <td>{{ r.newKb === '失败' ? '失败' : r.newKb + ' KB' }}</td>
            <td :class="r.bigger ? 'ic-grow' : 'ic-save'">{{ r.pct }}</td>
          </tr>
        </tbody>
      </table>
    </div>

    <p v-if="error" class="ic-error">{{ error }}</p>
  </ToolShell>
</template>

<style scoped>
.ic-opts {
  display: flex;
  flex-wrap: wrap;
  gap: 18px;
  margin-bottom: 16px;
}
.ic-opt {
  display: flex;
  flex-direction: column;
  gap: 6px;
  font-size: 13px;
  color: var(--color-text-muted);
}
.ic-format {
  width: 160px;
  padding: 6px 10px;
}
.ic-quality {
  width: 200px;
  accent-color: var(--color-accent);
}
.ic-quality:disabled {
  opacity: 0.4;
}
.ic-maxwidth {
  width: 160px;
  padding: 6px 10px;
}
.ic-mode {
  border-top: 1px solid var(--color-border);
  padding-top: 14px;
  margin-bottom: 18px;
}
.ic-mode-title {
  font-size: 14px;
  color: var(--color-text-muted);
  margin-bottom: 10px;
}
.ic-single {
  padding: 8px 12px;
  font-size: 13px;
}
.ic-origin {
  margin-top: 8px;
  font-size: 13px;
  color: var(--color-text-muted);
  font-family: var(--font-mono);
}
.ic-actions {
  margin: 12px 0;
}
.ic-warn {
  color: var(--color-accent-2);
  font-size: 13px;
  margin-bottom: 10px;
}
.ic-list {
  max-height: 200px;
  overflow: auto;
  border: 1px solid var(--color-border);
  border-radius: var(--radius);
  background: var(--color-surface-2);
  padding: 8px 12px;
  margin-bottom: 12px;
}
.ic-item {
  font-family: var(--font-mono);
  font-size: 12px;
  color: var(--color-text);
  line-height: 1.8;
}
.ic-item-row {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 4px 0;
}
.ic-item-row .ic-item {
  flex: 1;
  min-width: 0;
}
.ic-outname {
  flex: 0 0 240px;
  padding: 4px 8px;
  font-size: 12px;
  font-family: var(--font-mono);
}
.ic-invalid {
  outline: 1px solid var(--color-accent-2);
  border-radius: var(--radius);
}
.ic-progress {
  font-size: 13px;
  color: var(--color-accent);
  font-family: var(--font-mono);
}
.ic-done {
  font-size: 13px;
  color: var(--color-accent);
  font-family: var(--font-mono);
}
.ic-table {
  width: 100%;
  margin-top: 10px;
  border-collapse: collapse;
  font-family: var(--font-mono);
  font-size: 12px;
}
.ic-table th,
.ic-table td {
  border: 1px solid var(--color-border);
  padding: 6px 10px;
  text-align: left;
}
.ic-table th {
  color: var(--color-text-muted);
  font-weight: 400;
}
.ic-t-name {
  word-break: break-all;
}
.ic-save {
  color: var(--color-accent);
}
.ic-grow {
  color: var(--color-accent-2);
}
.ic-error {
  color: var(--color-accent-2);
  font-size: 13px;
  font-family: var(--font-mono);
}
.ic-out {
  margin-top: 6px;
}
.ic-out-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 10px;
}
.ic-out-label {
  font-size: 13px;
  color: var(--color-text-muted);
  font-family: var(--font-mono);
}
.ic-kept {
  color: var(--color-accent-2);
}
.ic-preview {
  max-width: 100%;
  max-height: 360px;
  border: 1px solid var(--color-border);
  border-radius: var(--radius);
  background: var(--color-surface-2);
}
</style>
