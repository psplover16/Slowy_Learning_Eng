<template>
  <main class="max-w-3xl mx-auto px-4 py-6 space-y-3">
    <h1 class="font-fraunces text-2xl text-terracotta mb-4">文章列表</h1>
    <ArticleListItem
      v-for="chapter in chapters"
      :key="chapter.id"
      :title="chapter.titleZh"
      :subtitle="chapter.titleEn"
      :completed="isCompleted(chapter.id)"
      :data-testid="`article-${chapter.id}`"
      @navigate="router.push(chapter.path)"
      @toggle-completion="toggleCompletion(chapter.id)"
    />

    <section data-testid="misshoney-section" class="pt-6">
      <h2 class="font-fraunces text-xl text-terracotta mb-4">MissHoney</h2>
      <ArticleListItem
        v-for="pl in playlists"
        :key="pl.id"
        :title="pl.shortLabel"
        :subtitle="pl.titleZh"
        :completed="false"
        :show-completion="false"
        :data-testid="`misshoney-playlist-${pl.id}`"
        @navigate="router.push(pl.path)"
      />
    </section>
  </main>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router'
import ArticleListItem from '../components/ArticleListItem.vue'
import { useCompletion } from '../composables/useCompletion'
import { chapters } from '../../../shared/config/chapters'
import { playlists } from '../../../shared/config/playlists'

const router = useRouter()
const { isCompleted, toggleCompletion } = useCompletion()
</script>
