# 新增 YouTube 播放清單型英文學習路由提案

## Why

我找到一個適合初學者循序學英語的 YouTube 頻道。這個頻道依 CEFR 難度整理了多個播放清單，每個播放清單內有許多英語短片。希望把這些播放清單整理進 Slowy_Learning_Eng，成為新的學習路由，讓我可以依照難度從 A1 到 B2 逐步學習。

這次新內容不處理現有的 `/ch1` 到 `/ch4`。既有 chapter route、既有 chapter data、既有 ch1 校稿內容都保持原樣。

## What Changes

新增 4 個「播放清單型」學習入口路由，每個入口路由對應一個 YouTube 播放清單，而不是把新影片接到既有 `/ch1` 到 `/ch4` 的 chapter route 後面。

建議路由：

- `/a1`：A1 Beginner English
- `/a2`：A2 High Beginner English
- `/b1`：B1 Intermediate English
- `/b2`：B2 Upper Intermediate English

每個播放清單入口下方再使用子頁路由呈現單支影片學習內容。子頁 slug 格式為 `ch[倒序編號]-[英文標題-kebab-case]`，英文標題依影片內容決定：

- `/a1/ch1-what-is-your-name`：A1 播放清單倒序後第 1 支**可學習**影片
- `/a1/ch2-how-to-greet-someone`：A1 播放清單倒序後第 2 支**可學習**影片
- `/a2/ch1-talking-about-your-day`：A2 播放清單倒序後第 1 支**可學習**影片
- `/b1/ch1-making-plans`：B1 播放清單倒序後第 1 支**可學習**影片
- `/b2/ch1-discussing-opinions`：B2 播放清單倒序後第 1 支**可學習**影片

注意：這裡的子頁 slug（如 `ch1-what-is-your-name`）與既有 `/ch1` 章節完全不同，不會改動既有 `/ch1` 到 `/ch4`。

難度顯示順序固定為：

1. A1 Beginner English
2. A2 High Beginner English
3. B1 Intermediate English
4. B2 Upper Intermediate English

## Source Playlists

### A1 Beginner English

https://www.youtube.com/watch?v=2QsxCYPZ-6o&list=PL8f0I_2tet-f2hkTKFPgWS7koHkY4_Pw1

### A2 High Beginner English

https://www.youtube.com/watch?v=HuXMurDSOBE&list=PL8f0I_2tet-dJp0Dlyv0Wr_ZQXbEWyJyL

### B1 Intermediate English

https://www.youtube.com/watch?v=IkBu-zAdYkY&list=PL8f0I_2tet-dz08Guo86B2auEenEMY05D

### B2 Upper Intermediate English

https://www.youtube.com/watch?v=ZKGouf91dDw&list=PL8f0I_2tet-d6uD3nVSpUoorMP0OUlGPE

## Playlist Extraction Rules

每個播放清單都要先提取全部影片網址，再依 YouTube 播放清單 index 做倒序排列。

倒序定義：

- YouTube 播放清單中 index 最大的影片排最前面。
- YouTube 播放清單中 index 1 的影片排最後面。
- 每個新路由內的影片呈現順序都使用這個倒序結果。

每支影片至少保留：

- 所屬難度播放清單
- 播放清單內原始 index
- 倒序後的顯示順序
- YouTube 影片標題
- YouTube 影片網址
- 字幕狀態

只有可建立學習內容的影片才產生子頁路由 slug。子頁路由 slug 格式為 `ch[倒序編號]-[英文標題-kebab-case]`，例如 `ch1-what-is-your-name`。其中倒序編號只計算可學習影片；`skipped` 影片不佔用 `ch` 編號。

## Caption Extraction Rules

只提取公開可取得的英文字幕。

可接受字幕來源：

- YouTube 公開英文字幕
- YouTube 公開自動產生英文字幕

不提取字幕的情況：

- 會員限定影片
- 私人影片
- 已下架影片
- 地區限制導致無法公開觀看的影片
- 沒有公開英文字幕的影片
- 技術上無法取得公開字幕的影片

