## 1. TDD — 先寫失敗的測試（Red 階段）

- [x] 1.1 [P] 更新 `src/__tests__/ChapterView.test.ts` 中 ch2 相關的測試，滿足「Ch2 has a full-text bilingual article with 10 scenes」、「Quick-nav shows 4 buttons including 全文」與「Ch2 has no full-text article」（移除）需求：將 `'bilingual section is NOT in DOM'` 測試改為 `'bilingual section IS in DOM'`（斷言 `wrapper.find('#ch2-section-bilingual').exists()` 為 true）；將 quick-nav 按鈕數斷言從 3 改為 4，並驗證按鈕順序為 全文/單字/片語/句型；新增斷言 `wrapper.findAll('[data-testid^="scene-"]').length` 等於 10。驗證：執行 `npx vitest run src/__tests__/ChapterView.test.ts` — ch2 相關測試此時應 FAIL（紅）。

- [x] 1.2 [P] 更新 `tests/e2e/ch2.smoke.spec.ts`，滿足「Quick-nav shows 4 buttons including 全文」與「Full-text section is rendered」需求：刪除 `'bilingual full-text section is absent from DOM'` 測試；新增 `'bilingual section #ch2-section-bilingual is visible'` 測試（用 `page.locator('#ch2-section-bilingual')`）；將 quick-nav 按鈕數斷言從 3 改為 4，並驗證第一個按鈕為 `'全文'`。驗證：檢視測試內容確認斷言正確；此時 E2E 測試在實際執行時會 FAIL（因 ch2.ts 仍是空 scenes）。

## 2. 實作 — 填入全文資料（Green 階段）

- [x] 2.1 在 `src/modules/chapters/data/ch2.ts` 的 `scenes: []` 改為 10 個雙語 scene 物件，滿足「Ch2 has a full-text bilingual article with 10 scenes」與「Scenes contain bilingual sentences with vocab links」需求：匯入 `hl` from `'../utils/highlight'`；每個 scene 包含 `id`（scene-01 ~ scene-10）、`titleZh`／`titleEn`（雙語標題）、`sentences` 陣列（每句含 `en` 英文與 `tc` 中文）、`tags` 陣列；英文句中出現 `fills the gaps`、`go silent`／`fall silent`、`don't rush`、`consistency matters`、`builds ~ quietly` 等詞彙時使用 `hl()` 連結至對應 id（`vocab-fills-the-gaps`、`vocab-go-silent`、`vocab-rush`、`vocab-consistency-matters`、`vocab-builds-quietly`）；逐字稿依 `[music]` 標記切成 10 個段落，段落標題與中文翻譯由 AI 產出。驗證：執行 `npx vitest run src/__tests__/ChapterView.test.ts` — ch2 所有測試通過（綠）；`npm run typecheck` 無型別錯誤。

## 3. 驗收

- [x] 3.1 執行 `npx vitest run` 確認所有 157+ 個單元測試通過（包含 ch2 新測試），無任何 fail。滿足「Ch2 chapter page is accessible at /ch2」需求持續成立（ch2 路由仍可正常解析）。

- [x] 3.2 手動開啟 `/ch2` 確認：全文區塊顯示 10 個 scene、quick-nav 有 4 個按鈕（全文／單字／片語／句型）、關鍵詞有底線可點擊跳到對應解析卡。
