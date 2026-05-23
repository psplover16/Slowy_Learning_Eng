## Context

目前 Slowy Learning Eng 以 `/ch1`–`/ch4` 章節路由為主要學習內容，每個 chapter 對應一支影片，資料以 TypeScript module 存放（ChapterData 型別）。本次變更新增獨立的 MissHoney 播放清單模組，對應 A1–B2 四個 CEFR 難度播放清單。最終目標不是只建立骨架，而是完成一條可追蹤的 pipeline：自動抓取播放清單與公開英文字幕、產生 raw transcripts、把可學習影片解析成 `PlaylistVideoData` JSON、接入各等級路由，並讓所有可用影片都能離線閱讀。

## Goals / Non-Goals

**Goals:**
- 建立 `/a1`、`/a2`、`/b1`、`/b2` 播放清單入口路由與影片子頁路由
- 建立 `src/modules/playlists/` 模組（PlaylistView、PlaylistVideoView、types、data）
- 建立 `scripts/misshoney/` 自動匯入工具，避免使用者手動抓取 YouTube 字幕
- 跑完整 A1–B2 import，將可公開取得的英文字幕輸出為 raw transcripts
- 建立內容 scaffold、AI authoring、驗證、promotion 流程，將每支可學習影片轉成完整 `PlaylistVideoData` JSON
- 將所有完成的 JSON 接入 metadata 與 routes，使各影片子頁可直接顯示 learning content
- 首頁新增 MissHoney 獨立區塊（A1/A2/B1/B2 導航卡片）
- NavBar 新增 MissHoney 下拉選單
- 以 `slowy:miss-honey-completion` localStorage key 追蹤影片完成狀態

**Non-Goals:**
- 不修改 `/ch1`–`/ch4` 及其資料
- 不提取會員限定、私人、下架、地區限制或無公開英文字幕影片的字幕
- 不新增 YouTube 登入、cookies 匯入或繞過權限限制的功能
- 不要求使用者手動抓取或貼上字幕；字幕取得由 import tool 自動嘗試
- 不在 app runtime 呼叫 YouTube、OpenAI 或其他外部服務；完成後的學習內容必須是本機 JSON，支援離線
- NavBar 窄螢幕擠壓問題暫緩

## Decisions

**D1：Playlists 模組與 Chapters 模組完全分離**
理由：播放清單型資料（多影片、分狀態）與現有 ChapterData 結構差異大；共用型別會造成 coupling，分開維護更清楚。`src/modules/playlists/` 獨立建立，不依賴 `src/modules/chapters/`。

**D2：影片清冊（metadata）與學習內容（content）拆分儲存**
理由：避免進入播放清單列表頁時一次載入所有影片完整內容。`a1.ts`/`a2.ts`/`b1.ts`/`b2.ts` 只存 metadata 與 skipped report；每支 ready 影片的完整內容存在 `data/videos/<level>/<slug>.json`，由 `contentLoader` lazy import。

**D3：影片內容使用 JSON 而非 TypeScript**
理由：JSON 是純資料格式，適合大量結構化學習內容；Vite 原生支援 JSON import 並自動做 code splitting。JSON 內容不得含 HTML 字串或函式呼叫；如需單字高亮，使用結構化欄位 `{ highlight: true }`。

**D4：播放清單影片採倒序顯示**
理由：此頻道播放清單較新加入的影片常是更基礎的初學者內容（index 最大 = 最新加入 = 最基礎），因此倒序（最高 index 排最前）可讓使用者先看到更基礎的影片。skipped 影片不佔用 ch 編號。

**D5：useMissHoneyCompletion 與 useCompletion 分開，使用獨立 storageKey**
理由：避免影片完成狀態與 chapter 完成狀態混用。沿用相同 JSON map 模式（`{ videoId: boolean }`），但 key 為 `slowy:miss-honey-completion`，補入 `STORAGE_KEYS`。

**D6：ArticleListItem 新增 showCompletion prop**
理由：首頁 MissHoney 導航卡片只做路由導航，不需完成圈圈。比起另建新元件，在現有 `ArticleListItem` 加可選 `showCompletion`（預設 true）更省程式碼，且不影響現有 ch1–ch4 用法。

**D7：NavBar MissHoney 下拉選單使用 left-0 定位**
理由：與現有「內容」選單保持一致的視覺方向（向右展開）。MissHoney 按鈕左側 offset 約 10.5rem，故選單最大寬度設為 `max-w-[calc(100vw-11rem)]` 防止溢出右側。