若某支影片不能提取字幕，必須另外列出：

- 所屬播放清單，例如 A1 / A2 / B1 / B2
- 影片原始 index
- 影片標題，如果可取得
- 影片網址
- 無法提取原因，例如 member-only、private、no English captions、unavailable

`skipped` 影片只出現在 skipped report，不產生可點擊的學習子頁，也不佔用 `ch[倒序編號]-[英文標題-kebab-case]` 子頁 slug 或 `ch` 編號。

## Proofreading Rules

取得字幕後，要依照現有 ch1 的方式整理與校稿，但新播放清單內容要更適合初學者。

校稿原則：

- 保留來源字幕的主要內容、問句、重複語氣與教學節奏。
- 只修正明顯的 ASR 錯字、斷詞、大小寫、標點、簡單文法錯誤。
- 不把原始逐字稿任意摘要成短文。
- 不刪除來源中有學習價值的重複句。
- 英文句子旁邊提供繁體中文翻譯。
- 針對初學者補充更多單字、片語、常見用法與文法解析。

每支已成功取得字幕的影片，整理內容應包含：

- 中英對照全文
- 重點單字
- 重點片語與慣用語
- 句型解析
- 原始 YouTube 連結
- 難度標籤

## Route Behavior

每個難度入口路由是一個播放清單列表頁，頁面內列出多支影片卡片。單支影片的完整學習內容放在該難度路由底下的子頁。

例如 `/a1`：

- 頁面標題顯示 A1 Beginner English
- 頁面中依倒序列出該播放清單的所有公開可用影片
- 每支影片是一張可點擊卡片
- 點擊倒序後第 1 支**可學習**影片會進入 `/a1/ch1-[英文標題-slug]`
- 點擊倒序後第 2 支**可學習**影片會進入 `/a1/ch2-[英文標題-slug]`
- 每個影片子頁分段顯示中英對照、單字、片語、句型
- 被跳過的影片不放入主要學習內容，也不產生可點擊卡片；但要在頁面或資料中保留 skipped report

## Non-Goals

這次不處理以下內容：

- 不修改 `/ch1`
- 不修改 `/ch2`
- 不修改 `/ch3`
- 不修改 `/ch4`
- 不把新 YouTube 影片做成 `/ch5`、`/ch6`、`/ch7` 這種一支影片一個 chapter route
- 不把 `/a1/ch1-[title-slug]`、`/a2/ch1-[title-slug]` 這類 MissHoney 子頁視為既有 chapter route
- 不把 A1/A2/B1/B2 混進既有 `ch1` 到 `ch4` 的內容順序
- 不提取會員限定或非公開影片的字幕
- 不新增登入 YouTube 或繞過權限限制的功能

## Suggested Implementation Shape

新增一組播放清單型資料與路由，和既有 chapter route 分開。

建議新增：

- `src/modules/playlists/PlaylistView.vue`
- `src/modules/playlists/PlaylistVideoView.vue`
- `src/modules/playlists/types.ts`
- `src/modules/playlists/data/a1.ts`：A1 播放清單 metadata、影片清冊、狀態、skipped report，不放完整字幕學習內容
- `src/modules/playlists/data/a2.ts`：A2 播放清單 metadata、影片清冊、狀態、skipped report，不放完整字幕學習內容
- `src/modules/playlists/data/b1.ts`：B1 播放清單 metadata、影片清冊、狀態、skipped report，不放完整字幕學習內容
- `src/modules/playlists/data/b2.ts`：B2 播放清單 metadata、影片清冊、狀態、skipped report，不放完整字幕學習內容
- `src/modules/playlists/data/videos/` 底下依難度分子資料夾，每支影片一個 JSON 檔存放完整學習內容（例如 `videos/a1/ch1-what-is-your-name.json`）
- `src/shared/config/playlists.ts`

資料載入規則：

