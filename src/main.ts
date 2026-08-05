import { createApp } from 'vue'
import { createPinia } from 'pinia'

import App from './App.vue'
import router from './router'
import { useSkinStore } from './stores/skin'

import './styles/tokens.neon.css'
import './styles/tokens.crt.css'
import './styles/base.css'

const app = createApp(App)
app.use(createPinia())

useSkinStore().apply()

app.use(router)
app.mount('#app')
