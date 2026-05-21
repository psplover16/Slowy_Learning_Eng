## Why

ch2 目前 `scenes: []`，學習者看到的是單字／片語／句型卡片，但缺少文章原文脈絡，無法看到詞彙在真實語境中的用法。加入雙語全文讓學習者能先讀完文章、再查看重點分析，提升學習深度與連貫性。

## What Changes

- `src/modules/chapters/data/ch2.ts`：`scenes: []` 改為 10 個雙語 scene，每句附中文翻譯；關鍵詞以 `hl()` 連結至對應的 vocab/phrases id
- `src/__tests__/ChapterView.test.ts`：ch2 的 quick-nav 按鈕從 3 個（單字／片語／句型）改為 4 個（全文／單字／片語／句型）；「bilingual section is NOT in DOM」測試改為「bilingual section IS in DOM」
- `tests/e2e/ch2.smoke.spec.ts`：nav 按鈕斷言從 3 個改為 4 個；`#ch2-section-bilingual` 改為驗證存在而非缺席

## Non-Goals

- 不修改 ch2 的 vocab、phrases、breakdowns 內容（已完成）
- 不加入 mp3 音檔（mp3Src 維持 null）
- 不修改其他章節的任何檔案

## Capabilities

### New Capabilities

（none）

### Modified Capabilities

- `ch2-content`：「Ch2 has no full-text article」需求改為「Ch2 has a full-text bilingual article with 10 scenes」；quick-nav 從 3 按鈕改為 4 按鈕（加回「全文」）

## Impact

- Affected specs: `ch2-content`（修改現有需求）
- Affected code:
  - Modified: `src/modules/chapters/data/ch2.ts`, `src/__tests__/ChapterView.test.ts`, `tests/e2e/ch2.smoke.spec.ts`
  - New: (none)
  - Removed: (none)
