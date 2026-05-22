## Context

`_private/propose.md` 是本變更的唯一需求來源。該檔指出 ch2 與 ch3 主文來自 YouTube 字幕，可能有辨識錯誤，且先前整理版本漏掉太多內容。現有專案已經有資料驅動章節架構，ch2 與 ch3 內容分別位於 `src/modules/chapters/data/ch2.ts` 與 `src/modules/chapters/data/ch3.ts`，並由 generic ChapterView 渲染。這次變更只修正既有章節資料與驗證，不改路由、UI 架構或章節資料介面。

## Goals / Non-Goals

**Goals:**

- 讓 ch2 主文完整覆蓋 `_private/propose.md` 列出的 listening、repetition、shadowing、understanding before fluency、passive exposure 等段落群。
- 補回 ch2 開場逐字稿中的 `How many words should I memorize?`，保留 grammar / vocabulary memorization 兩種常見錯誤起點。
- 讓 ch3 主文完整覆蓋 `_private/propose.md` 列出的 traditional study limitations、slow listening + shadowing、hesitation、clear communication、consistency 等段落群。
- 校正 `_private/propose.md` 指出的明顯 YouTube 字幕錯誤，並保留主文的主要語意、段落順序、教學節奏與重複練習感。
- 補強測試，讓 ch2/ch3 主文不是短摘要，且關鍵段落群與代表性修正可以被驗證。
- 參照既有 ch1 route 的 registry、ChapterData module、ChapterView 渲染與 smoke test 模式，讓 ch2/ch3 的內容修復維持同一條章節實作路徑。

**Non-Goals:**

- 不新增 ch4 或任何新章節。
- 不改 ChapterData interface、ChapterView layout、quick-nav behavior、MP3 player、SRS、測驗或路由生成機制。
- 不依賴 `_private/propose.md` 以外的新需求來源擴張內容。
- 不把字幕主文改寫成全新文章或短版摘要。
- 不修改 ch1 內容、route、測試期望或使用者可見行為；ch1 只作為實作參照。

## Decisions

### Preserve chapter data architecture and update only chapter content

ch2/ch3 仍使用現有 ChapterData data modules。實作時只更新 `scenes` 中的英文與繁中句子內容，必要時同步調整 title/tags 以承載完整內容；不新增新的 renderer 或 content loader。

替代方案：新增一個專門處理字幕稿的 content pipeline。淘汰原因是本次需求是修復兩個既有章節內容，沒有要求新增可重用匯入流程；新增 pipeline 會超出 scope。

### Use existing ch1 route as implementation reference

ch1 是目前最完整的資料驅動章節參考路徑。實作 ch2/ch3 時可以對照 `src/shared/config/chapters.ts` 中 ch1 的 registry entry、`src/modules/chapters/data/ch1.ts` 的 ChapterData shape、`ChapterView` 對 ch1 section anchors 與 quick-nav 的渲染方式，以及既有 ch1 unit/e2e smoke 測試模式。這個參照只用來維持資料結構與驗證風格一致，不代表 ch2/ch3 必須複製 ch1 的 scene 數量、vocab 數量、breakdown 數量或文章內容。

替代方案：只看 ch2/ch3 目前檔案自行修補。淘汰原因是 ch2/ch3 目前正是被指出漏文的對象，缺少穩定參照容易再次出現資料 shape、section anchor 或 smoke test 覆蓋不一致。

### Completeness comes before prose polishing

主文修正以完整性優先。可以修正斷字、錯字、重複字、大小寫與明顯 ASR 誤聽，但不能為了讀起來精簡而刪掉 `_private/propose.md` 列出的段落群。疑似重複段落只有在確認沒有唯一語意時才能合併。

替代方案：將字幕整理成更短、更順的精讀文章。淘汰原因是來源提案明確指出問題是漏太多，短版改寫會再次造成內容缺失。

### Verify topic coverage with content-oriented tests

