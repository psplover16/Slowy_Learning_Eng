export interface SceneSentence {
  en: string
  tc: string
}

export interface VocabItem {
  id?: string
  english: string
  kk?: string
  pos: string
  meaning: string
  example?: string
}

export type WordTag = VocabItem

export interface Scene {
  id: string
  no: string
  titleZh: string
  titleEn: string
  sentences: SceneSentence[]
  tags: WordTag[]
}

export interface VocabGroup {
  title: string
  items: VocabItem[]
}

export interface PhraseCard {
  id: string
  phrase: string
  meaning: string
  note: string
  example: string
  exampleTc: string
}

export interface BreakdownChunk {
  en: string
  note: string
}

export interface SentenceBreakdown {
  id?: string
  sentence: string
  translation: string
  chunks: BreakdownChunk[]
}

export interface ChapterData {
  headerTitleZh: string
  headerTitleEn: string
  headerPodcastLabel: string
  headerLevelTag: string
  headerTopicTag: string
  mp3Src?: string | null
  scenes: Scene[]
  vocabGroups: VocabGroup[]
  phrases: PhraseCard[]
  breakdowns: SentenceBreakdown[]
}