**D8：字幕取得由 import tool 自動執行，不交給使用者手動抓**
理由：手動抓字幕不可重跑、不可稽核，也容易漏影片。`scripts/misshoney/import-playlists.mjs` 讀取 `sources.json`，使用 `yt-dlp` 抓播放清單清冊與公開英文字幕/自動字幕，並把 raw outputs 寫入 `_private/misshoney/`。工具不需要 YouTube 登入、不繞過會員或私人影片；抓不到的影片寫入 skipped report。

**D9：import tool 只寫 raw outputs，不覆蓋 curated app content**
理由：匯入工具應可重跑，但不可破壞已整理好的 JSON。工具只寫 `_private/misshoney/inventory/`、`_private/misshoney/transcripts/`、`_private/misshoney/skipped/`，不直接寫 `src/modules/playlists/data/videos/**`。

**D10：內容 scaffold、AI authoring 與 promotion 分成三道門**
理由：raw transcript 可以由規則整理成 scaffold，但中文翻譯、初學者友善的 scenes、vocabGroups、phrases 屬於教學內容 authoring，不應假裝由 deterministic script 自動完成。`scaffold-content` 只產生 `_private/misshoney/content-scaffolds/<level>/<slug>.json`，內容包含 metadata、normalized transcript、建議 scene boundaries 與 authoring context；執行 apply 的 AI agent 依 scaffold/transcript 寫出 `_private/misshoney/generated-content/<level>/<slug>.json`；`validate-content` 檢查 schema 與 completeness；`promote-content` 只接受驗證通過的 JSON，才寫入 `src/modules/playlists/data/videos/<level>/` 並更新 metadata。app runtime 不呼叫任何 AI 或外部 API，只依賴 promotion 後的純 JSON。

**D11：全量內容以等級切割，方便暫停與恢復**
理由：A1–B2 影片數量可能很多。tasks 依 A1、A2、B1、B2 切分，每個等級都有 import review、content generation、validation、promotion、route smoke。若使用者要暫停某等級，可以只暫停該 task group，不需要改動前面已完成的工具與 UI。

**替代方案：直接讓 importer 寫入 app content**
淘汰原因：匯入工具需要可重跑；若直接覆蓋 `src/modules/playlists/data/videos/**`，容易破壞已校稿內容，也難以審查 transcript 到 learning content 的轉換品質。因此採 raw import → generated draft → validation → promotion。

## Implementation Contract

**行為（使用者觀察到的）：**
- 訪問 `/a1`、`/a2`、`/b1`、`/b2` 顯示對應難度的影片清單頁，影片以倒序排列，每張卡片含標題、副標與完成圈圈
- 點擊可學習影片卡片進入 `/a1/ch1-[slug]` 等子頁，顯示該影片完整 learning content
- skipped 影片不顯示為可點擊卡片，不產生子頁路由
- 若某等級被使用者刻意暫停而仍有 `pendingTranscript`，影片子頁顯示「內容整理中」；完整 apply 完成後，所有有 raw transcript 的可學習影片都應為 `ready`
- 首頁文章列表下方出現 MissHoney 區塊，含 A1/A2/B1/B2 四張導航卡片（無完成圈圈）
- NavBar「內容」旁出現「MissHoney ▾」按鈕，點擊展開含 A1–B2 的下拉選單
- 影片完成圈圈點擊後切換狀態，重新整理後保留
- `npm run misshoney:import` 自動抓取 playlist metadata 與公開英文字幕，不要求手動貼字幕
- `npm run misshoney:import -- --check-existing` 在不連 YouTube 的情況下檢查既有 raw outputs coverage
- `npm run misshoney:scaffold-content -- --level a1` 產生或更新該等級的 authoring scaffold，不負責翻譯或挑選教學字彙
- apply agent 依 `_private/misshoney/content-scaffolds/a1/*.json` 與 raw transcript 撰寫 `_private/misshoney/generated-content/a1/*.json`
- `npm run misshoney:validate-content -- --level a1` 驗證該等級所有 draft/app content 完整性
- `npm run misshoney:promote-content -- --level a1` 將驗證通過內容接入 app data 與 routes

**介面與資料形狀：**

`PlaylistData`（a1.ts 等匯出）：
```ts
interface PlaylistData {
  level: 'a1' | 'a2' | 'b1' | 'b2'
  title: string
  youtubePlaylistUrl: string
  videos: PlaylistVideoEntry[]
  skippedVideos: SkippedVideoEntry[]
}
```

