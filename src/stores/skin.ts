import { ref } from 'vue'
import { defineStore } from 'pinia'

export type Skin = 'neon' | 'crt'
export const SKIN_STORAGE_KEY = 'ofly-skin'

function readStoredSkin(): Skin {
  return localStorage.getItem(SKIN_STORAGE_KEY) === 'crt' ? 'crt' : 'neon'
}

export const useSkinStore = defineStore('skin', () => {
  const skin = ref<Skin>(readStoredSkin())

  function apply() {
    document.documentElement.dataset.skin = skin.value
  }

  function setSkin(next: Skin) {
    skin.value = next
    localStorage.setItem(SKIN_STORAGE_KEY, next)
    apply()
  }

  function toggle() {
    setSkin(skin.value === 'neon' ? 'crt' : 'neon')
  }

  return { skin, apply, setSkin, toggle }
})
