export interface RawItem {
  videoId: string
  originalIndex: number
  skipped: boolean
  [key: string]: unknown
}

export interface NormalizedItem extends RawItem {
  displayOrder?: number
}

export interface TranscriptCue {
  start: number
  end: number
  text: string
}

export interface OutputPaths {
  transcript: string
  inventory: string
  skipped: string
  importSummary: string
}

export type SkippedReason = 'member-only' | 'private' | 'no-english-captions' | 'unavailable' | 'geo-restricted'

export declare function assignDisplayOrders(items: RawItem[]): NormalizedItem[]
export declare function deriveSlug(displayOrder: number, title: string): string
export declare function normalizeTranscriptCues(cues: TranscriptCue[]): TranscriptCue[]
export declare function planOutputPaths(level: string, slug: string): OutputPaths
export declare function mapSkippedReason(errorMessage: string): SkippedReason
export declare function buildInventoryItem(entry: { id: string; title?: string; url?: string; originalIndex: number }, skipped: boolean): object
export declare function mergeCuesToText(cues: TranscriptCue[]): string