- `PlaylistView` 只載入播放清單 metadata，不載入完整字幕與學習內容。
- 狀態為 `ready` 的影片 metadata 提供 `contentLoader`（例如 `() => import('./videos/a1/ch1-what-is-your-name.json')`）；狀態為 `pendingTranscript` 的影片 `contentLoader` 為 `null`，`PlaylistVideoView` 偵測到 `null` 時顯示「內容整理中」佔位頁。
- `PlaylistVideoView` 只有在進入 `/a1/:videoSlug`、`/a2/:videoSlug`、`/b1/:videoSlug`、`/b2/:videoSlug` 時，才透過 `contentLoader` 載入單支影片 JSON 內容。
- `skipped` 影片不提供 `contentLoader`，也不產生影片子頁 route。

建議修改：

- `src/app/router/index.ts`：新增 `/a1`、`/a2`、`/b1`、`/b2` 播放清單入口 route，以及 `/a1/:videoSlug`、`/a2/:videoSlug`、`/b1/:videoSlug`、`/b2/:videoSlug` 影片子頁 route
- `src/modules/home/views/HomeView.vue`：在現有文章列表下方新增 MissHoney 獨立區塊，放 A1/A2/B1/B2 純導航卡片
- `src/shared/components/NavBar.vue`：新增 MissHoney 下拉選單
- `src/modules/home/components/ArticleListItem.vue` 或新元件：首頁 playlist 卡片要新增純導航元件，或讓 `ArticleListItem` 支援 `showCompletion=false`

既有 `src/shared/config/chapters.ts` 可保持只管理 `/ch1` 到 `/ch4`。

## Implementation Phases

### Phase 1：路由與播放清單清冊

- 建立 `/a1`、`/a2`、`/b1`、`/b2` 播放清單入口頁。
- 建立 `/a1/:videoSlug`、`/a2/:videoSlug`、`/b1/:videoSlug`、`/b2/:videoSlug` 影片子頁路由。
- 提取每個播放清單的影片清冊，依倒序為可學習影片產生 `ch1-[title-slug]`、`ch2-[title-slug]`、`ch3-[title-slug]` 等子頁 slug。
- 建立 skipped report，列出會員限定、私人、下架、無英文字幕或無法取得字幕的影片。
- skipped 影片只進 skipped report，不產生可點擊卡片、子頁 slug 或 `contentLoader`。
- 首頁新增 MissHoney 區塊，A1/A2/B1/B2 使用純導航卡片，不顯示完成圈圈。
- NavBar 新增 MissHoney 下拉選單。

### Phase 2：字幕與學習內容分批填入

- 針對公開且可取得英文字幕的影片，分批整理成影片子頁內容。
- 每支完成的影片子頁都要包含中英對照全文、重點單字、重點片語與慣用語、句型解析、原始 YouTube 連結與難度標籤。
- 可以先填入部分影片內容，但資料中要清楚標示每支影片的狀態，例如 `ready`、`pendingTranscript`、`skipped`。
- 當某支影片標記為 `ready` 時，才視為該影片已完成校稿與學習內容整理。
- 影片子頁若狀態為 `pendingTranscript`，頁面顯示「內容整理中」佔位訊息，影片卡片仍可點擊進入。
- 完整字幕與學習內容不得全部塞進 `a1.ts`、`a2.ts`、`b1.ts`、`b2.ts`；必須拆成單支影片 JSON 檔，避免播放清單入口一次載入大量字幕資料。

## Success Criteria

- `/ch1` 到 `/ch4` 保持原本行為與內容。
- 新增 `/a1`、`/a2`、`/b1`、`/b2` 四個播放清單入口路由。
- 新增 `/a1/ch1-[title-slug]`、`/a1/ch2-[title-slug]` 等影片子頁路由，其他難度依相同模式建立。
- A1/A2/B1/B2 的顯示順序由簡到難。
- 每個播放清單內影片順序為倒序，index 1 放最後。
- 每支影片的完成狀態使用 `miss-honey:<level>:<videoId>` 作為 localStorage key，例如 `miss-honey:a1:GcsCi5H4L_Y`。
- Phase 1 完成時，每個播放清單都有倒序清冊、可學習影片子頁 slug、metadata-only 入口資料與 skipped report。
- Phase 2 中標記為 `ready` 的影片，都有整理後的學習內容。
- 播放清單入口頁只載入 metadata；影片完整學習內容只在進入影片子頁時 lazy load。
- 會員限定、私人、下架、無英文字幕或無法取得字幕的影片都有 skipped report。
- skipped 影片不產生可點擊學習子頁。
- 校稿後內容保留原字幕主要句意，不任意摘要。
- 初學者需要的單字、片語、文法補充比 ch1 更完整。

