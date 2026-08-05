<script setup lang="ts">
import { tools } from '@/config/tools'
</script>

<template>
  <section class="panel home">
    <h2 class="home-title">工具集合</h2>
    <p class="home-sub">共 {{ tools.length }} 个本地开发工具</p>
    <div class="home-grid">
      <RouterLink v-for="t in tools" :key="t.id" :to="t.path" class="tool-card">
        <span class="tc-name">{{ t.name }}</span>
        <span class="tc-desc">{{ t.desc }}</span>
      </RouterLink>
    </div>
  </section>
</template>

<style scoped>
.home {
  padding: 20px 22px;
}
.home-title {
  font-size: 18px;
  margin-bottom: 4px;
  color: var(--color-accent);
}
.home-sub {
  color: var(--color-text-muted);
  font-size: 13px;
  margin-bottom: 16px;
}
.home-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
  gap: 12px;
}
.tool-card {
  display: flex;
  flex-direction: column;
  gap: 6px;
  padding: 16px;
  border: 1px solid var(--color-border);
  border-radius: var(--radius);
  background: var(--color-surface-2);
}
.tool-card:hover {
  border-color: var(--color-accent);
  box-shadow: 0 0 12px var(--glow-accent);
}
.tc-name {
  font-size: 15px;
  color: var(--color-text);
}
.tc-desc {
  font-size: 12px;
  color: var(--color-text-muted);
}
</style>
