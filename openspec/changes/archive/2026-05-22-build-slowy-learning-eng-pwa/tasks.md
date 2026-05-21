## 1. 專案骨架與工具設定

- [x] 1.1 以「技術棧：Vue3 + Tailwind + Vite，而非維持純 HTML」的選型建立新 Vite 專案，含 TypeScript strict 模式、`<script setup lang="ts">` 範本；執行 `npm run dev` 後瀏覽器能正常顯示預設頁面。
- [x] 1.2 依「檔案結構：feature-based modules，而非 type-based」建立 `src/app/`、`src/modules/home/`、`src/modules/grammar/`、`src/modules/ch1/`、`src/shared/` 目錄；`PROJECT_ARCHITECTURE.md` 記錄此結構；手動確認目錄存在。
- [x] 1.3 設定「Tailwind 自訂色彩 token（對應 ch1 CSS variables）」：在 `tailwind.config.ts` extend.colors 加入 paper、paper-2、paper-3、ink、ink-soft、ink-faint、terracotta、terracotta-deep、sage、sage-deep、ochre、ochre-deep、teal-eng、teal-eng-deep、line、line-soft 共 16 個 token；執行 `npm run build` 無 CSS 錯誤。
- [x] 1.4 引入 Fraunces、Newsreader、Noto Sans TC 字型；根元素應用 Noto Sans TC 為預設字型；手動驗證字型在 `/` 路由正確渲染。
- [x] 1.5 建立 `.gitignore`（含 node_modules/、dist/、build/、coverage/、test-results/、playwright-report/）；執行 `git status` 確認上述路徑未被追蹤。

## 2. 路由與導覽列

- [x] 2.1 依「路由模式：History mode（createWebHistory）」設定 Vue Router（createWebHistory），定義三條路由 `/`（HomeView）、`/grammar`（GrammarView）、`/ch1`（Ch1View）；手動訪問三條路由均不出現 404。
- [x] 2.2 實作「Three-route SPA with sticky navigation bar」：`NavBar.vue` 固定頂部（position sticky, top 0, z-index 50），含「首頁」與「文法」兩個按鈕；NavBar 存在於三條路由的 App.vue 殼層；smoke test 驗證 NavBar 在三個路由均出現。
- [x] 2.3 實作 active 路由高亮：「Navigation bar is sticky and does not scroll away」視覺規格——當前路由按鈕 terracotta 底色白字，其餘 paper 底色 ink 字；手動捲動頁面確認 NavBar 固定不動。
- [x] 2.4 確認「Content pages are linked from the home list only」：NavBar DOM 中無直接指向 `/ch1` 的連結；Vitest 測試驗證 NavBar 渲染後無 `/ch1` href。
- [x] 2.5 實作「Navigation bar respects iOS safe area (notch / Dynamic Island)」，對應設計決策「iOS PWA Safe Area（瀏海 / 靈動島）」：在 `index.html` 的 `<meta name="viewport">` 加入 `viewport-fit=cover`；安裝 `tailwindcss-safe-area` 外掛；NavBar.vue 頂部 padding 改為 `pt-safe-top`（對應 `env(safe-area-inset-top)`）；手動在 iPhone Safari DevTools Responsive 模式或實機確認導覽列不被瀏海 / 靈動島遮住。

## 3. 首頁（Home View）

- [x] 3.1 實作「Home view displays a list of available articles」：HomeView.vue 渲染 Ch1 列表項目，含標題「我的紐約之旅」與副標題；Vitest snapshot 或手動確認列表存在。
- [x] 3.2 依「持久化：localStorage（完成標記 + 書籤）」實作 `useCompletion.ts`：`toggleCompletion(chapterId)` 切換 `slowy:completion[chapterId]`；`isCompleted(chapterId)` 讀取；Vitest 單元測試驗證切換後 localStorage 值正確。
- [x] 3.3 實作「Each list item has a completion toggle icon」：ArticleListItem.vue 末端顯示完成 icon；uncompleted 為 outline 圓圈，completed 為 solid 圓圈；點選 icon 呼叫 toggleCompletion；Vitest 測試驗證點選後 icon 類別改變。
- [x] 3.4 確認完成狀態跨 session 持久化：`localStorage["slowy:completion"] = {"ch1": true}` 時 HomeView 掛載後 Ch1 顯示 solid 圓圈；Vitest 以 mock localStorage 驗證初始化。
- [x] 3.5 實作「Tapping the article title navigates to its content page」：點選 Ch1 列表標題區後 router.push('/ch1')；Vitest 測試 mock router push 驗證。

