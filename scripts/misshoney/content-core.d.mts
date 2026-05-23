export interface TranscriptCue {
  start: number
  end: number
  text: string
}

export interface TranscriptInput {
  videoId: string
  slug: string
  level: string
  title: string
  youtubeUrl: string
  transcriptText: string
  cues: TranscriptCue[]
}

export interface ContentScaffold {
  videoId: string
  slug: string
  level: string
  title: string
  youtubeUrl: string
  transcriptText: string
  cues: TranscriptCue[]
  suggestedSceneBoundaries: number[]
}

export interface ValidationResult {
  valid: boolean
  errors: string[]
}

export interface PromotionPaths {
  source: string
  destination: string
}

export interface LevelCoverageInput {
  level: string
  transcriptSlugs: string[]
  scaffoldSlugs: string[]
  generatedSlugs: string[]
  promotedSlugs: string[]
  skippedCount: number
}

export interface LevelCoverageResult {
  level: string
  transcriptCount: number
  scaffoldCount: number
  generatedCount: number
  promotedCount: number
  skippedCount: number
  isComplete: boolean
}

export declare function buildScaffold(transcript: TranscriptInput): ContentScaffold
export declare function validatePlaylistVideoData(data: unknown): ValidationResult
export declare function planPromotionPaths(level: string, slug: string): PromotionPaths
export declare function countLevelCoverage(params: LevelCoverageInput): LevelCoverageResult
