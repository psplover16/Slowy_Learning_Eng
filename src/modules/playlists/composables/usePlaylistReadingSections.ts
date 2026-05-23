import type { PlaylistVideoData } from '../types'

export interface PlaylistReadingSection {
  id: string
  label: string
  key: PlaylistReadingSectionKey
  num: number
}

export type PlaylistReadingSectionKey = 'bilingual' | 'vocabulary' | 'phrases' | 'usages' | 'breakdown'

export function buildPlaylistReadingSections(content: PlaylistVideoData | null, baseId: string): PlaylistReadingSection[] {
  if (!content) return []

  const sections: PlaylistReadingSection[] = []
  let num = 1

  if (content.scenes.length) {
    sections.push({ id: `${baseId}-section-bilingual`, label: '全文', key: 'bilingual', num: num++ })
  }
  if (content.vocabGroups.length) {
    sections.push({ id: `${baseId}-section-vocabulary`, label: '單字', key: 'vocabulary', num: num++ })
  }
  if (content.phrases.length) {
    sections.push({ id: `${baseId}-section-phrases`, label: '片語', key: 'phrases', num: num++ })
  }
  if (content.usages?.length) {
    sections.push({ id: `${baseId}-section-usages`, label: '用法', key: 'usages', num: num++ })
  }
  if (content.breakdowns.length) {
    sections.push({ id: `${baseId}-section-breakdown`, label: '句型', key: 'breakdown', num: num++ })
  }

  return sections
}

export function buildPlaylistSectionNums(sections: PlaylistReadingSection[]): Record<PlaylistReadingSectionKey, number> {
  return sections.reduce((acc, section) => {
    acc[section.key] = section.num
    return acc
  }, {} as Record<PlaylistReadingSectionKey, number>)
}
