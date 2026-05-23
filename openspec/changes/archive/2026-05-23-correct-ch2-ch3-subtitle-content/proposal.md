## Why

目前 ch2 與 ch3 主文來自 YouTube 字幕，已知可能有辨識錯誤，且來源提案明確指出先前整理版本漏掉太多主文內容。現在需要修正既有章節內容，讓 ch2/ch3 的中英對照主文以逐字稿為唯一來源進行完整補齊與保守校正，避免學習者看到摘要化或缺段的文章；同時把這個校正規則延伸到之後新增的 subtitle/transcript-backed chapter routes。

## What Changes

- 修正 ch2 主文：補齊 listening、repetition、shadowing、understanding before fluency、passive exposure 等段落群，保留原教學節奏與重複感。
- 補回 ch2 開場逐字稿中的獨立問題 `How many words should I memorize?`，避免把「單字背誦」學習迷思摘要掉。
- 重新逐段校對 `_private/discuss.txt`，用代表性逐字稿句子鎖住 ch2/ch3 不得再次摘要化或漏稿。
- 新增 line-break-normalized transcript coverage 檢查：先移除來源字幕斷行並壓平空白，再拿代表性逐字稿訊號對照 ch2/ch3 data，降低因 YouTube 字幕換行造成漏稿誤判。
- 修正 ch3 主文：補齊 traditional study limitations、slow listening + shadowing、hesitation、clear communication、consistency 等段落群。
- 校正明顯 YouTube 字幕錯誤，例如斷字、拼字、文法、大小寫、句點切錯與明顯 ASR 誤聽；不得把逐字稿中的重複問句、重複教學節奏或重複段落視為應刪除內容。
- 之後新增的 subtitle/transcript-backed chapter routes 也必須採同一校正規則：只修正文法、拼字、斷字、明顯 ASR 錯字與標點，不因內容重複而摘要、合併或刪除。
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

- ch2-content: ch2 主文必須完整涵蓋來源提案列出的 listening、grammar/vocabulary memorization question、repetition、shadowing、understanding 與 passive exposure 段落群，保留逐字稿中的唯一語意句，並修正明顯字幕錯誤。
- ch3-content: ch3 主文必須完整涵蓋來源提案列出的 traditional study、slow listening + shadowing、hesitation、consistency 段落群，保留逐字稿中的唯一語意句，並修正明顯字幕錯誤。
- chapter-data-architecture: 之後新增以字幕或逐字稿作為來源的 chapter route，其 data module 必須保留來源中的重複字句、問句、教學節奏與重複段落，校正只限文法、拼字、斷字、明顯 ASR 與標點。

## Impact

- Affected specs: ch2-content, ch3-content, chapter-data-architecture
- Affected code:
  - Modified: src/modules/chapters/data/ch2.ts
  - Modified: src/modules/chapters/data/ch3.ts
  - Modified: src/__tests__/ChapterView.test.ts
  - Modified: tests/e2e/ch2.smoke.spec.ts
  - Modified: tests/e2e/ch3.smoke.spec.ts
