## Why

ch3「傳統學習法為何無法帶來流暢」是計畫中的第三篇學習章節，內容來自 Slow English Podcast（https://www.youtube.com/watch?v=s00opMSNcJI）。本集涵蓋四大主題：傳統學習法的侷限、慢速聆聽與影子跟讀技巧、克服口說猶豫，以及一致性練習的重要性。字幕已完成錯誤審查（OCR 修正、重複段落刪除）與詞彙整理，可進入實作階段。

## What Changes

- `src/shared/config/chapters.ts`：新增 ch3 章節登錄（`id: 'ch3'`, `path: '/ch3'`）
- `src/modules/chapters/data/ch3.ts`：新建 ch3 章節資料，包含：
  - 10 個雙語 scene 物件（依四大主題切割：傳統學習法 ×3、影子跟讀 ×3、克服猶豫 ×2、一致性練習 ×2）
  - 4 組 vocabGroups（共 23 個單字，依主題分組）
  - 1 個 phrase 卡（speak/think out loud）
  - `sourceSrc` 來源網址
- `src/__tests__/ChapterView.test.ts`：新增 ch3 動態 section 測試組（quick-nav 按鈕數、bilingual section 存在、10 個 scene 存在）
- `tests/e2e/ch3.smoke.spec.ts`：新建 ch3 E2E smoke 測試
- `tests/e2e/app-shell.smoke.spec.ts`：加入 `/ch3` 至路由煙霧測試清單

## Non-Goals

- 本次不建立 breakdowns（句型解析）卡：使用者尚未提供句型拆解資料，留待後續 change 補充
- 不新增 MP3 音源（`mp3Src: null`）

## Capabilities

### New Capabilities

- `ch3-content`: ch3 章節頁面可透過 /ch3 存取，提供雙語全文（10 scenes）、23 個重點單字（4 組）、1 個片語卡，並附 YouTube 來源連結

### Modified Capabilities

(none)

## Impact

- Affected specs: ch3-content（新建）
- Affected code:
  - New: src/modules/chapters/data/ch3.ts, tests/e2e/ch3.smoke.spec.ts
  - Modified: src/shared/config/chapters.ts, src/__tests__/ChapterView.test.ts, tests/e2e/app-shell.smoke.spec.ts
