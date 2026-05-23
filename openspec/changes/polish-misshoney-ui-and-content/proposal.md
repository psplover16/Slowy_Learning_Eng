## Why

目前 MissHoney A1–B2 已能匯入字幕並產生路由，但 UI 與既有 ch1 章節體驗落差明顯；影片內容也仍是未校稿的機器草稿，英文斷句、中文翻譯、單字片語挑選都不足以作為正式學習內容。現在需要把 MissHoney 從「可開啟的草稿」提升成與既有文章章節一致、可閱讀、可離線學習的正式內容。

## What Changes

- 首頁 MissHoney 區塊的 A1–B2 導航卡片之間必須有穩定 gap，且不影響 ch1–ch4 文章列表既有間距
- A1–B2 播放清單詳細列表改為參考首頁文章列表卡片樣式，包含標題、副標、完成切換位置與 hover/focus 行為
- MissHoney 影片內容頁改為參考 ch1 閱讀版型，包含 header、section quick nav、編號章節標題、中英分行、單字、片語與句型解析區塊
- MissHoney 內容資料結構補齊正式閱讀頁需要的欄位，例如 scene title、vocab group title、KK/詞性/繁中解釋、phrase examples、sentence breakdowns
- 內容產製流程加入校稿門檻：字幕 cue 必須先重建自然英文句子，再產生自然繁中翻譯、教學用單字片語與句型解析
- 既有 A1–B2 影片 JSON 內容不可視為正式稿，必須依新的內容品質規則重新產生或校稿後再 promote
- 尚未完成的 A2、B1、B2 校稿改由 AI 執行：在盡量保留完整字幕內容的前提下，檢查並修正翻譯、英文拼字、語法、斷句、單字片語與句型解析錯誤
- validator 必須檢查新 schema 與基本品質條件，避免殘留明顯 cue 斷句、空翻譯、過長未切分段落或缺少句型解析
- 離線資料仍以 repository 內 JSON 為唯一 runtime 來源；app runtime 不連 YouTube、翻譯服務或 AI API

## Non-Goals

- 不修改 ch1–ch4 既有內容資料本身
- 不新增 YouTube 登入、cookies 匯入、會員內容繞過或 runtime 字幕抓取
- 不在瀏覽器 runtime 內呼叫 AI、翻譯 API 或外部內容服務
- 不要求人工逐支校稿尚未完成的 A2、B1、B2 內容；這些內容由 apply 階段的 AI 校稿完成，再用 validator 與抽查紀錄驗收
- 不要求一次把所有 MissHoney 內容改寫成與 ch1 完全同等篇幅；但每支 ready 影片必須達到可閱讀、可學習、無明顯機器草稿痕跡的最低品質
- 不處理 NavBar 窄螢幕擠壓問題，除非本次 UI 變更造成新的 regression

## Capabilities

### New Capabilities

- `misshoney-polished-learning-experience`: MissHoney 首頁入口、播放清單列表與影片內容頁的正式閱讀體驗
- `misshoney-content-quality-pipeline`: MissHoney 字幕轉學習內容的校稿、驗證與 promotion 品質門檻

### Modified Capabilities

- `article-list`: 首頁文章列表下方的 MissHoney 導航區塊需要穩定卡片間距，並維持文章列表既有樣式不變

## Impact

- Affected specs: misshoney-polished-learning-experience, misshoney-content-quality-pipeline, article-list
- Affected code:
  - Modified:
    - src/modules/home/views/HomeView.vue
    - src/modules/home/components/ArticleListItem.vue
    - src/modules/playlists/PlaylistView.vue
    - src/modules/playlists/PlaylistVideoView.vue
    - src/modules/playlists/types.ts
    - src/modules/playlists/data/a1.ts
    - src/modules/playlists/data/a2.ts
    - src/modules/playlists/data/b1.ts
    - src/modules/playlists/data/b2.ts
    - scripts/misshoney/content-core.mjs
    - scripts/misshoney/content-core.d.mts
    - scripts/misshoney/scaffold-content.mjs
    - scripts/misshoney/promote-content.mjs
    - scripts/misshoney/validate-content.mjs
    - src/__tests__/contentCore.test.ts
    - src/__tests__/PlaylistView.test.ts
    - src/__tests__/PlaylistVideoView.test.ts
  - New:
    - src/modules/playlists/components/PlaylistReadingHeader.vue
    - src/modules/playlists/components/PlaylistSceneBlock.vue
    - src/modules/playlists/components/PlaylistWordTag.vue
    - src/modules/playlists/components/PlaylistPhraseCard.vue
    - src/modules/playlists/components/PlaylistSentenceBreakdown.vue
    - src/modules/playlists/composables/usePlaylistReadingSections.ts
    - src/__tests__/HomeView.test.ts
    - tests/e2e/misshoney-polished-content.spec.ts
  - Removed: none
