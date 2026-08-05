<script setup lang="ts">
defineProps<{ title: string; note: string }>()
</script>

<template>
  <section class="panel placeholder">
    <h2 class="ph-title">{{ title }}</h2>
    <p class="ph-note">{{ note }}</p>
    <p class="ph-hint">功能待实现，将在此展示具体界面。</p>
  </section>
</template>

<style scoped>
.placeholder {
  padding: 20px 22px;
  min-height: 260px;
}
.ph-title {
  font-size: 18px;
  margin-bottom: 6px;
  color: var(--color-accent);
}
.ph-note {
  color: var(--color-text);
  font-size: 14px;
  margin-bottom: 8px;
}
.ph-hint {
  color: var(--color-text-muted);
  font-size: 12px;
}
</style>
