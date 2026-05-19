import { ref } from 'vue'
import type { Ref } from 'vue'

export interface UnderlinkBacklink {
  sourceScrollY: Ref<number | null>
  targetId: Ref<string | null>
  triggerScroll(targetId: string): void
  returnToSource(): void
}

export function useUnderlinkBacklink(): UnderlinkBacklink {
  const sourceScrollY = ref<number | null>(null)
  const targetId = ref<string | null>(null)

  function triggerScroll(id: string): void {
    sourceScrollY.value = window.scrollY
    targetId.value = id
    const el = document.getElementById(id)
    if (!el) return

    const rect = el.getBoundingClientRect()
    const elAbsTop = rect.top + window.scrollY

    const navHeight = (document.querySelector('nav') as HTMLElement | null)?.offsetHeight ?? 0
    const visibleHeight = window.innerHeight - navHeight
    const centered = elAbsTop - navHeight - (visibleHeight - rect.height) / 2

    window.scrollTo({ top: Math.max(0, centered), behavior: 'smooth' })
  }

  function returnToSource(): void {
    if (sourceScrollY.value !== null) {
      window.scrollTo({ top: sourceScrollY.value, behavior: 'smooth' })
    }
    sourceScrollY.value = null
    targetId.value = null
  }

  return { sourceScrollY, targetId, triggerScroll, returnToSource }
}