## 4. 段落書籤（Reading Bookmark）

- [x] 4.1 依「持久化：localStorage（完成標記 + 書籤）」實作 `useReadingBookmark.ts`：`setBookmark(chapterId, paragraphId)` 寫入 `slowy:bookmark[chapterId]`；`getBookmark(chapterId)` 讀取；Vitest 單元測試驗證。
- [x] 4.2 實作「Each content page paragraph title is tappable and acts as a bookmark」：SceneBlock.vue 標題 click 呼叫 setBookmark；Vitest 測試驗證點選後 localStorage 更新。
- [x] 4.3 實作「Only one bookmark per chapter route is active at a time」：setBookmark('ch1', 'scene-07') 覆蓋前一個書籤；Vitest 測試連續呼叫兩次驗證最終值。
- [x] 4.4 實作「Entering a content page auto-scrolls to the saved bookmark」：Ch1View onMounted 讀取書籤並 scrollIntoView；手動測試設定書籤後重整頁面，確認自動捲動。
- [x] 4.5 驗證「Bookmark state does not affect other chapters」：slowy:bookmark 只有 ch1 key 時，其他章節路由不觸發 auto-scroll；Vitest 測試驗證。

## 5. 底線單字互動與 FAB

- [x] 5.1 依「底線單字 FAB 回到原位：記錄 scrollY，而非 DOM id」實作 `useUnderlinkBacklink.ts`：`triggerScroll(targetId)` 儲存 window.scrollY 並 scrollIntoView 至 targetId；`returnToSource()` 執行 scrollTo 儲存的 scrollY 並清空；Vitest 測試驗證 savedScrollY 儲存與清空。
- [x] 5.2 實作「Tapping an underlined word smoothly scrolls to its explanation card」：底線單字 click handler 讀取 data-target 屬性，呼叫 triggerScroll；手動測試點選底線單字後頁面捲至 vocab-{slug} 元素。
- [x] 5.3 實作「A floating action button (FAB) appears after tapping an underlined word」：BackToWordFab.vue 以 v-if="sourceScrollY !== null" 控制顯示，fixed 定位 bottom 1.5rem right 1.5rem；手動測試點選底線單字後 FAB 出現。
- [x] 5.4 實作「The FAB returns the viewport to the exact position of the tapped word」：FAB 點擊後呼叫 returnToSource，頁面捲回儲存的 scrollY；手動測試驗證。
- [x] 5.5 實作「Tapping the FAB hides it」：returnToSource 將 sourceScrollY 設為 null；Vitest 測試驗證呼叫後 sourceScrollY 為 null。
- [x] 5.6 實作「Tapping a different underlined word while the FAB is visible updates the source position」：再次呼叫 triggerScroll 覆蓋 savedScrollY；Vitest 測試連續呼叫兩次不同值驗證最終值。
- [x] 5.7 驗證「Multiple underlined words pointing to the same explanation card each record their own source position」：scrollY 1200 與 1240 各自觸發後 returnToSource 回到各自位置；Vitest 測試兩種情況均正確。

## 6. MP3 播放器（Mp3Player）

- [x] 6.1 實作「Sticky MP3 player appears at the top of content pages that have an audio source」：Mp3Player.vue 接受 mp3Src prop；mp3Src null 時 v-if 不渲染；非空時 sticky 顯示於導覽列下方；Vitest 測試 mp3Src null 時元件不存在 DOM。
- [x] 6.2 實作「MP3 player provides playback controls」：播放/暫停、+5s、+10s 按鈕修改 audio.currentTime；音量 slider 更新 audio.volume；seekable timeline 拖拉更新 audio.currentTime；MM:SS 格式顯示時間；Vitest 測試各控制項行為。
- [x] 6.3 實作 loop 預設 ON：audio 元素初始有 loop 屬性；toggle 按鈕呈現 active 狀態；Vitest 測試驗證初始 loop 屬性為 true。
- [x] 6.4 確認「MP3 player is offline-capable」：mp3Src 對應的音檔路徑已透過 vite-plugin-pwa globPatterns（含 *.mp3）加入 precache manifest，無需額外 runtimeCaching 規則；Ch1 mp3Src null 時播放器不渲染；手動驗證 Ch1 頁面無播放器 UI。

