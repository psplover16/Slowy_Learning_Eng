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
  const pushSection = (condition: boolean, key: PlaylistReadingSectionKey, label: string) => {
    if (condition) {
      sections.push({
        id: `${baseId}-section-${key}`,
        label,
        key,
        num: sections.length + 1,
      })
    }
  }

  pushSection(content.scenes.length > 0, 'bilingual', '全文')
  pushSection(content.vocabGroups.length > 0, 'vocabulary', '單字')
  pushSection(content.phrases.length > 0, 'phrases', '片語')
  pushSection((content.usages?.length ?? 0) > 0, 'usages', '用法')
  pushSection(content.breakdowns.length > 0, 'breakdown', '句型')

  return sections
}

export function buildPlaylistSectionNums(sections: PlaylistReadingSection[]): Record<PlaylistReadingSectionKey, number> {
  return sections.reduce((acc, section) => {
    acc[section.key] = section.num
    return acc
  }, {} as Record<PlaylistReadingSectionKey, number>)
}
