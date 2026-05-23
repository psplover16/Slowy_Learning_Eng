export interface PlaylistData {
  level: 'a1' | 'a2' | 'b1' | 'b2'
  title: string
  youtubePlaylistUrl: string
  videos: PlaylistVideoEntry[]
  skippedVideos: SkippedVideoEntry[]
}

export interface PlaylistVideoEntry {
  videoId: string
  slug: string
  title: string
  titleZh?: string
  subtitle?: string
  originalIndex: number
  displayOrder: number
  status: 'ready' | 'pendingTranscript'
  contentLoader: (() => Promise<{ default: PlaylistVideoData }>) | null
}

export interface SkippedVideoEntry {
  videoId?: string
  title?: string
  youtubeUrl: string
  originalIndex: number
  reason: 'member-only' | 'private' | 'no-english-captions' | 'unavailable' | 'geo-restricted'
}

export interface PlaylistVideoData {
  videoId: string
  slug: string
  level: 'a1' | 'a2' | 'b1' | 'b2'
  title: string
  youtubeUrl: string
  header: PlaylistVideoHeader
  scenes: PlaylistScene[]
  vocabGroups: PlaylistVocabGroup[]
  phrases: PlaylistPhrase[]
  breakdowns: PlaylistSentenceBreakdown[]
}

export interface PlaylistVideoHeader {
  podcastLabel: string
  titleZh: string
  titleEn: string
  levelTag: string
  topicTag?: string
}

export interface PlaylistScene {
  id: string
  no: string
  titleZh: string
  titleEn: string
  sentences: Array<{ en: string; tc: string }>
  tags: PlaylistVocabItem[]
}

export interface PlaylistVocabGroup {
  title: string
  items: PlaylistVocabItem[]
}

export interface PlaylistVocabItem {
  english: string
  kk: string
  partOfSpeech: string
  meaning: string
  note?: string
  highlight?: boolean
}

export interface PlaylistPhrase {
  id: string
  phrase: string
  meaning: string
  examples: Array<{ en: string; tc: string }>
}

export interface PlaylistSentenceBreakdown {
  id: string
  sentence: string
  translation: string
  points: Array<{ label: string; text: string; note: string }>
}

// Import tool output types
export interface ImportInventoryItem {
  videoId: string
  title: string
  youtubeUrl: string
  originalIndex: number
  status: 'learnable' | 'skipped'
}

export interface ImportSkippedItem {
  videoId?: string
  title?: string
  youtubeUrl: string
  originalIndex: number
  reason: SkippedVideoEntry['reason']
}

export interface ImportSummary {
  level: string
  inventoryCount: number
  transcriptCount: number
  skippedCount: number
  missingTranscriptCount: number
}

// Content scaffold type
export interface ContentScaffold {
  videoId: string
  slug: string
  level: 'a1' | 'a2' | 'b1' | 'b2'
  title: string
  youtubeUrl: string
  transcriptText: string
  cues: Array<{ start: number; end: number; text: string }>
  suggestedSceneBoundaries: number[]
  authoringChecklist: string[]
  polishedContentSkeleton: PlaylistVideoData
}
