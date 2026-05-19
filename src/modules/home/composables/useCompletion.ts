import { reactive } from 'vue'
import { STORAGE_KEYS } from '../../../shared/config/storageKeys'

type CompletionMap = Record<string, boolean>

function load(): CompletionMap {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEYS.COMPLETION) ?? '{}')
  } catch {
    return {}
  }
}

function save(map: CompletionMap): void {
  localStorage.setItem(STORAGE_KEYS.COMPLETION, JSON.stringify(map))
}

export function useCompletion() {
  const state = reactive<CompletionMap>(load())

  function isCompleted(chapterId: string): boolean {
    return state[chapterId] === true
  }

  function toggleCompletion(chapterId: string): void {
    state[chapterId] = !state[chapterId]
    save(state)
  }

  return { isCompleted, toggleCompletion }
}
