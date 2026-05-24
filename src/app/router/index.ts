import { createRouter, createWebHistory, type RouteRecordRaw } from 'vue-router'
import HomeView from '../../modules/home/views/HomeView.vue'
import { chapters } from '../../shared/config/chapters'
import { playlists } from '../../shared/config/playlists'

const chapterRoutes: RouteRecordRaw[] = chapters.map((chapter) => ({
  path: chapter.path,
  name: chapter.id,
  component: () => import('../../modules/chapters/ChapterView.vue'),
  props: (route) => ({ id: route.name as string }),
}))

const playlistRoutes: RouteRecordRaw[] = playlists.flatMap((playlist) => [
  {
    path: playlist.path,
    name: `playlist-${playlist.id}`,
    component: () => import('../../modules/playlists/PlaylistView.vue'),
    props: { level: playlist.id },
  },
  {
    path: `${playlist.path}/:videoSlug`,
    name: `playlist-video-${playlist.id}`,
    component: () => import('../../modules/playlists/PlaylistVideoView.vue'),
    props: (route) => ({ level: playlist.id, videoSlug: route.params['videoSlug'] }),
  },
])

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
    ...playlistRoutes,
  ],
})
