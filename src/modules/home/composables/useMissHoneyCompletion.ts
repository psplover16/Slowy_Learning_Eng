import { reactive } from 'vue'
import { STORAGE_KEYS } from '../../../shared/config/storageKeys'

type CompletionMap = Record<string, boolean>

function load(): CompletionMap {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEYS.MISS_HONEY_COMPLETION) ?? '{}')
  } catch {
    return {}
  }
}

function save(map: CompletionMap): void {
  localStorage.setItem(STORAGE_KEYS.MISS_HONEY_COMPLETION, JSON.stringify(map))
}

export function useMissHoneyCompletion() {
  const completionMap = reactive<CompletionMap>(load())

  function isCompleted(videoId: string): boolean {
    return completionMap[videoId] === true
  }

  function toggleCompletion(videoId: string): void {
    completionMap[videoId] = !completionMap[videoId]
    save(completionMap)
  }

  return { completionMap, isCompleted, toggleCompletion }
}
