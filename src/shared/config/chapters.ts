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
  {
    id: 'ch3',
    path: '/ch3',
    shortLabel: 'Ch3',
    titleZh: '傳統學習法為何無法帶來流暢',
    titleEn: "Why Traditional Study Can't Create Fluency",
    dataLoader: () => import('../../modules/chapters/data/ch3'),
  },
]
