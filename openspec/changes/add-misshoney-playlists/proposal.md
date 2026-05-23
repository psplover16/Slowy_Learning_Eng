## Why

目前 Slowy Learning Eng 只有 `/ch1`–`/ch4` 四個章節路由，缺乏依 CEFR 難度分級的播放清單型學習路徑。新增 MissHoney YouTube 頻道的 A1–B2 四個播放清單路由，讓使用者可以依照難度從基礎到中高級循序學習。

## What Changes

- 新增 `/a1`、`/a2`、`/b1`、`/b2` 四個播放清單入口路由，各對應 MissHoney YouTube 播放清單一個難度等級
- 新增 `/a1/:videoSlug`、`/a2/:videoSlug`、`/b1/:videoSlug`、`/b2/:videoSlug` 影片子頁路由，slug 格式為 `ch[倒序編號]-[英文標題-kebab-case]`（倒序編號只計算可學習影片，skipped 影片不佔編號）
- 新增 `src/modules/playlists/` 模組，包含 `PlaylistView.vue`（播放清單列表頁）、`PlaylistVideoView.vue`（影片學習內容子頁）、`types.ts`（PlaylistData、PlaylistVideoEntry、PlaylistVideoData 型別）
- 新增 `src/modules/playlists/data/a1.ts`、`a2.ts`、`b1.ts`、`b2.ts`，各含 metadata、影片清冊（含狀態 ready/pendingTranscript/skipped）與 skipped report；不含完整字幕學習內容
- 新增 `src/modules/playlists/data/videos/<level>/` 子資料夾，每支 ready 影片一個 JSON 檔存放完整學習內容（中英對照、單字、片語、句型），由影片子頁 lazy load
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
- 不新增登入 YouTube 或繞過權限限制的功能
- NavBar 窄螢幕擠壓問題刻意暫緩，此次不處理

## Capabilities

### New Capabilities

- `misshoney-playlist-routes`: 四個 CEFR 難度等級的播放清單入口路由（/a1、/a2、/b1、/b2）及影片子頁路由
- `misshoney-video-content`: 各影片的中英對照學習內容（Phase 2 分批填入），含 ready/pendingTranscript/skipped 三種狀態
- `misshoney-completion-tracking`: 使用 localStorage 追蹤各影片完成狀態，使用獨立 key 與既有 chapter 完成狀態隔離
- `misshoney-navbar-entry`: NavBar 新增 MissHoney 下拉選單，提供 A1–B2 快速導航
- `misshoney-homepage-section`: 首頁新增 MissHoney 獨立區塊，放 A1/A2/B1/B2 導航卡片

### Modified Capabilities

- `app-navigation`: NavBar 新增 MissHoney 下拉按鈕
- `article-list`: 首頁新增 MissHoney 區塊（現有文章列表不受影響）

## Impact

- Affected specs: misshoney-playlist-routes, misshoney-video-content, misshoney-completion-tracking, misshoney-navbar-entry, misshoney-homepage-section, app-navigation, article-list
- Affected code:
  - New:
    - src/modules/playlists/PlaylistView.vue
    - src/modules/playlists/PlaylistVideoView.vue
    - src/modules/playlists/types.ts
    - src/modules/playlists/data/a1.ts
    - src/modules/playlists/data/a2.ts
    - src/modules/playlists/data/b1.ts
    - src/modules/playlists/data/b2.ts
    - src/shared/config/playlists.ts
    - src/modules/home/composables/useMissHoneyCompletion.ts
  - Modified:
    - src/app/router/index.ts
    - src/modules/home/views/HomeView.vue
    - src/shared/components/NavBar.vue
    - src/shared/config/storageKeys.ts
    - src/modules/home/components/ArticleListItem.vue
