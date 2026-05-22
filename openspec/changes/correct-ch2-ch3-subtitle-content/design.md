## Context

`_private/propose.md` 是本變更的主要需求來源。該檔指出 ch2 與 ch3 主文來自 YouTube 字幕，可能有辨識錯誤，且先前整理版本漏掉太多內容。使用者後續補充：這裡的「校正」是文法、拼字、斷字、明顯 ASR 與標點修正，不是刪除重複字句；之後新增的 subtitle/transcript-backed routes 也必須遵守同一規則。現有專案已經有資料驅動章節架構，ch2 與 ch3 內容分別位於 `src/modules/chapters/data/ch2.ts` 與 `src/modules/chapters/data/ch3.ts`，並由 generic ChapterView 渲染。這次變更只修正既有章節資料、驗證與未來章節資料的校正契約，不改路由、UI 架構或章節資料介面。

## Goals / Non-Goals

**Goals:**

- 讓 ch2 主文完整覆蓋 `_private/propose.md` 列出的 listening、repetition、shadowing、understanding before fluency、passive exposure 等段落群。
- 補回 ch2 開場逐字稿中的 `How many words should I memorize?`，保留 grammar / vocabulary memorization 兩種常見錯誤起點。
- 讓 ch3 主文完整覆蓋 `_private/propose.md` 列出的 traditional study limitations、slow listening + shadowing、hesitation、clear communication、consistency 等段落群。
- 校正 `_private/propose.md` 指出的明顯 YouTube 字幕錯誤，並保留主文的主要語意、段落順序、教學節奏與重複練習感。
- 補強測試，讓 ch2/ch3 主文不是短摘要，且關鍵段落群與代表性修正可以被驗證。
- 將 `_private/discuss.txt` 中容易被摘要掉的獨立句意列為 required transcript signals，讓逐字稿保留可以被機械式檢查。
- 參照既有 ch1 route 的 registry、ChapterData module、ChapterView 渲染與 smoke test 模式，讓 ch2/ch3 的內容修復維持同一條章節實作路徑。
- 明確規定之後新增的 subtitle/transcript-backed chapter routes 也必須按同一校正規則處理：只修正文法、拼字、斷字、明顯 ASR 與標點，不因重複而摘要、合併或刪除。

**Non-Goals:**

- 不新增 ch4 或任何新章節。
- 不改 ChapterData interface、ChapterView layout、quick-nav behavior、MP3 player、SRS、測驗或路由生成機制。
- 不依賴 `_private/propose.md` 以外的新需求來源擴張內容。
- 不把字幕主文改寫成全新文章或短版摘要。
- 不修改 ch1 內容、route、測試期望或使用者可見行為；ch1 只作為實作參照。
- 不在本變更新增 ch4 或其他未來 route 實作；本次只建立未來 subtitle/transcript-backed route 必須遵守的校正契約。

## Decisions

### Preserve chapter data architecture and update only chapter content

ch2/ch3 仍使用現有 ChapterData data modules。實作時只更新 `scenes` 中的英文與繁中句子內容，必要時同步調整 title/tags 以承載完整內容；不新增新的 renderer 或 content loader。

替代方案：新增一個專門處理字幕稿的 content pipeline。淘汰原因是本次需求是修復兩個既有章節內容，沒有要求新增可重用匯入流程；新增 pipeline 會超出 scope。

### Use existing ch1 route as implementation reference

ch1 是目前最完整的資料驅動章節參考路徑。實作 ch2/ch3 時可以對照 `src/shared/config/chapters.ts` 中 ch1 的 registry entry、`src/modules/chapters/data/ch1.ts` 的 ChapterData shape、`ChapterView` 對 ch1 section anchors 與 quick-nav 的渲染方式，以及既有 ch1 unit/e2e smoke 測試模式。這個參照只用來維持資料結構與驗證風格一致，不代表 ch2/ch3 必須複製 ch1 的 scene 數量、vocab 數量、breakdown 數量或文章內容。

替代方案：只看 ch2/ch3 目前檔案自行修補。淘汰原因是 ch2/ch3 目前正是被指出漏文的對象，缺少穩定參照容易再次出現資料 shape、section anchor 或 smoke test 覆蓋不一致。

### Completeness comes before prose polishing

主文修正以完整性優先。可以修正斷字、拼字、文法、大小寫、標點與明顯 ASR 誤聽，但不能為了讀起來精簡而刪掉 `_private/propose.md` 列出的段落群。疑似重複段落也不能因為看起來重複就被合併；若字幕在重複處有錯字，保留重複內容並只修正錯字。

替代方案：將字幕整理成更短、更順的精讀文章。淘汰原因是來源提案明確指出問題是漏太多，短版改寫會再次造成內容缺失。

### Correction means typo and grammar cleanup, not deduplication

本變更中的「校正」只指文法錯誤、拼字錯誤、斷字、明顯 ASR 誤聽與標點斷句修正。逐字稿中的重複字句、重複問句、重複教學節奏或重複段落不應因為看起來重複就被刪除或合併。若重複處同時包含明顯字幕錯誤，做法是保留該重複句意並修正錯誤字詞。

替代方案：把重複內容整理成單一校正版。淘汰原因是使用者明確指出「校正」不是刪除重複字句；刪除重複會再次造成漏稿。

### Apply the correction rule to future transcript-backed chapter routes

之後若新增任何以 subtitle 或 transcript 作為來源的 chapter route，該 route 的 ChapterData module 必須套用同一規則：保留來源中的重複字句、重複問句、重複教學節奏與重複段落，只校正文法、拼字、斷字、明顯 ASR、大小寫與標點。若未來內容 review 發現重複逐字稿被摘要、合併或刪除，該 route content 視為未完成，必須補回重複內容後才能通過。

