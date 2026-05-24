## Why

使用者要把 MissHoney A1/A2/B1/B2 播放清單詳細頁從品質不穩的舊文本，直接全量重整成可學習、可驗證、可離線使用的內容頁。現在原始字幕已集中在 _private/tmp/originalContent/，可用檔案 I/O 與副代理逐支處理，避免人工逐頁修稿與跨影片內容混淆。

## What Changes

- 全量處理順序固定為 A1 全部影片、A2 全部影片、B1 全部影片、B2 全部影片，不再只停在 A1 ch1 或 paused rollout。
- 每支字幕檔各自開啟新的 english_proofreader 副代理，該副代理只處理一篇字幕，輸出到 _private/tmp/step1/<level>/<slug>.md 後即關閉。
- 支援從 .md 原始字幕直接讀取，並從 .json 原始字幕結構化抽出 transcript/text 後再送副代理，不把 metadata 當字幕處理。
- 解析每支 proofread output 的 machine-readable JSON，寫回既有 MissHoney route 使用的影片資料來源，包含全文、中英對照、單字、片語、特殊用法與文法解析。
- 維持全文 A/B/C marker 精準跳轉：單字、片語、特殊用法可 smooth scroll 到對應講解項目並回到原 marker instance；文法仍透過 quick nav 或區塊跳轉。
- 從每支影片 grammar 區塊累積 _private/tmp/grammar.md，全部完成後由 grammar_organizer 產出 _private/tmp/grammar_deal.md，合併重複文法並由簡到難排序。
- 更新 /grammar：已存在文法採補充方式，未存在文法新增到適當位置。
- 新增總驗證：覆蓋率、proofread JSON 結構、app 寫回、grammar 同步、UI 互動、lint/test/build 與驗證報告。

## Non-Goals

- 不重新從 YouTube 抓字幕；本次以 _private/tmp/originalContent/ 已下載字幕為來源。
- 不讓同一個 english_proofreader 連續處理多篇字幕。
- 不新增全文文法 D 類 marker；文法跳轉維持區塊導覽。
- 不建立一套 route 未使用的平行資料來源。
- 不引入 runtime AI API、翻譯服務、瀏覽器端 YouTube fetch、登入或伺服器功能。

## Capabilities

### New Capabilities

(none)

### Modified Capabilities

- misshoney-content-quality-pipeline: 改為全量字幕檔 I/O proofread、逐支副代理生命週期、step1 output 結構檢查與總驗證。
- misshoney-video-content: 所有 A1/A2/B1/B2 ready video 資料需由 proofread JSON 寫回既有影片內容結構。
- misshoney-polished-learning-experience: 全量影片詳細頁需保留 A/B/C marker 精準跳轉、高亮、回原文 instance 與文法區塊導覽。
- grammar-page: MissHoney 文法需經 grammar_organizer 合併、由簡到難排序後同步到 /grammar。

## Impact

- Affected specs: misshoney-content-quality-pipeline, misshoney-video-content, misshoney-polished-learning-experience, grammar-page
- Affected code:
  - New: .codex/agents/grammar_organizer.toml, scripts/misshoney helpers for local subtitle extraction, full proofread parsing, grammar accumulation, grammar organization import, and final verification
  - Modified: .codex/agents/english_proofreader.toml, package.json, src/modules/playlists/types.ts, src/modules/playlists/PlaylistVideoView.vue, src/modules/playlists/data/videos, src/modules/grammar, PROJECT_ARCHITECTURE.md, tests
  - Removed: none