## 7. Ch1 內容頁

- [x] 7.1 實作「Ch1 content page renders the full bilingual article」：Ch1View.vue 渲染所有 scene 區塊，含場景編號、中英標題、逐句雙語內文；視覺對應 paper 色系與字型；手動逐一確認場景數量與標題。
- [x] 7.2 實作「English and Chinese text are displayed on separate lines (mobile-first)」，套用設計決策「RWD 斷點策略：mobile-first + 桌機 max-width 840px」：英語與中文各佔 display block 一行，375 px 螢幕寬度下不並排；768 px+ 時所有內容區塊套用 `max-w-3xl mx-auto`（約 840 px）置中；NavBar 同步置中；Chrome DevTools 375 px 及 1024 px 模式手動各確認一次。
- [x] 7.3 實作「Vocabulary items include KK phonetics, part of speech, and meaning」：所有 60+ 個 WordTag 元件含 KK 音標（字體較小）、詞性縮寫、中文意思；手動滾動確認全部詞彙存在且格式正確。
- [x] 7.4 實作「Vocabulary items needing detailed explanation display an underline」：有對應說明卡的詞彙在文章文本中顯示底線；底線單字數量與說明卡數量一致；手動確認。
- [x] 7.5 依「Explanation card anchor ids follow a consistent naming scheme」設定所有說明卡 id 為 vocab-{slug}；Vitest 測試驗證 vocab-layover、vocab-to-have-had 等 id 存在。
- [x] 7.6 實作「Sentence breakdown cards cover all required phrases」：propose.md 4.2 節所有 30 個句型/用法項目各有對應說明卡；手動逐一對照確認無遺漏。
- [x] 7.7 驗證「Grammar page does NOT include article-specific sentence breakdowns」：GrammarView 渲染 DOM 中不含 data-target 屬性或 vocab- id；Vitest 測試驗證。
- [x] 7.8 整合書籤與底線單字互動至 Ch1View；smoke test 驗證 /ch1 路由完整渲染不出現 console error。

## 8. 文法頁（Grammar Page）

- [x] 8.1 實作「Grammar page displays multi-container layout」：GrammarView.vue 渲染至少兩個 GrammarCard，各以卡片樣式顯示；Vitest snapshot 確認兩張卡存在。
- [x] 8.2 確認「Each grammar container includes structured content」：每張 GrammarCard 含詞性 badge、用途說明、公式區塊（teal 底色）、例句（英文+中文）；手動確認兩張卡結構完整。
- [x] 8.3 實作英語常見詞性介紹卡（G01）：涵蓋 n./v./adj./adv./prep./conj./pron. 七種詞性，各含中文名稱、用途說明、至少一個例子；手動確認七種詞性全部存在。
- [x] 8.4 實作 like 的全用法卡（G02）：涵蓋動詞（喜歡）、介系詞（像）、連接詞（feel like + 子句）三種用法，各含至少一個英文例句與中文翻譯；手動確認三種用法全部存在。

## 9. PWA 離線支援

