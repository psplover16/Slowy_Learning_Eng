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
  scenes: PlaylistScene[]
  vocabGroups: PlaylistVocabGroup[]
  phrases: PlaylistPhrase[]
}

export interface PlaylistScene {
  id: string
  sentences: Array<{ en: string; tc: string }>
}

export interface PlaylistVocabGroup {
  label: string
  items: Array<{ word: string; pos: string; meaning: string; highlight?: boolean }>
}

export interface PlaylistPhrase {
  id: string
  phrase: string
  meaning: string
  examples: Array<{ en: string; tc: string }>
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
}
