<script setup lang="ts">
import { tools } from '@/config/tools'
import SkinSwitcher from '@/components/SkinSwitcher.vue'
</script>

<template>
  <div class="app-shell">
    <div class="fx-grid" aria-hidden="true"></div>
    <div class="fx-scan" aria-hidden="true"></div>

    <div class="app-inner">
      <div class="fx-scanlines" aria-hidden="true"></div>
      <div class="fx-vignette" aria-hidden="true"></div>
      <header class="app-header">
        <div class="brand-neon">
          <span class="eyebrow">// LOCAL · WORKSTATION</span>
          <h1>OFLY TOOL 矩阵</h1>
        </div>
        <div class="brand-crt">
          <span class="boot">&gt; BIOS OK <span class="ok">OFLY-TOOL v1.0 LOADED</span></span>
          <span class="logo">▚▞ OFLY TOOL ▞▚ <small>v1.0</small></span>
        </div>
        <div class="header-right">
          <span class="chip"><i></i>System Online</span>
          <SkinSwitcher />
        </div>
      </header>

      <div class="app-body">
        <nav class="app-nav">
          <RouterLink v-for="(t, i) in tools" :key="t.id" :to="t.path" class="nav-item">
            <span class="nav-num">{{ String(i + 1).padStart(2, '0') }}</span>
            <span class="nav-short">[ {{ t.short }} ]</span>
            <span class="nav-name">{{ t.name }}</span>
          </RouterLink>
        </nav>

        <main class="app-main">
          <slot />
        </main>
      </div>

      <footer class="app-status">
        <span class="st-on">● ONLINE</span>
        <span class="st">PORT 8080</span>
        <span class="st">NGINX ACTIVE</span>
        <span class="st-r">root@127.0.0.1</span>
      </footer>
    </div>
  </div>
</template>

<style scoped>
.app-shell {
  position: relative;
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 24px;
}
.app-inner {
  position: relative;
  z-index: 1;
  width: min(1200px, 100%);
  min-height: min(820px, 92vh);
  display: flex;
  flex-direction: column;
  border-radius: var(--radius);
  border: 1px solid var(--color-border);
  background: var(--color-surface);
}

/* ===== Neon ===== */
html[data-skin='neon'] .app-shell {
  align-items: stretch;
  padding: 0;
}
html[data-skin='neon'] .app-inner {
  width: 100%;
  border: none;
  border-radius: 0;
  background: transparent;
}
html[data-skin='neon'] .app-header {
  display: flex;
  align-items: flex-end;
  gap: 20px;
  flex-wrap: wrap;
  padding: 22px 26px 16px;
  border-bottom: 1px solid var(--color-border);
}
html[data-skin='neon'] .brand-crt {
  display: none;
}
html[data-skin='neon'] .eyebrow {
  display: block;
  font-size: 11px;
  letter-spacing: 0.5em;
  color: var(--color-accent);
  text-transform: uppercase;
  text-shadow: 0 0 12px color-mix(in srgb, var(--color-accent) 60%, transparent);
}
html[data-skin='neon'] h1 {
  font-size: clamp(24px, 4vw, 40px);
  font-weight: 800;
  letter-spacing: 0.06em;
  background: linear-gradient(90deg, var(--color-accent), var(--color-accent-3) 55%, var(--color-accent-2));
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
  filter: drop-shadow(0 0 18px color-mix(in srgb, var(--color-accent) 35%, transparent));
}
html[data-skin='neon'] .header-right {
  margin-left: auto;
  display: flex;
  gap: 10px;
  align-items: center;
}
html[data-skin='neon'] .app-body {
  display: grid;
  grid-template-columns: 210px 1fr;
  gap: 20px;
  flex: 1;
  padding: 20px 26px;
}
html[data-skin='neon'] .app-nav {
  display: flex;
  flex-direction: column;
  gap: 6px;
}
html[data-skin='neon'] .nav-item {
  position: relative;
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 11px 14px;
  border-radius: 4px;
  border: 1px solid transparent;
  color: var(--color-text-muted);
  font-size: 13.5px;
  letter-spacing: 0.06em;
}
html[data-skin='neon'] .nav-item:hover {
  color: var(--color-text);
  background: var(--bg-hover);
}
html[data-skin='neon'] .nav-item.router-link-active {
  border-color: var(--color-border);
  color: var(--color-text);
  background: linear-gradient(
    90deg,
    color-mix(in srgb, var(--color-accent) 12%, transparent),
    color-mix(in srgb, var(--color-accent-2) 5%, transparent)
  );
}
html[data-skin='neon'] .nav-item.router-link-active::before {
  content: '';
  position: absolute;
  left: -1px;
  top: 8px;
  bottom: 8px;
  width: 2px;
  background: linear-gradient(180deg, var(--color-accent), var(--color-accent-2));
  box-shadow: 0 0 12px var(--color-accent);
}
html[data-skin='neon'] .nav-num {
  font-family: var(--font-mono);
  font-size: 10px;
  color: var(--color-accent);
  opacity: 0.7;
}
html[data-skin='neon'] .nav-short {
  display: none;
}
html[data-skin='neon'] .app-main {
  min-width: 0;
}
html[data-skin='neon'] .app-status {
  display: flex;
  align-items: center;
  gap: 18px;
  padding: 12px 26px;
  border-top: 1px solid var(--color-border);
  font-family: var(--font-mono);
  font-size: 11.5px;
  color: var(--color-text-muted);
  letter-spacing: 0.12em;
}
html[data-skin='neon'] .app-status .st-on {
  color: var(--color-accent);
  text-shadow: 0 0 10px color-mix(in srgb, var(--color-accent) 70%, transparent);
}
html[data-skin='neon'] .app-status .st-r {
  margin-left: auto;
  color: var(--color-accent-2);
}

