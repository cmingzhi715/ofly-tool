<script setup lang="ts">
import { useSkinStore } from '@/stores/skin'
import AppShell from '@/layouts/AppShell.vue'

const skin = useSkinStore()
skin.apply()
</script>

<template>
  <AppShell>
    <RouterView v-slot="{ Component }">
      <KeepAlive>
        <component :is="Component" />
      </KeepAlive>
    </RouterView>
  </AppShell>
</template>
