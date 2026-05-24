export interface VideoMetadata {
  videoId: string
  slug: string
  level: string
  title: string
  youtubeUrl: string
  header?: Record<string, unknown>
}

export interface ProofreadDraft {
  correctedText: string
  translation: string
  segments: Array<Record<string, unknown> & { english: string; translation: string }>
  words: Array<Record<string, unknown>>
  phrases: Array<Record<string, unknown>>
  usages: Array<Record<string, unknown>>
  grammar: Array<Record<string, unknown>>
}

export interface PlaylistInlineToken {
  type: string
  text: string
  targetId?: string
  instanceId?: string
}

export interface PlaylistSentence {
  en: string
  tc: string
  englishTokens: PlaylistInlineToken[]
}

export interface PlaylistScene {
  id: string
  no: string
  titleZh: string
  titleEn: string
  sentences: PlaylistSentence[]
  tags: unknown[]
}

export interface PlaylistBreakdownPoint {
  label: string
  text: string
  note?: string
}

export interface PlaylistBreakdown {
  id: string
  sentence: string
  translation: string
  points: PlaylistBreakdownPoint[]
}

export interface PlaylistVideoData {
  videoId: string
  slug: string
  level: string
  title: string
  youtubeUrl: string
  header: Record<string, unknown>
  scenes: PlaylistScene[]
  vocabGroups: unknown[]
  phrases: unknown[]
  usages: unknown[]
  breakdowns: PlaylistBreakdown[]
}

export declare const REQUIRED_PROOFREAD_KEYS: string[]
export declare function resolveVideoMetadata(params: { repoRoot: string; level: string; slug: string }): VideoMetadata
export declare function parseProofreadMarkdown(markdown: string): ProofreadDraft
export declare function extractJsonCodeBlock(markdown: string): string
export declare function normalizeProofreadDraft(value: unknown): ProofreadDraft
export declare function formatTranscriptUnavailableError(params: {
  level: string
  slug: string
  youtubeUrl: string
  reason: string
}): string
export declare function buildPlaylistVideoDataFromProofread(params: {
  metadata: VideoMetadata
  draft: ProofreadDraft
}): PlaylistVideoData