## Resolved Decisions

1. **首頁入口**：現有「文章列表」區塊保持不動。在其下方新增「MissHoney」獨立區塊，內含 A1 / A2 / B1 / B2 四張純導航卡片（無完成圈圈），點擊後導航至對應路由。首頁 playlist 卡片要新增純導航元件，或讓 `ArticleListItem` 支援 `showCompletion=false`。

2. **NavBar**：在現有「內容」按鈕旁新增「MissHoney」下拉按鈕。下拉選單樣式與格式完全沿用「內容」選單（同一 dropdown 元件模式、同樣的 menuitem 按鈕樣式）。選單項目為 A1 / A2 / B1 / B2，點擊後導航至對應路由。選單使用 `left-0` 定位（向右展開），寬度使用 `w-max max-w-[calc(100vw-11rem)]`，確保不超出畫面右側。（MissHoney 按鈕位於「內容」右側，左側 offset 約 10.5rem，因此比「內容」選單的 8rem 更大。`right-0` 方案已評估但刻意不採用。）NavBar 窄螢幕擠壓問題目前評估還擠得下，刻意暫緩，未來有需要再處理。

3. **播放清單頁面排版**：沿用現有首頁的 ArticleListItem 排版。每支影片為一張卡片，顯示標題與副標，右側有完成圈圈（localStorage 儲存，沿用 `useCompletion` 模式）。點擊卡片進入該影片的學習內容子頁，例如 `/a1/ch1-what-is-your-name`。

4. **完成狀態 key**：`useMissHoneyCompletion` 使用單一 localStorage key `slowy:miss-honey-completion`，儲存格式為 `{ "<videoId>": true, ... }` 的 JSON map（與現有 `useCompletion` 使用 `slowy:completion` 的模式一致）。不與既有 `ch1`–`ch4` 完成狀態撞名。

5. **字幕資料儲存**：播放清單入口資料與單支影片內容必須分離。`src/modules/playlists/data/a1.ts` 等只存 metadata、清冊、狀態與 skipped report（TypeScript）；完整字幕校稿內容改用 JSON 格式，每支影片一個 JSON 檔，放在 `src/modules/playlists/data/videos/<level>/` 子資料夾（例如 `videos/a1/ch1-what-is-your-name.json`）。Vite 原生支援 JSON import 並自動做 code splitting，進入影片子頁時才 lazy load 該支影片的 JSON，不會一次載入大量資料。內容採階段式完成：Phase 1 先建立路由、清冊與 skipped report；Phase 2 再分批填入字幕校稿後的學習內容。

6. **命名**：`MissHoney` 是刻意使用的顯示名稱，文件與 UI 文字都維持 `MissHoney`。

7. **`PlaylistVideoData` 型別**：獨立建立，不沿用或擴展 `ChapterData`。`PlaylistVideoView.vue` 使用專屬渲染邏輯，不與 `ChapterView` 共用。由於內容以 JSON 儲存，所有欄位必須為純資料（字串、數字、陣列、物件），不得在 JSON 內放 HTML 字串或 `hl()` 等函式呼叫結果。若需要單字高亮，改用結構化欄位（例如 `{ text: "word", highlight: true }`），由 `PlaylistVideoView` 負責轉換成對應 HTML。

8. **完成狀態 composable**：另建 `useMissHoneyCompletion`，不修改現有 `useCompletion`。localStorage key 為 `slowy:miss-honey-completion`，與 `storageKeys.ts` 的命名規範一致（需補進 `STORAGE_KEYS`）。