`PlaylistVideoEntry`：
```ts
interface PlaylistVideoEntry {
  videoId: string
  slug: string
  title: string
  subtitle?: string
  originalIndex: number
  displayOrder: number
  status: 'ready' | 'pendingTranscript'
  contentLoader: (() => Promise<{ default: PlaylistVideoData }>) | null
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

`PlaylistVideoData`（JSON 檔）：
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

**raw / generated outputs：**
- `_private/misshoney/inventory/<level>.json`：playlist metadata、originalIndex、videoId、title、derived slug、status candidate
- `_private/misshoney/transcripts/<level>/<slug>.json`：normalized English caption cues and merged transcript text
- `_private/misshoney/skipped/<level>.json`：不可學習影片與原因
- `_private/misshoney/import-summary.json`：每個 level 的 inventory、transcript、skipped、missing transcript 統計
- `_private/misshoney/content-scaffolds/<level>/<slug>.json`：由 script 產生的 authoring 素材，含 metadata、source transcript、建議 scene boundaries；不是最終學習內容
- `_private/misshoney/generated-content/<level>/<slug>.json`：由 apply agent 依 scaffold/transcript 撰寫、可 review 的完整 `PlaylistVideoData` draft
- `src/modules/playlists/data/videos/<level>/<slug>.json`：app 實際 lazy load 的完成版內容

**失敗模式：**
- `yt-dlp` 不存在 → import CLI 以非 0 exit 結束，訊息說明設定 `YT_DLP_PATH` 或安裝 `yt-dlp`
- 公開字幕/自動字幕不可取得 → import CLI 將影片寫入 skipped report，原因為 `no-english-captions` 或 `unavailable`
- content scaffold 缺少 transcript 或 metadata → scaffold CLI 以非 0 exit 結束並列出 slug
- generated content 缺少 scenes、vocabGroups、phrases、slug 不一致、videoId 不一致、空翻譯或明顯與 source transcript 無關 → validator 以非 0 exit 結束並列出檔案與欄位
- promotion 遇到未驗證或缺漏 content → 不寫入 app data，保留現有檔案不變
- `contentLoader` 為 null（pendingTranscript）→ PlaylistVideoView 顯示「內容整理中」
- 路由 `/a1/unknown-slug` 無對應影片 → PlaylistVideoView 顯示「找不到此影片」
- localStorage 讀取失敗 → useMissHoneyCompletion 回傳空 map，不 crash

**驗收條件：**
1. `npm run build` 無型別錯誤
2. `npm run misshoney:import` 對 A1–B2 產生 inventory、transcripts、skipped report，且不要求手動貼字幕
3. `npm run misshoney:scaffold-content -- --all` 產生所有 transcript-backed 影片的 authoring scaffold
4. `npm run misshoney:validate-content -- --all` 通過，所有有 transcript 的可學習影片都有由 apply agent 撰寫的完整 `PlaylistVideoData`
5. A1、A2、B1、B2 metadata 中所有有完成 JSON 的影片都是 `ready` 並有 `contentLoader`
6. `/a1`、`/a2`、`/b1`、`/b2` 各顯示對應影片列表，影片以倒序排列
7. 隨機抽查每個等級至少 2 支影片子頁，scenes、vocabGroups、phrases 均渲染成功
8. skipped 影片不出現在列表，也無可用子路由
9. 首頁文章列表下方可見 MissHoney 區塊，A1–B2 四張導航卡片無完成圈圈
10. NavBar「內容」旁可見「MissHoney ▾」，下拉含 A1–B2，點擊導航正確
11. 影片完成狀態點擊後持久化
12. 既有 `/ch1`–`/ch4` 行為與內容不受影響

**範圍邊界：**
- 在範圍內：routes、Vue 元件、TypeScript types、storageKeys、NavBar、HomeView、ArticleListItem、MissHoney import tool、raw output format、content scaffold format、apply-agent content authoring、generated content format、content validation、content promotion、A1–B2 全量可學習影片 JSON 接入
- 不在範圍內：手動字幕抓取、會員/私人內容繞過、app runtime 外部 API、NavBar 窄螢幕排版

## Risks / Trade-offs

- **風險**：YouTube 頁面與字幕可用性會變動。緩解：import tool 透過 `yt-dlp` 取得公開資料，抓不到時明確寫入 skipped report，不要求使用者手動補抓。
- **風險**：全量影片內容生成工期大。緩解：tasks 依工具、import、A1、A2、B1、B2、promotion、驗證切割，使用者可暫停任一 group。
- **風險**：AI authoring 產生的翻譯、字彙、片語品質不穩。緩解：deterministic script 只做 scaffold；所有教學內容必須由 apply agent 依 source transcript 撰寫，先進 generated-content，再由 validator 和抽查任務確認 completeness；promotion 才寫入 app content。
- **取捨**：影片內容用 JSON 而非 TypeScript，缺少編譯期完整型別檢查。緩解：`PlaylistVideoData` 型別定義在 `types.ts`，並以 `validate-content` 做 runtime schema/completeness 驗證。
- **取捨**：ArticleListItem 加 showCompletion prop 改動現有共用元件。影響範圍小，預設值 true 確保既有行為不變。
