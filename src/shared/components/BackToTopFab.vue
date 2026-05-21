<template>
  <Transition name="fab">
    <button
      v-if="anchorEl !== null && !isVisible"
      :style="{ bottom: `calc(1.5rem + ${offsetBottom ?? 0}px)` }"
      class="fixed right-6 z-40 bg-terracotta text-white rounded-full shadow-lg px-4 py-2 text-sm font-medium hover:bg-terracotta-deep transition-colors flex items-center gap-1"
      aria-label="回到頁面頂部"
      data-testid="back-to-top-fab"
      @click="scrollToTop"
    >
      ↑ 回頂
    </button>
  </Transition>
</template>

<script setup lang="ts">
import { ref, watch, onUnmounted } from 'vue'

const props = defineProps<{
  anchorEl: HTMLElement | null
  offsetBottom?: number
}>()

const isVisible = ref(true)
let observer: IntersectionObserver | null = null

function disconnect() {
  if (observer) {
    observer.disconnect()
    observer = null
  }
}

function observe(el: HTMLElement) {
  disconnect()
  observer = new IntersectionObserver((entries) => {
    isVisible.value = entries[0]?.isIntersecting ?? true
  })
  observer.observe(el)
}

watch(
  () => props.anchorEl,
  (el) => {
    if (el) {
      isVisible.value = true
      observe(el)
    } else {
      disconnect()
    }
  },
  { immediate: true },
)

onUnmounted(() => {
  disconnect()
})

function scrollToTop() {
  window.scrollTo({ top: 0, behavior: 'smooth' })
}
</script>

<style scoped>
.fab-enter-active,
.fab-leave-active {
  transition: opacity 0.2s, transform 0.2s;
}
.fab-enter-from,
.fab-leave-to {
  opacity: 0;
  transform: translateY(8px);
}
</style>
