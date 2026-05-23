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
}): unknown
