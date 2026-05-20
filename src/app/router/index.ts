import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../../modules/home/views/HomeView.vue'

export const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: HomeView,
    },
    {
      path: '/grammar',
      name: 'grammar',
      component: () => import('../../modules/grammar/views/GrammarView.vue'),
    },
    {
      path: '/ch1',
      name: 'ch1',
      component: () => import('../../modules/ch1/views/Ch1View.vue'),
    },
  ],
})
