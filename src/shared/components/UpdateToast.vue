<template>
  <Transition name="toast">
    <div
      v-if="visible"
      class="fixed bottom-20 left-1/2 -translate-x-1/2 z-50 bg-ink text-paper-3 text-sm px-4 py-2 rounded-full shadow-lg"
    >
      已更新至最新版本
    </div>
  </Transition>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRegisterSW } from 'virtual:pwa-register/vue'

const visible = ref(false)

const { needRefresh, updateServiceWorker } = useRegisterSW({
  onRegistered() {},
  onRegisterError(error: unknown) {
    console.error('SW registration error', error)
  },
})

onMounted(() => {
  if (needRefresh.value) {
    updateServiceWorker(true)
    visible.value = true
    setTimeout(() => {
      visible.value = false
    }, 3000)
  }
})
</script>

<style scoped>
.toast-enter-active,
.toast-leave-active {
  transition: opacity 0.3s, transform 0.3s;
}
.toast-enter-from,
.toast-leave-to {
  opacity: 0;
  transform: translate(-50%, 8px);
}
</style>
