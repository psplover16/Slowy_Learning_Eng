## Why

目前 Slowy Learning Eng 只有 `/ch1`–`/ch4` 四個章節路由，缺乏依 CEFR 難度分級的播放清單型學習路徑。新增 MissHoney YouTube 頻道的 A1–B2 四個播放清單路由，讓使用者可以依照難度從基礎到中高級循序學習。

## What Changes

- 新增 `/a1`、`/a2`、`/b1`、`/b2` 四個播放清單入口路由，各對應 MissHoney YouTube 播放清單一個難度等級
- 新增 `/a1/:videoSlug`、`/a2/:videoSlug`、`/b1/:videoSlug`、`/b2/:videoSlug` 影片子頁路由，slug 格式為 `ch[倒序編號]-[英文標題-kebab-case]`（倒序編號只計算可學習影片，skipped 影片不佔編號）
- 新增 `scripts/misshoney/` 自動匯入工具：以 `yt-dlp` 抓取 A1–B2 播放清單清冊與公開英文字幕/自動英文字幕，輸出 raw inventory、transcripts、skipped report 到 `_private/misshoney/`
- 新增 MissHoney 內容 scaffold、AI authoring、驗證與 promotion 流程：工具只把 raw transcripts 整理成可撰寫 scaffold；真正的中英對照、vocabGroups、phrases 由 apply agent 依 transcript 寫成 `PlaylistVideoData` JSON，再由 validator 驗證後接入 app routes
- 新增 `src/modules/playlists/` 模組，包含 `PlaylistView.vue`（播放清單列表頁）、`PlaylistVideoView.vue`（影片學習內容子頁）、`types.ts`（PlaylistData、PlaylistVideoEntry、PlaylistVideoData 型別）
- 新增 `src/modules/playlists/data/a1.ts`、`a2.ts`、`b1.ts`、`b2.ts`，由 import inventory 與完成的 content JSON 建立 metadata；可學習影片接入 `contentLoader`，不可用影片列入 skipped report
- 新增 `src/modules/playlists/data/videos/<level>/` 子資料夾，放入所有可學習影片的完整 JSON 內容
- 新增 `src/shared/config/playlists.ts` 播放清單設定
- 新增 `src/modules/home/composables/useMissHoneyCompletion.ts`，使用 localStorage key `slowy:miss-honey-completion` 追蹤各影片完成狀態
- 修改 `src/app/router/index.ts`，新增上述路由
- 修改 `src/modules/home/views/HomeView.vue`，在現有文章列表下方新增 MissHoney 獨立區塊，放 A1/A2/B1/B2 純導航卡片
- 修改 `src/shared/components/NavBar.vue`，新增 MissHoney 下拉選單（left-0、w-max max-w-[calc(100vw-11rem)]），樣式沿用現有「內容」選單
- 修改 `src/shared/config/storageKeys.ts`，補入 `MISS_HONEY_COMPLETION: 'slowy:miss-honey-completion'`
- 修改 `src/modules/home/components/ArticleListItem.vue`，新增可選 `showCompletion` prop（預設 true），供首頁 MissHoney 導航卡片隱藏完成圈圈

## Non-Goals

- 不修改 `/ch1`–`/ch4` 任何現有內容或行為
- 不為播放清單影片建立 `/ch5`、`/ch6` 等 chapter route
- 不提取會員限定、私人、下架或無英文字幕影片的字幕
- 不要求使用者手動抓取或貼上 YouTube 字幕；字幕取得必須由 import tool 自動嘗試
- 不新增登入 YouTube 或繞過權限限制的功能
- NavBar 窄螢幕擠壓問題刻意暫緩，此次不處理
- 不保證會員限定、私人、下架、地區限制或無公開英文字幕影片可被納入學習內容；這些影片只進 skipped report

## Capabilities

### New Capabilities

- `misshoney-playlist-routes`: 四個 CEFR 難度等級的播放清單入口路由（/a1、/a2、/b1、/b2）及影片子頁路由
- `misshoney-video-content`: 各影片的中英對照學習內容（含 ready/pendingTranscript/skipped 三種狀態），所有可取得英文字幕的影片都要接入完整 JSON 內容
- `misshoney-import-tool`: 自動抓取 MissHoney 播放清單清冊、公開英文字幕/自動字幕，並輸出可重跑的 raw inventory/transcript/skipped report
- `misshoney-content-generation`: 將 raw transcripts scaffold 成可撰寫素材，要求 apply agent 產出完整 `PlaylistVideoData` JSON，並透過 validation/promotion 確保所有可學習影片都有對應路由內容
- `misshoney-completion-tracking`: 使用 localStorage 追蹤各影片完成狀態，使用獨立 key 與既有 chapter 完成狀態隔離
- `misshoney-navbar-entry`: NavBar 新增 MissHoney 下拉選單，提供 A1–B2 快速導航
- `misshoney-homepage-section`: 首頁新增 MissHoney 獨立區塊，放 A1/A2/B1/B2 導航卡片

### Modified Capabilities

- `app-navigation`: NavBar 新增 MissHoney 下拉按鈕
- `article-list`: 首頁新增 MissHoney 區塊（現有文章列表不受影響）

## Impact

- Affected specs: misshoney-playlist-routes, misshoney-video-content, misshoney-import-tool, misshoney-content-generation, misshoney-completion-tracking, misshoney-navbar-entry, misshoney-homepage-section, app-navigation, article-list
- Affected code:
  - New:
    - src/modules/playlists/PlaylistView.vue
    - src/modules/playlists/PlaylistVideoView.vue
    - src/modules/playlists/types.ts
    - src/modules/playlists/data/a1.ts
    - src/modules/playlists/data/a2.ts
    - src/modules/playlists/data/b1.ts
    - src/modules/playlists/data/b2.ts
    - src/modules/playlists/data/videos/<level>/<slug>.json
    - src/shared/config/playlists.ts
    - src/modules/home/composables/useMissHoneyCompletion.ts
    - scripts/misshoney/sources.json
    - scripts/misshoney/import-core.mjs
    - scripts/misshoney/import-playlists.mjs
    - scripts/misshoney/content-core.mjs
    - scripts/misshoney/scaffold-content.mjs
    - scripts/misshoney/promote-content.mjs
    - scripts/misshoney/validate-content.mjs
    - _private/misshoney/README.md
    - _private/misshoney/import-summary.json
    - _private/misshoney/content-scaffolds/<level>/<slug>.json
    - _private/misshoney/generated-content/<level>/<slug>.json
  - Modified:
    - package.json
    - PROJECT_ARCHITECTURE.md
    - src/app/router/index.ts
    - src/modules/home/views/HomeView.vue
    - src/shared/components/NavBar.vue
    - src/shared/config/storageKeys.ts
    - src/modules/home/components/ArticleListItem.vue
