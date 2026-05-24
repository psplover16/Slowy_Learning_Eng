<template>
  <Transition name="fab">
    <button
      v-if="sourceScrollY !== null"
      class="fixed bottom-6 right-6 z-40 bg-terracotta text-white rounded-full shadow-lg px-4 py-2 text-sm font-medium hover:bg-terracotta-deep transition-colors flex items-center gap-1"
      :aria-label="ariaLabel ?? label"
      :data-testid="testId ?? 'back-to-word-fab'"
      @click="returnToSource"
    >
      ↑ {{ label }}
    </button>
  </Transition>
</template>

<script setup lang="ts">
withDefaults(defineProps<{
  sourceScrollY: number | null
  label?: string
  ariaLabel?: string
  testId?: string
}>(), {
  label: '回到單字',
  ariaLabel: '回到單字位置',
  testId: 'back-to-word-fab',
})

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
