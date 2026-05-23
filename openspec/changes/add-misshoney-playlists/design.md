## Context

目前 Slowy Learning Eng 以 `/ch1`–`/ch4` 章節路由為主要學習內容，每個 chapter 對應一支影片，資料以 TypeScript module 存放（ChapterData 型別）。本次變更新增獨立的「播放清單」模組，對應 MissHoney YouTube 頻道的 A1–B2 四個 CEFR 難度播放清單，每個播放清單含多支影片，各影片的學習內容分批填入。

## Goals / Non-Goals

**Goals:**
- 建立 `/a1`、`/a2`、`/b1`、`/b2` 播放清單入口路由與影片子頁路由
- 建立 `src/modules/playlists/` 模組（PlaylistView、PlaylistVideoView、types、data）
- 首頁新增 MissHoney 獨立區塊（A1/A2/B1/B2 導航卡片）
- NavBar 新增 MissHoney 下拉選單
- 以 `slowy:miss-honey-completion` localStorage key 追蹤影片完成狀態
- 影片學習內容以 JSON 格式分檔儲存，由影片子頁 lazy load

**Non-Goals:**
- 不修改 `/ch1`–`/ch4` 及其資料
- 不提取會員限定或非公開影片字幕
- 不新增 YouTube 登入或授權功能
- NavBar 窄螢幕排版問題暫緩
- Phase 2 字幕內容整理不在本設計範圍內（框架建好後分批執行）

## Decisions

**D1：Playlists 模組與 Chapters 模組完全分離**
理由：播放清單型資料（多影片、分狀態）與現有 ChapterData 結構差異大；共用型別會造成 coupling，分開維護更清楚。`src/modules/playlists/` 獨立建立，不依賴 `src/modules/chapters/`。

**D2：影片清冊（metadata）與學習內容（content）拆分儲存**
理由：避免進入播放清單列表頁時一次載入所有影片的完整字幕資料。`a1.ts`/`a2.ts`/`b1.ts`/`b2.ts` 只存 metadata 與 skipped report；每支 ready 影片的完整內容存在 `data/videos/<level>/<slug>.json`，由 `contentLoader` lazy import。

**D3：影片內容使用 JSON 而非 TypeScript**
理由：JSON 是純資料格式，適合大量結構化學習內容；Vite 原生支援 JSON import 並自動做 code splitting，不需額外設定。JSON 內容不得含 HTML 字串或函式呼叫（如 hl()）；如需單字高亮，使用結構化欄位 `{ text, highlight }` 由 PlaylistVideoView 轉換為 HTML。

**D4：播放清單影片採倒序顯示**
理由：此頻道的播放清單較新加入的影片為更基礎的初學者內容（index 最大 = 最新加入 = 最基礎），因此倒序（最高 index 排最前）可讓使用者先看到最基礎的影片。skipped 影片不佔用 ch 編號。

**D5：useMissHoneyCompletion 與 useCompletion 分開，使用獨立 storageKey**
理由：避免影片完成狀態與 chapter 完成狀態混用。沿用相同的 JSON map 模式（`{ videoId: boolean }`），但 key 為 `slowy:miss-honey-completion`，補入 `STORAGE_KEYS`。

**D6：ArticleListItem 新增 showCompletion prop**
理由：首頁 MissHoney 導航卡片只做路由導航，不需完成圈圈。比起另建新元件，在現有 `ArticleListItem` 加可選 `showCompletion`（預設 true）更省程式碼，且不影響現有 ch1–ch4 用法。

**D7：NavBar MissHoney 下拉選單使用 left-0 定位**
理由：與現有「內容」選單保持一致的視覺方向（向右展開）。MissHoney 按鈕左側 offset 約 10.5rem，故選單最大寬度設為 `max-w-[calc(100vw-11rem)]` 防止溢出右側。

## Implementation Contract

**行為（使用者觀察到的）：**
- 訪問 `/a1`、`/a2`、`/b1`、`/b2` 顯示對應難度的影片清單頁，影片以倒序排列，每張卡片含標題、副標與完成圈圈
- 點擊影片卡片進入 `/a1/ch1-[slug]` 等子頁；若狀態為 `ready` 顯示學習內容，若為 `pendingTranscript` 顯示「內容整理中」
- skipped 影片不顯示為可點擊卡片，不產生子頁路由
- 首頁文章列表下方出現 MissHoney 區塊，含 A1/A2/B1/B2 四張導航卡片（無完成圈圈），點擊後導航至對應路由
- NavBar「內容」旁出現「MissHoney ▾」按鈕，點擊展開含 A1–B2 的下拉選單
- 影片完成圈圈點擊後切換狀態，重新整理後保留（localStorage 持久化）

