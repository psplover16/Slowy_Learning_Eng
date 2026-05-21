import type { ChapterData } from '../../modules/chapters/types'

export interface ChapterEntry {
  id: string
  path: string
  shortLabel: string
  titleZh: string
  titleEn: string
  dataLoader: () => Promise<{ default: ChapterData }>
}

export const chapters: ChapterEntry[] = [
  {
    id: 'ch1',
    path: '/ch1',
    shortLabel: 'Ch1',
    titleZh: '我的紐約之旅',
    titleEn: 'My Trip to New York City · Slow English Podcast B1',
    dataLoader: () => import('../../modules/chapters/data/ch1'),
  },
  {
    id: 'ch2',
    path: '/ch2',
    shortLabel: 'Ch2',
    titleZh: '語言究竟是怎麼學會的',
    titleEn: 'How Languages Are Really Learned',
    dataLoader: () => import('../../modules/chapters/data/ch2'),
  },
]
