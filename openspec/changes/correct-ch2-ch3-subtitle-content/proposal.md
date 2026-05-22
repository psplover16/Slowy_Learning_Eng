## Why

目前 ch2 與 ch3 主文來自 YouTube 字幕，已知可能有辨識錯誤，且來源提案明確指出先前整理版本漏掉太多主文內容。現在需要修正既有章節內容，讓 ch2/ch3 的中英對照主文以逐字稿為唯一來源進行完整補齊與保守校正，避免學習者看到摘要化或缺段的文章。

## What Changes

- 修正 ch2 主文：補齊 listening、repetition、shadowing、understanding before fluency、passive exposure 等段落群，保留原教學節奏與重複感。
- 補回 ch2 開場逐字稿中的獨立問題 `How many words should I memorize?`，避免把「單字背誦」學習迷思摘要掉。
- 修正 ch3 主文：補齊 traditional study limitations、slow listening + shadowing、hesitation、clear communication、consistency 等段落群。
- 校正明顯 YouTube 字幕錯誤，例如斷字、錯字、重複字、大小寫、句點切錯與明顯 ASR 誤聽。
- 對疑似重複字幕採保守處理：只有確認是同一段重複輸出時才整理成單一校正版，且不得丟失唯一語意。
- 保持既有 chapter data 架構、路由與 UI，不新增章節或功能。
- 實作 ch2/ch3 時可參照既有 ch1 route 的 registry、ChapterData module、ChapterView 渲染與 smoke test 模式，確保新內容沿用同一條資料驅動章節路徑。

## Non-Goals

- 不重新創作 ch2/ch3 為全新英文文章。
- 不把逐字稿改寫成短版摘要。
- 不新增 ch4 或其他章節。
- 不新增學習功能、測驗功能、SRS、音訊播放器功能或新的資料來源。
- 不依賴 `_private/propose.md` 以外的需求來源來擴張本次 scope。
- 不修改 ch1 內容、ch1 route 行為或 ch1 驗收基準；ch1 只作為實作參照。

## Capabilities

### New Capabilities

(none)

### Modified Capabilities

- ch2-content: ch2 主文必須完整涵蓋來源提案列出的 listening、grammar/vocabulary memorization question、repetition、shadowing、understanding 與 passive exposure 段落群，並修正明顯字幕錯誤。
- ch3-content: ch3 主文必須完整涵蓋來源提案列出的 traditional study、slow listening + shadowing、hesitation、consistency 段落群，並修正明顯字幕錯誤。

## Impact

- Affected specs: ch2-content, ch3-content
- Affected code:
  - Modified: src/modules/chapters/data/ch2.ts
  - Modified: src/modules/chapters/data/ch3.ts
  - Modified: src/__tests__/ChapterView.test.ts
  - Modified: tests/e2e/ch2.smoke.spec.ts
  - Modified: tests/e2e/ch3.smoke.spec.ts
