## 1. TDD — 先寫失敗的測試（Red 階段）

- [x] 1.1 [P] 更新 `src/__tests__/ChapterView.test.ts`，新增 ch3 動態 section 測試組，滿足「Ch3 has a full-text bilingual article with 10 scenes」與「Ch3 quick-nav shows 3 buttons」需求：新增 `describe('ChapterView (id="ch3") — dynamic sections (real data)', ...)` 區塊，包含：(a) quick-nav 有 3 個按鈕（全文/單字/片語）；(b) `wrapper.find('#ch3-section-bilingual').exists()` 為 true；(c) `wrapper.findAll('[data-testid^="scene-"]').length` 等於 10；(d) 顯示 ch3 章節標題。驗證：執行 `npx vitest run src/__tests__/ChapterView.test.ts` — ch3 測試此時應 FAIL（紅，因 ch3.ts 尚未建立）。

- [x] 1.2 [P] 新建 `tests/e2e/ch3.smoke.spec.ts`，滿足「Ch3 chapter page is accessible at /ch3」與「Full-text section is rendered」需求：包含 4 個測試：(a) 頁面標題正確且無 console error；(b) quick-nav 有 3 個按鈕且順序為 全文/單字/片語；(c) `#ch3-section-bilingual` 可見；(d) `#ch3-section-vocabulary` 與 `#ch3-section-phrases` 均可見。驗證：目視確認測試斷言正確（此時 E2E 執行會 FAIL，因路由尚未建立）。

- [x] 1.3 [P] 更新 `tests/e2e/app-shell.smoke.spec.ts`，在 `routes` 陣列加入 `{ path: '/ch3', selector: 'main' }`，確保 app-shell 煙霧測試也涵蓋 ch3 路由。驗證：檢視檔案確認新增正確。

## 2. 實作 — 填入資料（Green 階段）

- [x] 2.1 [P] 在 `src/shared/config/chapters.ts` 新增 ch3 章節登錄，格式參考現有 ch1、ch2 條目：`{ id: 'ch3', path: '/ch3', dataLoader: () => import('../modules/chapters/data/ch3') }`。驗證：`npm run typecheck` 無型別錯誤。

- [x] 2.2 [P] 建立 `src/modules/chapters/data/ch3.ts`，滿足「Ch3 has a full-text bilingual article with 10 scenes」、「Ch3 has vocabulary groups and a phrase card」與「Ch3 displays source attribution」需求：匯入 `hl` from `'../utils/highlight'`，匯入 `ChapterData` type；填入 `headerTitleZh`/`headerTitleEn`/`headerPodcastLabel`；`sourceSrc: 'https://www.youtube.com/watch?v=s00opMSNcJI'`；`scenes` 陣列含 10 個雙語 scene 物件（scene-01～scene-10），依四大主題分配：傳統學習法侷限 ×3（scenes 01-03）、慢速聆聽與影子跟讀 ×3（scenes 04-06）、克服口說猶豫 ×2（scenes 07-08）、一致性練習 ×2（scenes 09-10）；`vocabGroups` 含 4 組共 23 個單字（主題一心態與情緒5個：panic/hesitation/motivation/mindset/willingness；主題二學習過程7個：progress/novelty/incomplete/attempt/predict/measure/accelerate；主題三語言與表達6個：psychological/chunk/react/reaction/conquer/philosophically；主題四其他詞彙5個：jaw/opinion/judge/strengthen/present）；`phrases` 含 1 個片語卡（id: 'vocab-speak-out-loud'，speak out loud / think out loud）；`breakdowns: []`。詳細格式參考 `_private/propose.md` 的 vocabGroups 與 phrases 草稿。驗證：執行 `npx vitest run src/__tests__/ChapterView.test.ts` — ch3 所有測試通過（綠）；`npm run typecheck` 無型別錯誤。

## 3. 驗收

- [x] 3.1 執行 `npx vitest run` 確認所有單元測試通過（包含 ch3 新測試），無任何 fail（publishPages.test.ts 的 SyntaxError 為既有問題，不在本次範圍）。

- [x] 3.2 手動開啟 `/ch3` 確認：全文區塊顯示 10 個 scene、quick-nav 有 3 個按鈕（全文／單字／片語，無句型按鈕）、單字區塊含 4 組共 23 個單字、片語區塊含 1 個片語卡、header 有 YouTube 來源連結。