/* ===== CRT ===== */
html[data-skin='crt'] .app-shell {
  background: var(--bg-shell);
}
html[data-skin='crt'] .app-inner {
  border-radius: 14px;
  border: 1px solid var(--border-strong);
  background: radial-gradient(120% 90% at 50% 0%, var(--color-bg-2), var(--color-bg));
  box-shadow:
    inset 0 0 60px var(--shadow-deep),
    inset 0 0 8px color-mix(in srgb, var(--color-accent) 8%, transparent);
  padding: 20px 24px 16px;
}
html[data-skin='crt'] .brand-neon {
  display: none;
}
html[data-skin='crt'] .app-header {
  position: relative;
  text-align: center;
  padding: 4px 0 0;
}
html[data-skin='crt'] .boot {
  display: block;
  font-size: 13px;
  color: var(--color-text-muted);
  letter-spacing: 0.5px;
}
html[data-skin='crt'] .boot .ok {
  color: var(--color-accent);
}
html[data-skin='crt'] .logo {
  display: block;
  margin-top: 10px;
  font-size: 30px;
  color: var(--color-accent);
  letter-spacing: 6px;
  text-shadow: 0 0 10px color-mix(in srgb, var(--color-accent) 70%, transparent);
}
html[data-skin='crt'] .logo small {
  font-size: 12px;
  color: var(--color-accent-2);
  letter-spacing: 2px;
}
html[data-skin='crt'] .header-right {
  position: absolute;
  top: 18px;
  right: 20px;
}
html[data-skin='crt'] .header-right .chip {
  display: none;
}
html[data-skin='crt'] .app-body {
  display: flex;
  flex-direction: column;
  flex: 1;
  padding: 6px 0 0;
}
html[data-skin='crt'] .app-nav {
  display: flex;
  justify-content: center;
  flex-wrap: wrap;
  gap: 8px;
  margin-bottom: 14px;
}
html[data-skin='crt'] .nav-item {
  padding: 5px 13px;
  border: 1px solid var(--color-border);
  font-family: var(--font-mono);
  font-size: 15px;
  color: var(--color-accent-2);
  letter-spacing: 1px;
}
html[data-skin='crt'] .nav-item:hover {
  color: var(--color-hover);
  border-color: var(--color-accent-2);
}
html[data-skin='crt'] .nav-item.router-link-active {
  background: var(--color-accent-2);
  border-color: var(--color-accent-2);
  color: var(--color-on-accent);
  box-shadow: 0 0 14px color-mix(in srgb, var(--color-accent-2) 50%, transparent);
}
html[data-skin='crt'] .nav-num,
html[data-skin='crt'] .nav-name {
  display: none;
}
html[data-skin='crt'] .app-main {
  flex: 1;
}
html[data-skin='crt'] .app-status {
  display: flex;
  gap: 20px;
  flex-wrap: wrap;
  margin-top: 14px;
  border-top: 1px dashed var(--color-border);
  padding-top: 12px;
  font-family: var(--font-mono);
  font-size: 12.5px;
  color: var(--color-text-muted);
  letter-spacing: 1px;
}
html[data-skin='crt'] .app-status .st-on {
  color: var(--color-accent);
}
html[data-skin='crt'] .app-status .st-r {
  margin-left: auto;
}

@media (max-width: 760px) {
  html[data-skin='neon'] .app-body {
    grid-template-columns: 1fr;
  }
}
</style>
