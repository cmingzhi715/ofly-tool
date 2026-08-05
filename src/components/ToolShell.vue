<script setup lang="ts">
defineProps<{ title: string }>()
</script>

<template>
  <section class="panel tool-shell">
    <h2 class="ts-title">{{ title }}</h2>
    <slot />
  </section>
</template>

<style scoped>
.tool-shell {
  padding: 20px 22px;
}
.ts-title {
  font-size: 18px;
  margin-bottom: 14px;
  color: var(--color-accent);
}
</style>