替代方案：只把此規則寫在 ch2/ch3 的特殊案例中。淘汰原因是使用者已明確要求之後新增的 route 也必須按照這個規則校正；若規則只存在於 ch2/ch3，未來新增章節時仍可能重複發生漏稿。

### Verify topic coverage with content-oriented tests

測試不只檢查 scene 數量，還要檢查 ch2/ch3 主文包含代表性主題群與校正結果。單元測試可從章節 data module 彙整 scenes sentence text 後檢查關鍵片語或主題標記；e2e smoke 保留 route 可渲染的驗證。

替代方案：只靠人工逐段檢查。淘汰原因是內容遺漏曾經發生，沒有測試會讓後續整理再次退化成摘要。

## Implementation Contract

- ch2 data contract：`src/modules/chapters/data/ch2.ts` 的 default export 仍符合 ChapterData。`scenes` 仍為 10 個 scene-01 到 scene-10，每個 scene 仍含 bilingual title、sentences、tags。英文主文必須覆蓋 `_private/propose.md` 的 ch2 Content Scope 所列全部段落群，且 scene-01 必須保留 `How many words should I memorize?` 這個開場學習迷思。
- ch3 data contract：`src/modules/chapters/data/ch3.ts` 的 default export 仍符合 ChapterData。`scenes` 仍為 10 個 scene-01 到 scene-10，每個 scene 仍含 bilingual title、sentences、tags。英文主文必須覆蓋 `_private/propose.md` 的 ch3 Content Scope 所列全部段落群。
- ch1 reference contract：實作時可用 ch1 route 作為參照，確認 ch2/ch3 仍透過 chapters registry 找到 route entry、透過 dataLoader 載入 ChapterData、由 ChapterView 產生章節 section anchors 與 quick-nav。不得修改 ch1 data、route 或 ch1 測試期望。
- Correction contract：明顯字幕錯誤必須修正，包括 `_private/propose.md` 表格列出的 `fram repeating more`、`habits are built t proof repetition`、`The I push themselves`、`H sounds anymore`、`new M. Oments`、`PF ect sentence`、`This builds C confidence`、`S Oh. When you speak`、`each time me you continue speaking`、`Slow podcast. TS simple conversations` 等方向性修正。
- Repetition preservation contract：不得因「句子重複」而刪除逐字稿內容。開場的 `They ask... They ask...` 節奏與 ch3 hesitation 段落的重複講述都必須在校正後保留；只修正拼字、文法、斷字與明顯 ASR 錯誤。
- Future route correction contract：之後新增的 subtitle/transcript-backed chapter route 必須保留來源逐字稿的重複字句、問句、教學節奏與重複段落；校正只限文法、拼字、斷字、大小寫、明顯 ASR 與標點斷句。若新增 route 的資料把重複逐字稿摘要、合併或刪除，該 route content 不符合驗收。
- Preservation contract：最終文章不得只剩摘要，ch2/ch3 必須能逐段對照 `_private/propose.md` 的 Content Scope 與 Correction Rules；重複段落也屬於逐字稿內容，不能只因重複而刪除或合併。
- Verification contract：更新或新增測試，至少驗證 ch2/ch3 scene count、route smoke、主題群覆蓋、代表性字幕錯誤不再出現在 data text 中。完整驗證包含 `npm run test:unit`、`npm run build`、相關 e2e smoke，以及 `spectra validate correct-ch2-ch3-subtitle-content`。
- Transcript preservation contract：除了主題群覆蓋外，Ch2/Ch3 content coverage tests 必須包含來自 `_private/discuss.txt` 的代表性逐字稿句子，尤其是曾被漏掉的 opening questions、listening-to-speaking bridge、child repetition freedom、repeat-short/easy/often guidance、slow-speaking control、traditional-study separated skills、shadowing patience、hesitation safety practice、consistency waves、identity shift、calm environment 等唯一語意。

## Risks / Trade-offs

- [Risk] 內容補齊時再次把逐字稿摘要化。→ Mitigation：spec 和 tests 都要求段落群覆蓋，tasks 要求人工回對 Content Scope。
- [Risk] 過度保守保留重複字幕，造成文章冗長。→ Mitigation：接受逐字稿式教學材料會保留重複節奏；若重複處有字幕錯誤，只修正文法、拼字、斷字、ASR 與標點，不刪除重複句意。
- [Risk] 校正 ASR 錯字時引入來源沒有的新論點。→ Mitigation：只修正明顯字幕錯誤與語句通順，不新增教學概念。
- [Risk] 中英對照翻譯與英文補文不同步。→ Mitigation：每個新增或修正的 English sentence 都同步提供 tc translation，並以 ChapterView tests 驗證 bilingual sentence pairs 存在。

## Migration Plan

1. 先補強 ch2/ch3 content coverage tests，讓現有漏文狀態可被偵測。
2. 更新 ch2/ch3 data modules，補齊主文並修正明顯字幕錯誤。
3. 將未來 subtitle/transcript-backed route 的校正規則寫入 `chapter-data-architecture` spec delta，讓後續新增 route 時可直接驗收。
4. 執行 unit/build/e2e 驗證，必要時調整測試 fixture 或 route smoke。
5. 人工回對 `_private/propose.md` 的 Content Scope、Correction Rules 與 Acceptance Criteria，確認沒有大段遺漏。

Rollback 策略：若補文造成渲染或資料型別問題，回復 ch2/ch3 data modules 到上一個通過測試版本，再以較小段落分批補齊並重跑測試。

## Open Questions

無。`_private/propose.md` 與使用者後續補充已明確要求以完整補齊、保留重複逐字稿與保守校正為決策，且同一規則套用到之後新增的 subtitle/transcript-backed routes。
