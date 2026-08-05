import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '@/views/HomeView.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    { path: '/', name: 'home', component: HomeView },
    {
      path: '/tools/json-formatter',
      name: 'json-formatter',
      component: () => import('@/views/tools/JsonFormatterView.vue'),
    },
    {
      path: '/tools/hash-generator',
      name: 'hash-generator',
      component: () => import('@/views/tools/HashGeneratorView.vue'),
    },
    {
      path: '/tools/base64',
      name: 'base64',
      component: () => import('@/views/tools/Base64View.vue'),
    },
    {
      path: '/tools/timestamp',
      name: 'timestamp',
      component: () => import('@/views/tools/TimestampView.vue'),
    },
    {
      path: '/tools/url-codec',
      name: 'url-codec',
      component: () => import('@/views/tools/UrlCodecView.vue'),
    },
    {
      path: '/tools/text-diff',
      name: 'text-diff',
      component: () => import('@/views/tools/TextDiffView.vue'),
    },
  ],
})

export default router
