import { createRouter, createWebHistory, type RouteRecordRaw } from 'vue-router'
import HomeView from '../../modules/home/views/HomeView.vue'
import { chapters } from '../../shared/config/chapters'

const chapterRoutes: RouteRecordRaw[] = chapters.map((chapter) => ({
  path: chapter.path,
  name: chapter.id,
  component: () => import('../../modules/chapters/ChapterView.vue'),
  props: (route) => ({ id: route.name as string }),
}))

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
    ...chapterRoutes,
  ],
})