測試不只檢查 scene 數量，還要檢查 ch2/ch3 主文包含代表性主題群與校正結果。單元測試可從章節 data module 彙整 scenes sentence text 後檢查關鍵片語或主題標記；e2e smoke 保留 route 可渲染的驗證。

替代方案：只靠人工逐段檢查。淘汰原因是內容遺漏曾經發生，沒有測試會讓後續整理再次退化成摘要。

## Implementation Contract

- ch2 data contract：`src/modules/chapters/data/ch2.ts` 的 default export 仍符合 ChapterData。`scenes` 仍為 10 個 scene-01 到 scene-10，每個 scene 仍含 bilingual title、sentences、tags。英文主文必須覆蓋 `_private/propose.md` 的 ch2 Content Scope 所列全部段落群，且 scene-01 必須保留 `How many words should I memorize?` 這個開場學習迷思。
- ch3 data contract：`src/modules/chapters/data/ch3.ts` 的 default export 仍符合 ChapterData。`scenes` 仍為 10 個 scene-01 到 scene-10，每個 scene 仍含 bilingual title、sentences、tags。英文主文必須覆蓋 `_private/propose.md` 的 ch3 Content Scope 所列全部段落群。
- ch1 reference contract：實作時可用 ch1 route 作為參照，確認 ch2/ch3 仍透過 chapters registry 找到 route entry、透過 dataLoader 載入 ChapterData、由 ChapterView 產生章節 section anchors 與 quick-nav。不得修改 ch1 data、route 或 ch1 測試期望。
- Correction contract：明顯字幕錯誤必須修正，包括 `_private/propose.md` 表格列出的 `fram repeating more`、`habits are built t proof repetition`、`The I push themselves`、`H sounds anymore`、`new M. Oments`、`PF ect sentence`、`This builds C confidence`、`S Oh. When you speak`、`each time me you continue speaking`、`Slow podcast. TS simple conversations` 等方向性修正。
- Preservation contract：任何刪除或合併重複段落都必須保留唯一語意。最終文章不得只剩摘要，ch2/ch3 必須能逐段對照 `_private/propose.md` 的 Content Scope 與 Correction Rules。
- Verification contract：更新或新增測試，至少驗證 ch2/ch3 scene count、route smoke、主題群覆蓋、代表性字幕錯誤不再出現在 data text 中。完整驗證包含 `npm run test:unit`、`npm run build`、相關 e2e smoke，以及 `spectra validate correct-ch2-ch3-subtitle-content`。

## Risks / Trade-offs

- [Risk] 內容補齊時再次把逐字稿摘要化。→ Mitigation：spec 和 tests 都要求段落群覆蓋，tasks 要求人工回對 Content Scope。
- [Risk] 過度保守保留重複字幕，造成文章冗長。→ Mitigation：只合併確認沒有唯一語意的重複段落，保留教學節奏需要的 rhetorical repetition。
- [Risk] 校正 ASR 錯字時引入來源沒有的新論點。→ Mitigation：只修正明顯字幕錯誤與語句通順，不新增教學概念。
- [Risk] 中英對照翻譯與英文補文不同步。→ Mitigation：每個新增或修正的 English sentence 都同步提供 tc translation，並以 ChapterView tests 驗證 bilingual sentence pairs 存在。

## Migration Plan

1. 先補強 ch2/ch3 content coverage tests，讓現有漏文狀態可被偵測。
2. 更新 ch2/ch3 data modules，補齊主文並修正明顯字幕錯誤。
3. 執行 unit/build/e2e 驗證，必要時調整測試 fixture 或 route smoke。
4. 人工回對 `_private/propose.md` 的 Content Scope、Correction Rules 與 Acceptance Criteria，確認沒有大段遺漏。

Rollback 策略：若補文造成渲染或資料型別問題，回復 ch2/ch3 data modules 到上一個通過測試版本，再以較小段落分批補齊並重跑測試。

## Open Questions

無。`_private/propose.md` 已明確要求以該檔整理出的內容範圍作為唯一輸入，並以完整補齊與保守校正為決策。