- [x] 9.1 安裝並設定 vite-plugin-pwa，依「PWA 快取策略（vite-plugin-pwa）」設定 globPatterns；執行 `npm run build` 確認 dist/ 中存在 sw.js。
- [x] 9.2 建立 public/manifest.json，符合「The app is installable as a PWA on mobile devices」：含 name、short_name、start_url("/")、display("standalone")、background_color、theme_color、icon；Chrome DevTools Application 面板確認 manifest 解析正常。
- [x] 9.3 實作「Service Worker uses Cache First for static assets」：Workbox Cache First 套用於靜態資源；Network offline 模式下 /、/grammar、/ch1 均正常顯示；手動以 DevTools 驗證。
- [x] 9.4 確認 MP3 已納入 precache manifest（對應設計決策「PWA：完全離線模式（Precache All）」）：vite-plugin-pwa 的 `globPatterns` 設為 `['**/*.{js,css,html,ico,png,svg,woff2,mp3}']`，`navigateFallback` 設為 `'/index.html'`，不設 runtimeCaching；執行 `npm run build` 後確認 sw.js precache manifest 包含 mp3 副檔名的項目（或確認路徑正確）。
- [x] 9.5 確認「All static assets are cached on first visit」且「Build output chunk size does not exceed 500 KB」：vite.config.ts 設定 chunkSizeWarningLimit 500；npm run build 無 chunk size warning；手動確認 dist/ JS chunk 均 < 500 KB。
- [x] 9.6 建立「PWA icons are provided in required sizes」，對應設計決策「PWA Icons：佔位圖規格」：在 `public/icons/` 目錄下建立三個佔位圖示——`icon-192.png`（192×192 px）、`icon-512.png`（512×512 px）、`apple-touch-icon.png`（180×180 px）；圖示內容為純色或簡單文字佔位即可；確認 `manifest.json` 的 `icons` 陣列引用上述三個路徑，且 `index.html` 含 `<link rel="apple-touch-icon" href="/icons/apple-touch-icon.png">`。
- [x] 9.7 實作「Service Worker update is applied automatically within 3 seconds」，對應設計決策「SW 更新策略：Toast 3 秒 → 無論點否均自動更新」：使用 `vite-plugin-pwa` 的 `useRegisterSW` composable；偵測到 waiting SW 時在 App.vue 中掛載 `UpdateToast.vue`（`src/shared/components/UpdateToast.vue`），Toast 文字為「有新版本，點此立即更新」；點選 Toast 立即呼叫 `wb.messageSkipWaiting()` + `location.reload()`；Toast 3 秒後自動關閉，關閉後同樣執行 `wb.messageSkipWaiting()` + `location.reload()`；Vitest 測試驗證 3 秒 timeout 後 skipWaiting 被呼叫；手動驗證 Toast 外觀符合 paper 色系樣式。
- [x] 9.8 **【關鍵驗收】確認「App operates in fully offline mode after first visit」**，對應設計決策「PWA：完全離線模式（Precache All）」與設計決策「RWD 斷點策略：mobile-first + 桌機 max-width 840px」（同步確認 RWD 在離線狀態下正確呈現）：啟動實機或 DevTools Application 面板確認 Service Worker 已安裝且所有資源均已 precache；開啟飛航模式（完全斷網）；分別訪問 `/`、`/grammar`、`/ch1` 三條路由——每條路由均需完整渲染（樣式、字型、內容全部正常）；若有音檔，確認音檔可在離線狀態播放；確認 DevTools Network 面板顯示所有資源均由 Service Worker 快取提供（status: 200, from ServiceWorker）；任一路由離線失敗即為驗收不通過。

## 10. Smoke Tests

- [x] 10.1 為 /、/grammar、/ch1 各建立一個 smoke test，驗證路由渲染後 DOM 不出現 console error，NavBar 與 main content 元素存在。
- [x] 10.2 useCompletion Vitest 單元測試：切換兩次後狀態正確；re-init 後從 localStorage 恢復狀態。
- [x] 10.3 useReadingBookmark Vitest 單元測試：setBookmark 後 getBookmark 回傳正確值；覆蓋行為正確；不同 chapterId 互不干擾。
- [x] 10.4 useUnderlinkBacklink Vitest 單元測試：triggerScroll 後 sourceScrollY 有值；returnToSource 後 sourceScrollY 為 null；多次 triggerScroll 覆蓋正確。
- [x] 10.5 驗收確認：依設計文件「行為合約」清單逐一核對——NavBar 高亮、完成 icon 切換、書籤捲動、底線單字 FAB、Mp3Player 條件渲染——所有可觀測行為符合預期；並確認「驗收條件」核查清單（可安裝、離線、書籤持久、FAB 回位、chunk size）全部達標；確認「範圍邊界」：Ch2+、SRS、後端 API 均未被實作。
