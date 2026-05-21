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
  </main>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router'
import ArticleListItem from '../components/ArticleListItem.vue'
import { useCompletion } from '../composables/useCompletion'
import { chapters } from '../../../shared/config/chapters'

const router = useRouter()
const { isCompleted, toggleCompletion } = useCompletion()
</script>
