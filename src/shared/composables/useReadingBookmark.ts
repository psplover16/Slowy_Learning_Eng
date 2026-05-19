import { STORAGE_KEYS } from '../config/storageKeys'

type BookmarkMap = Record<string, string | null>

function load(): BookmarkMap {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEYS.BOOKMARK) ?? '{}')
  } catch {
    return {}
  }
}

function save(map: BookmarkMap): void {
  localStorage.setItem(STORAGE_KEYS.BOOKMARK, JSON.stringify(map))
}

export function useReadingBookmark() {
  function getBookmark(chapterId: string): string | null {
    const map = load()
    return map[chapterId] ?? null
  }

  function setBookmark(chapterId: string, paragraphId: string): void {
    const map = load()
    map[chapterId] = paragraphId
    save(map)
  }

  return { getBookmark, setBookmark }
}
