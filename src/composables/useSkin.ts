import { computed } from 'vue'
import { useSkinStore } from '@/stores/skin'

export function useSkin() {
  const store = useSkinStore()
  return {
    skin: store.skin,
    isNeon: computed(() => store.skin === 'neon'),
    isCrt: computed(() => store.skin === 'crt'),
  }
}
