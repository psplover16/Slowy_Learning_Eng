## Summary

把 `Ch1View.vue` 內寫死的 940 行 chapter 內容（scenes / vocabGroups / phrases / breakdowns）抽出到獨立 data 模組，建立 generic `ChapterView.vue`，讓未來新增 Ch2/Ch3/... 變成「加 1 個 data 檔 + 1 行 chapters config」。

## Motivation

目前 `src/modules/ch1/views/Ch1View.vue` 把資料與檢視混在同一檔，膨脹到 940 行：

- 4 個大型 `const` 陣列：`scenes`（15 個場景）、`vocabGroups`（6 個主題群組）、`phrases`（12 張片語卡）、`breakdowns`（29 條句型解析）
- `<template>` 區段以 v-for 渲染上述資料
- inline `hl()` 函式產生底線連結 HTML
- 各種 type interface（`Scene`、`TagItem`、`VocabItem`...）

要加 Ch2，就得 copy-paste 整個檔（template + script + types）再改內容 — 對 N 章專案不可行（N=10 已痛苦，N=100 不可能）。

使用者明確反映「我很快就會添加 ch2」與「未來可能有 ch100 的可能，這點也必須考慮」，所以採取「長痛不如短痛」原則，現在做這次架構重構。

承接前一個 change `improve-ch1-navigation` 已建立的 `src/shared/config/chapters.ts` 單一資料源；本變更把它從「只有 metadata」擴充到「真正資料化」。

## Proposed Solution

### 1. 資料層

- 新增 `src/modules/chapters/types.ts`：定義 `ChapterData` 介面與其子型別（Scene、SceneSentence、VocabGroup、VocabItem、PhraseCard、SentenceBreakdown、BreakdownChunk、WordTag），以及共用的 `hl()` highlighter helper。
- 新增 `src/modules/chapters/data/ch1.ts`：純 TS 模組，匯出 `default` 為一個符合 `ChapterData` 的物件，內容從 Ch1View.vue 完整搬過來。

### 2. 檢視層

- 新增 `src/modules/chapters/ChapterView.vue`：generic 元件，從 `useRoute()` 拿 `params.id`，查 `chapters.ts` 找到對應 entry，呼叫 `dataLoader()` 動態 import data 模組，渲染成原本 Ch1View 的 layout。
- 既有 4 個 section id（`ch1-section-bilingual` 等）改為動態：`${chapter.id}-section-bilingual`，保留現有 improve-ch1-navigation 的 quick-nav 行為。

### 3. 設定層

- 擴充 `src/shared/config/chapters.ts` 的 `ChapterEntry` 介面：新增 `dataLoader: () => Promise<{ default: ChapterData }>`，每個 chapter entry 在這宣告 import path。
- Ch1 entry 加上 `dataLoader: () => import('../../modules/chapters/data/ch1')`。

### 4. 路由層

- `src/app/router/index.ts` 改為從 `chapters` config 自動產生內容路由：每個 chapter 對應一條 route，path 取自 entry.path，component 統一為 `ChapterView.vue`。
- 保留 `/`、`/grammar` 與既有 routes 不動。
- 不引入 `/chapter/:id` 動態路由形式 —— 保留 `/ch1` 路徑（lazy import 對應 data，URL 漂亮）。未來達到大量章節時，路由產生邏輯本身已是 config-driven，可直接增章不需動 router。

### 5. 清理

- 刪除 `src/modules/ch1/views/Ch1View.vue`（內容已搬到 data + generic view）。
- 刪除 `src/modules/ch1/` 整個資料夾（components 也搬到 `src/modules/chapters/components/`，因為它們是 chapter 通用元件，不是 ch1 特定）。
- 對應更新所有 import 路徑。

### 6. 既有功能保證

- 閱讀書籤 (`useReadingBookmark`)：仍以 chapter id 為 key，行為不變。
- 底線單字回跳 (`useUnderlinkBacklink` + `BackToWordFab`)：data 模組保留 `hl()` 產出 `data-target`，行為不變。
- 快捷導覽 (`SectionQuickNav`) + 回頂 fab (`BackToTopFab`)：用動態 chapter id 重建 sections array，行為不變。

## Non-Goals

- 不引入 `/chapter/:id` URL 形式——保留每章自己的 path（如 `/ch1`），讓 URL 對使用者友善。
- 不引入 search / filter / 章節分組 UI——本變更只處理「資料化」，UX 擴充留給後續變更（達 20+ 章再做）。
- 不改 PWA Service Worker 快取策略——按需快取章節資料留給後續變更。
- 不改 HomeView 列表行為（仍 v-for chapters），不引入分頁 / 搜尋。
- 不調整 NavBar dropdown 行為（最近一輪變更已加 `max-h-` overflow-y-auto 足夠 20+ 章捲動）。
- 不轉成 JSON 資料（保留 TS 模組以便 type check + `hl()` template literal）。
- 不擴充 `ChapterData` 加入 MP3 / 音檔欄位——既有 `Mp3Player` 仍接 `mp3Src` prop，等真有 MP3 時再加。
- 不引入 Pinia store / IndexedDB 快取章節資料——dataLoader + dynamic import 已足夠，瀏覽器自動快取。

## Alternatives Considered

**A. 把資料存 JSON 而非 TS 模組**：較易由非工程師編輯，但失去 type check 與 `hl()` template literal helper（hl 函式用來在英文句子中包裹底線單字，產生 `data-target="vocab-xxx"` HTML）。淘汰。

**B. 動態路由 `/chapter/:id`**：URL 變 `/chapter/ch1`，醜且 SEO 不友善。淘汰。

**C. inline 在 chapters.ts 整個 data**：chapters.ts 會跟 Ch1View.vue 一樣肥。淘汰。

**D. 用 Pinia store 管 chapter data**：對「靜態檔讀進來、不會被修改」的資料用全域 store 是過度工程，瀏覽器 module cache + dynamic import 已自動處理。淘汰。

**E. 把 `hl()` 從 data 模組分離成獨立 helper**：可以，但每個 chapter data 都會呼叫 hl，與其分離不如就放 `src/modules/chapters/utils/highlight.ts` 並由 data 模組 import。本變更採此安排。

## Impact

- Affected specs: `chapter-data-architecture`
- Affected code:
  - New:
    - src/modules/chapters/types.ts
    - src/modules/chapters/utils/highlight.ts
    - src/modules/chapters/data/ch1.ts
    - src/modules/chapters/ChapterView.vue
    - src/modules/chapters/components/SceneBlock.vue
    - src/modules/chapters/components/WordTag.vue
    - src/modules/chapters/components/PhraseCard.vue
    - src/modules/chapters/components/SentenceBreakdown.vue
    - src/__tests__/ChapterView.test.ts
    - src/__tests__/chapterDataModule.test.ts
  - Modified:
    - src/shared/config/chapters.ts
    - src/app/router/index.ts
    - src/__tests__/router.test.ts
  - Removed:
    - src/modules/ch1/views/Ch1View.vue
    - src/modules/ch1/components/SceneBlock.vue
    - src/modules/ch1/components/WordTag.vue
    - src/modules/ch1/components/PhraseCard.vue
    - src/modules/ch1/components/SentenceBreakdown.vue
    - src/__tests__/Ch1View.test.ts
