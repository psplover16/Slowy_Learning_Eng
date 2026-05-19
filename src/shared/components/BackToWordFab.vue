<template>
  <Transition name="fab">
    <button
      v-if="sourceScrollY !== null"
      class="fixed bottom-6 right-6 z-40 bg-terracotta text-white rounded-full shadow-lg px-4 py-2 text-sm font-medium hover:bg-terracotta-deep transition-colors flex items-center gap-1"
      aria-label="回到單字位置"
      data-testid="back-to-word-fab"
      @click="returnToSource"
    >
      ↑ 回到單字
    </button>
  </Transition>
</template>

<script setup lang="ts">
defineProps<{
  sourceScrollY: number | null
}>()

const emit = defineEmits<{
  returnToSource: []
}>()

function returnToSource() {
  emit('returnToSource')
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
