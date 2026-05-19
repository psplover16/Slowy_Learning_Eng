<template>
  <main class="max-w-3xl mx-auto px-4 py-6 space-y-3">
    <h1 class="font-fraunces text-2xl text-terracotta mb-4">文章列表</h1>
    <ArticleListItem
      title="我的紐約之旅"
      subtitle="My Trip to New York City · Slow English Podcast B1"
      :completed="isCompleted('ch1')"
      data-testid="article-ch1"
      @navigate="router.push('/ch1')"
      @toggle-completion="toggleCompletion('ch1')"
    />
  </main>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router'
import ArticleListItem from '../components/ArticleListItem.vue'
import { useCompletion } from '../composables/useCompletion'

const router = useRouter()
const { isCompleted, toggleCompletion } = useCompletion()
</script>
