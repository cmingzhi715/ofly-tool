import { computed } from 'vue'
import { storeToRefs } from 'pinia'
import { useSkinStore } from '@/stores/skin'

export function useSkin() {
  const store = useSkinStore()
  const { skin } = storeToRefs(store)
  return {
    skin,
    isNeon: computed(() => store.skin === 'neon'),
    isCrt: computed(() => store.skin === 'crt'),
  }
}
