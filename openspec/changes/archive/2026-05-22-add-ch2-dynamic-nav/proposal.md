## Why

Ch2「語言究竟是怎麼學會的」是第二篇學習章節。現行 `ChapterView.vue` 把四個導覽區塊（全文／單字／片語／句型）硬寫死，無論章節是否有對應資料都全數顯示。Ch2 沒有全文（`scenes: []`），若照現行邏輯會出現一個空白的「中英對照全文」區塊，且區塊序號也會從 2 開始，體驗不正確。

## What Changes

- 新增 `src/modules/chapters/data/ch2.ts`，收錄 Ch2 的單字、片語、句型解析（無全文）
- 在 `src/shared/config/chapters.ts` 新增 Ch2 路由條目，路徑為 `/ch2`
- 修改 `src/modules/chapters/ChapterView.vue`：
  - `quickNavSections` computed 改為依資料陣列長度動態篩選，空陣列的區塊不產生按鈕
  - 各 `<section>` 加上 `v-if`，空陣列時不渲染
  - 區塊序號改為動態自動遞增（1, 2, 3…），不再硬寫 1/2/3/4

## Non-Goals

- Ch2 不收錄全文（scenes 維持空陣列），不加音檔
- Ch1 的行為與資料不受影響
- 不新增 mp3 / 音訊支援
- 不修改 `SectionQuickNav.vue` 本身（只調整傳入的資料）

## Capabilities

### New Capabilities

- `ch2-content`: Ch2 章節頁面，內含單字、片語、句型解析，路由為 `/ch2`
- `chapter-dynamic-sections`: ChapterView 依章節資料決定顯示哪些區塊與按鈕，並動態計算區塊序號

### Modified Capabilities

（無——現有 spec 均不受此變更影響）

## Impact

- Affected specs: `ch2-content`（新建）、`chapter-dynamic-sections`（新建）
- Affected code:
  - New: `src/modules/chapters/data/ch2.ts`
  - Modified: `src/shared/config/chapters.ts`, `src/modules/chapters/ChapterView.vue`
  - Removed: （無）
