## Why

使用者想把 MissHoney 播放清單影片頁從目前品質不穩的自動稿，升級成可真正學習的內容頁；現在要先用 A1 ch1 打通完整流程，避免一次重做 A1/A2/B1/B2 造成品質失控。此變更也要補齊 `/ch1` 類似的精準跳轉體驗，讓英文全文中的單字、片語、特殊用法 marker 能直接跳到對應講解項目。

## What Changes

- 新增單支 MissHoney 影片字幕提取流程，第一輪可針對 A1 ch1 把 YouTube 英文字幕覆寫到 `_private/tmp.txt`。
- 要求 `english_proofreader` 產出的 `proofread_result.md` 同時包含人類可讀 Markdown 與 machine-readable JSON，供主代理穩定解析。
- 擴充 MissHoney 影片內容資料，使英文全文可用 structured inline tokens 表示單字、片語、特殊用法 marker；中文翻譯不做 marker 跳轉。
- 新增「特殊用法」獨立區塊，不併入單字或片語。
- 影片頁支援 marker 精準跳轉到單一講解項目、目標置中、短暫高亮，以及從講解項目回到原本全文 marker instance。
- 文法 / 句型解析只透過 quick nav 或區塊按鈕跳轉；全文 inline marker 不跳文法。
- 第一輪真正執行 A1 ch1 vertical slice：字幕提取、呼叫 `english_proofreader`、解析 JSON、寫回 A1 ch1 JSON、保守補充 grammar route、驗證互動與內容品質。
- tasks 會完整規劃 A1/A2/B1/B2 後續批次，但第一輪 apply 只執行基礎能力與 A1 ch1。

## Non-Goals

- 不一次重做 A1/A2/B1/B2 全部影片內容。
- 不積極重構 grammar schema；分類不確定的文法先留在影片頁文法區。
- 不讓中文翻譯 marker 可點擊。
- 不做 hover tooltip。
- 不修改既有 `/ch1` 到 `/ch4` 的學習內容與導覽行為。
- 不加入需要登入 YouTube、繞過權限或依賴 runtime 外部 API 的功能。

## Capabilities

### New Capabilities

(none)

### Modified Capabilities

- `misshoney-content-quality-pipeline`: 增加單支字幕提取、`english_proofreader` JSON 輸出契約、proofread result parser、A1 ch1 vertical slice 與後續批次控管要求。
- `misshoney-polished-learning-experience`: 增加英文全文 marker 精準跳轉、目標置中、高亮、回原文 instance、特殊用法獨立區塊與文法 quick nav 邊界。
- `misshoney-video-content`: 擴充 ready video JSON 的學習內容 schema，支援 inline tokens、特殊用法、anchor id 與 lemma 合併。
- `grammar-page`: 增加 MissHoney proofread 文法的保守補充規則，明確能對上既有文法才補充。

## Impact

- Affected specs: `misshoney-content-quality-pipeline`, `misshoney-polished-learning-experience`, `misshoney-video-content`, `grammar-page`
- Affected code:
  - New: `.codex/agents/english_proofreader.toml`, `scripts/misshoney/fetch-transcript.mjs`, `scripts/misshoney/parse-proofread-result.mjs`, tests for transcript fetch/parser/navigation smoke
  - Modified: `package.json`, `src/modules/playlists/types.ts`, `src/modules/playlists/PlaylistVideoView.vue`, `src/modules/playlists/components/*`, `src/modules/playlists/composables/*`, `src/modules/playlists/data/videos/a1/ch1-slow-english-for-beginners-a1-listening-practice.json`, `src/modules/grammar/*`, `scripts/misshoney/content-core.mjs`, `PROJECT_ARCHITECTURE.md`
  - Removed: none
