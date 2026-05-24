export interface OriginalSubtitleSource {
  level: string
  slug: string
  index: number
  extension: string
  sourcePath: string
  sourceRelativePath: string
  outputPath: string
  outputRelativePath: string
}

export interface RepairItem {
  level: string
  slug: string
  sourcePath?: string
  proofreadPath?: string
  field?: string
  reason: string
}

export interface ProofreaderLifecycle {
  proofreaderId: string
  agent: string
  level: string
  slug: string
  sourcePath: string
  step1Path: string
  opened: boolean
  processedSourceCount: number
  writtenStep1Count: number
  closed: boolean
}

export interface GrammarPoint {
  title: string
  sortOrder: number
  level?: string
  sourceCoverage: string[]
  [key: string]: unknown
}

export interface GrammarOmission {
  title: string
  sourceCoverage: string[]
  reason: string
  [key: string]: unknown
}

export interface GrammarDeal {
  markdown: string
  grammarPoints: GrammarPoint[]
  omissions: GrammarOmission[]
}

export declare const MISS_HONEY_LEVELS: string[]
export declare const ORIGINAL_CONTENT_ROOT: string
export declare const STEP1_ROOT: string
export declare const LEGACY_PROOFREAD_ROOT: string
export declare const GENERATED_CONTENT_ROOT: string
export declare const APP_VIDEO_ROOT: string

export declare function listOriginalSubtitleSources(params?: {
  repoRoot?: string
  sourceRoot?: string
}): OriginalSubtitleSource[]
export declare function extractSubtitleForProofread(params: {
  sourcePath: string
  level?: string
  slug?: string
}): { ok: true; text: string; fieldPath: string } | { ok: false; repair: RepairItem }
export declare function buildProofreaderLifecycles(sources: OriginalSubtitleSource[]): ProofreaderLifecycle[]
export declare function validateProofreaderLifecycles(lifecycles: ProofreaderLifecycle[]): {
  valid: boolean
  errors: string[]
}
export declare function validateStep1Markdown(params: {
  markdown: string
  level: string
  slug: string
  sourcePath?: string
  proofreadPath?: string
}): { valid: true; draft: unknown } | { valid: false; repair: RepairItem }
export declare function writeBackProofreadToApp(params: {
  repoRoot?: string
  level: string
  slug: string
  sourcePath: string
  proofreadPath: string
  destinationPath?: string
}): { written: boolean; repair?: RepairItem; destinationPath?: string; content?: unknown }
export declare function accumulateGrammarMarkdown(existingMarkdown: string, params: {
  level: string
  slug: string
  grammar: unknown[]
}): string
export declare function parseGrammarDealMarkdown(markdown: string): GrammarDeal
export declare function planGrammarSync(params: {
  existingTopics?: string[]
  grammarPoints?: GrammarPoint[]
  omissions?: GrammarOmission[]
}): {
  supplements: GrammarPoint[]
  additions: GrammarPoint[]
  omissions: GrammarOmission[]
}
export declare function synthesizeProofreadMarkdownFromVideoData(videoData: Record<string, any>): string
export declare function syncStep1Outputs(params?: { repoRoot?: string }): {
  sources: OriginalSubtitleSource[]
  synced: Array<OriginalSubtitleSource & { method: string; proofreadPath: string }>
  repairs: RepairItem[]
}
export declare function validateStep1Tree(params?: { repoRoot?: string }): {
  sources: OriginalSubtitleSource[]
  successes: Array<OriginalSubtitleSource & { draft: unknown }>
  repairs: RepairItem[]
}
export declare function writeRunManifest(params?: { repoRoot?: string; outPath?: string }): unknown
export declare function buildGrammarAccumulationFromStep1(params?: { repoRoot?: string; outPath?: string }): unknown
export declare function buildGrammarDealFromAccumulation(params?: {
  repoRoot?: string
  inputPath?: string
  outPath?: string
}): GrammarDeal
export declare function buildFinalVerificationReport(params: {
  sourceCount: number
  step1Count: number
  jsonSuccessCount: number
  repairList: RepairItem[]
  appWriteBackCount: number
  grammarAdditions: number
  grammarSupplements: number
  grammarOmissions?: GrammarOmission[]
  uiSmokePages: string[]
  commandResults: Array<{ command: string; status: string; exitCode?: number }>
  risks: string[]
}): string
export declare function writeFinalVerificationReport(params?: {
  repoRoot?: string
  commandResults?: Array<{ command: string; status: string; exitCode?: number }>
  uiSmokePages?: string[]
  risks?: string[]
  outPath?: string
}): unknown
