import { ref } from 'vue'

export function useRegisterSW(_options?: unknown) {
  return {
    needRefresh: ref(false),
    offlineReady: ref(false),
    updateServiceWorker: () => Promise.resolve(),
  }
}
