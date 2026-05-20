export declare const ROOT_ENTRIES_ALWAYS_PRESERVED: Set<string>

export interface SyncPublishedSiteArgs {
  worktreeRoot: string
  distPath: string
  target: 'production' | 'staging'
}

export interface SyncPublishedSiteResult {
  target: string
  targetPath: string
  removedRootEntries: string[]
  removedTargetEntries: string[]
  copiedEntries: string[]
}

export declare function syncPublishedSite(args: SyncPublishedSiteArgs): SyncPublishedSiteResult
export declare function formatPublishSummary(result: SyncPublishedSiteResult): string
export declare function formatNoPublishChangesMessage(target: string): string
