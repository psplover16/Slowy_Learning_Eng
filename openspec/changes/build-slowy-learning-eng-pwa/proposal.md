## Why

目前專案只有一份靜態 HTML 參考稿（`_private/ch1-new york travel.html`），無法在行動裝置上離線使用，也沒有學習進度追蹤或互動功能。需要以此設計語言為視覺基礎，建立可安裝、可完全離線的 PWA，讓使用者能隨時隨地透過文章學習英語口語。

## What Changes

- **全新**：以 Vue3 + Tailwind CSS + Vite 建立 SPA 骨架，含頂部固定導覽列與三條路由
- **全新**：首頁文章列表，每篇文章末端有完成標記 icon，狀態以 localStorage 持久化
- **全新**：文法頁，收錄英語常見詞性介紹與 `like` 的完整用法
- **全新**：Ch1 內容頁，以現有 HTML 為視覺參考，整合文章全文、詞彙補充（含 KK 音標 + 詞性）、句型解析，discuss.txt 所有詞彙與用法**一個不漏**全數收錄
- **全新**：段落書籤——每個段落標題可點選，記憶上次閱讀位置，下次進入該路由自動捲動回去
- **全新**：底線單字互動——點選底線單字後平滑捲動至說明區塊，右下角懸浮「回到單字」FAB 按鈕，按下後捲回**被點選的那個單字**（非說明區塊）
- **全新**：Sticky MP3 播放器——播放 / 暫停 / +5s / +10s / 音量 / 拖拉時間軸 / 重複播放；`mp3Src` prop 為空時元件不渲染（Ch1 目前無音檔）
- **全新**：PWA 支援——Service Worker 快取 HTML / CSS / JS，MP3 採 Network First + fallback；可安裝至手機主畫面

## Non-Goals

- 不實作後端 / 伺服器，純前端 PWA
- 不引入重量級 UI Kit（Vuetify、Quasar 等）
- 不做使用者帳號 / 雲端同步，所有資料僅存本機
- 文法頁初始版本只收錄**詞性介紹**與 **like 的用法**（G01–G02）；Ch1 相關句型解析留在內容頁，不放文法頁
- Ch2 以後的內容頁、N4/N5 文法進階主題均不在本次範圍

## Capabilities

### New Capabilities

- `app-navigation`: 頂部固定導覽列 + Vue Router（/ 首頁、/grammar 文法、/ch1 內容頁）
- `article-list`: 首頁文章列表，含末端完成標記 icon 與 localStorage 持久化
- `grammar-page`: 文法頁，初始收錄英語詞性介紹與 like 的全用法
- `ch1-content-page`: Ch1 完整內容頁，含文章全文、KK 音標詞彙補充、句型解析卡片
- `reading-bookmark`: 段落標題書籤，記憶閱讀位置並在下次進入路由時自動捲動
- `underlined-word-backlink`: 底線單字點選觸發平滑捲動至說明區塊，並顯示懸浮 FAB 按鈕回到原始單字位置
- `mp3-player`: Sticky 頂部 MP3 播放器，mp3Src 為空時不渲染
- `pwa-offline`: Service Worker 快取策略，使 App 可完全離線使用並可安裝

### Modified Capabilities

（無）

## Impact

- Affected specs: app-navigation, article-list, grammar-page, ch1-content-page, reading-bookmark, underlined-word-backlink, mp3-player, pwa-offline
- Affected code:
  - New: src/app/main.ts
  - New: src/app/App.vue
  - New: src/app/router/index.ts
  - New: src/modules/home/views/HomeView.vue
  - New: src/modules/home/components/ArticleListItem.vue
  - New: src/modules/home/composables/useCompletion.ts
  - New: src/modules/grammar/views/GrammarView.vue
  - New: src/modules/grammar/components/GrammarCard.vue
  - New: src/modules/ch1/views/Ch1View.vue
  - New: src/modules/ch1/components/SceneBlock.vue
  - New: src/modules/ch1/components/WordTag.vue
  - New: src/modules/ch1/components/PhraseCard.vue
  - New: src/modules/ch1/components/SentenceBreakdown.vue
  - New: src/shared/components/NavBar.vue
  - New: src/shared/components/Mp3Player.vue
  - New: src/shared/components/BackToWordFab.vue
  - New: src/shared/composables/useReadingBookmark.ts
  - New: src/shared/composables/useUnderlinkBacklink.ts
  - New: src/shared/config/storageKeys.ts
  - New: tailwind.config.ts
  - New: vite.config.ts
  - New: public/manifest.json
  - New: public/sw.js
  - New: index.html
  - Modified: (none — entirely new project build)