**介面與資料形狀：**

`PlaylistData`（a1.ts 等匯出）：
```ts
interface PlaylistData {
  level: 'a1' | 'a2' | 'b1' | 'b2'
  title: string          // e.g. "A1 Beginner English"
  youtubePlaylistUrl: string
  videos: PlaylistVideoEntry[]
  skippedVideos: SkippedVideoEntry[]
}
```

`PlaylistVideoEntry`（播放清單中每支影片的 metadata）：
```ts
interface PlaylistVideoEntry {
  videoId: string           // YouTube video ID
  slug: string              // e.g. "ch1-what-is-your-name"
  title: string             // 影片標題（用於卡片顯示）
  subtitle?: string         // 副標題（可選）
  originalIndex: number     // YouTube 播放清單原始 index
  displayOrder: number      // 倒序後的顯示順序（1 = 最前面）
  status: 'ready' | 'pendingTranscript'
  contentLoader: (() => Promise<{ default: PlaylistVideoData }>) | null
                            // ready → 指向對應 JSON; pendingTranscript → null
}
```

`SkippedVideoEntry`：
```ts
interface SkippedVideoEntry {
  videoId?: string
  title?: string
  youtubeUrl: string
  originalIndex: number
  reason: 'member-only' | 'private' | 'no-english-captions' | 'unavailable' | 'geo-restricted'
}
```

`PlaylistVideoData`（JSON 檔匯出的學習內容）：
```ts
interface PlaylistVideoData {
  videoId: string
  slug: string
  level: 'a1' | 'a2' | 'b1' | 'b2'
  title: string
  youtubeUrl: string
  scenes: PlaylistScene[]
  vocabGroups: PlaylistVocabGroup[]
  phrases: PlaylistPhrase[]
}
interface PlaylistScene {
  id: string
  sentences: Array<{ en: string; tc: string }>
}
interface PlaylistVocabGroup {
  label: string
  items: Array<{ word: string; pos: string; meaning: string; highlight?: boolean }>
}
interface PlaylistPhrase {
  id: string
  phrase: string
  meaning: string
  examples: Array<{ en: string; tc: string }>
}
```
注意：所有欄位為純資料（字串/數字/陣列/物件），不含 HTML 或函式呼叫。

**失敗模式：**
- `contentLoader` 為 null（pendingTranscript）→ PlaylistVideoView 顯示「內容整理中」，不顯示學習內容
- 路由 `/a1/unknown-slug` 無對應影片 → PlaylistVideoView 顯示「找不到此影片」
- localStorage 讀取失敗 → useMissHoneyCompletion 回傳空 map，不 crash

**驗收條件：**
1. `npm run build` 無型別錯誤
2. `/a1`、`/a2`、`/b1`、`/b2` 各顯示對應影片列表，影片以倒序排列
3. 點擊 ready 影片進入子頁，顯示學習內容；點擊 pendingTranscript 影片顯示「內容整理中」
4. skipped 影片不出現在列表
5. 首頁文章列表下方可見 MissHoney 區塊，A1–B2 四張導航卡片，無完成圈圈
6. NavBar「內容」旁可見「MissHoney ▾」，下拉含 A1–B2，點擊導航正確
7. 影片完成狀態點擊後持久化（重整頁面後保留）
8. 既有 `/ch1`–`/ch4` 行為與內容不受影響

**範圍邊界：**
- 在範圍內：routes、Vue 元件、TypeScript types、storageKeys、NavBar、HomeView、ArticleListItem
- 不在範圍內：字幕提取工具、Phase 2 學習內容填入、NavBar 窄螢幕排版

## Risks / Trade-offs

- **風險**：播放清單影片數量可能達 100–400 支，Phase 2 工期大。緩解：Phase 1 只建框架，Phase 2 分批填入，狀態欄位追蹤進度。
- **取捨**：影片內容用 JSON 而非 TypeScript，缺少型別檢查。緩解：TypeScript 的 `PlaylistVideoData` 型別在 `types.ts` 定義，`contentLoader` 回傳型別有型別標注，load 時做 runtime 驗證。
- **取捨**：ArticleListItem 加 showCompletion prop 改動現有共用元件。影響範圍小（只有首頁用到），預設值 true 確保既有行為不變。
