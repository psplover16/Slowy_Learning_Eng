## Context

MissHoney A1–B2 的第一版已完成播放清單路由、字幕匯入、內容 JSON 與 promotion 流程，但目前產物仍有兩個缺口。第一，首頁 MissHoney 區塊、播放清單列表與影片內容頁沒有完整沿用既有文章閱讀體驗，導致 ch1 與 MissHoney 的視覺層級、章節導覽與卡片樣式不一致。第二，現有 JSON 是從字幕 cue 與翻譯工具產生的草稿，常見問題包含英文斷句不自然、自動字幕誤字、中文翻譯直譯、單字與片語挑選不精準，不能視為正式學習內容。

本設計以手機優先、離線可用為前提。runtime 只讀取 repository 內已 promote 的 JSON 與 localStorage 完成狀態，不呼叫 YouTube、翻譯服務或 AI API。校稿與內容重建只發生在 build-time tooling / apply 流程。尚未完成的 A2、B1、B2 內容改由 apply 階段的 AI 校稿：AI 需對照 transcript/scaffold 與 generated JSON，在盡量保留完整字幕內容的前提下修正翻譯、英文拼字、語法、斷句與教學解釋錯誤。

## Goals / Non-Goals

**Goals:**

- 首頁 MissHoney A1–B2 導航卡片具有穩定間距，與文章列表視覺一致但不顯示完成圈圈
- A1–B2 播放清單詳細列表使用與首頁文章列表一致的卡片骨架，保留 MissHoney 影片完成狀態
- MissHoney 影片內容頁呈現接近 ch1 的正式閱讀版型：header、quick nav、編號 section、中英對照、單字、片語、句型解析
- 擴充 `PlaylistVideoData`，讓 MissHoney JSON 足以支援正式閱讀頁，而不是簡化草稿頁
- 改寫內容 authoring 規則與 validator，要求所有 ready 影片通過英文句子重建、自然繁中翻譯、教學字彙、片語與句型解析檢查
- 重新校稿既有 85 支 A1–B2 影片內容；已完成的 A1 保持既有成果，尚未完成的 A2、B1、B2 由 AI 校稿並只 promote 通過 validator 的 JSON

**Non-Goals:**

- 不修改 ch1–ch4 的資料內容與路由行為
- 不把 MissHoney 影片改成 `/ch5` 之後的 chapter route
- 不在 runtime 進行字幕抓取、翻譯、AI 生成或外部 API 呼叫
- 不新增登入、同步、多裝置衝突解決或雲端儲存
- 不保證每支 MissHoney 影片達到 ch1 的篇幅密度；本次目標是正式可讀與可學習，不是人工教材長文重寫

## Decisions

### D1: Reuse ArticleListItem semantics for MissHoney navigation lists

首頁 MissHoney 區塊與 A1–B2 詳細列表應共享相同的卡片語意：主標、副標、整張卡片可點擊、右側可選完成按鈕。`ArticleListItem` 已經承載首頁文章列表的視覺語言，因此優先擴充成可支援 RouterLink / button 兩種導航方式，或在 PlaylistView 以等價 class 與結構實作。完成圈圈仍由不同 completion composable 管理，避免 chapter 與 MissHoney 狀態混用。

替代方案：保留 PlaylistView 自製 RouterLink card。淘汰原因是完成按鈕、border、hover 狀態與首頁文章列表不一致，會讓同一產品中兩種列表看起來像不同系統。

### D2: Build a playlist reading layout that mirrors ChapterView without coupling to ChapterData

MissHoney 影片內容頁應使用與 `ChapterView` 類似的閱讀結構：頂部 header、`SectionQuickNav`、編號 section heading、scene block、word tag、phrase card、sentence breakdown。不要直接把 `PlaylistVideoData` 轉成 `ChapterData`，因為 playlist 仍有 videoId、youtubeUrl、level、slug 等播放清單語意。實作上可建立 playlists 專用呈現元件，並在 class 與互動上貼近既有 chapter 元件。

替代方案：讓 PlaylistVideoView import chapters 元件並用 adapter 假裝成 ChapterData。淘汰原因是欄位語意不同，adapter 會隱藏資料差異，後續校稿或 validator 也難以辨識 playlist 專屬錯誤。

### D3: Expand PlaylistVideoData to support polished learning content

`PlaylistVideoData` 需要從目前的 scenes / vocabGroups / phrases 擴充為可支援正式閱讀頁的資料。建議 shape 為：

- `header`: podcastLabel、titleZh、titleEn、levelTag、topicTag
- `scenes`: id、no、titleZh、titleEn、sentences、tags
- `vocabGroups`: title、items；每個 item 包含 english、kk、partOfSpeech、meaning、note、highlight
- `phrases`: id、phrase、meaning、examples；examples 使用英文與繁中分行
- `breakdowns`: id、sentence、translation、points；points 包含 label、text、note

為了降低一次改動風險，可讓 renderer 在過渡期支援舊欄位，但 validator 與 promotion 必須以新欄位為 ready 內容門檻。完成後不應再產生只有舊 schema 的新 JSON。

### D4: Treat current generated content as draft and require content QA before promotion

既有 85 支 JSON 只能當作素材來源，不可視為正式稿。新的 authoring 流程要先從 transcript cue 重建自然英文句子，再做繁中翻譯與教學拆解。未完成的 A2、B1、B2 校稿由 AI 執行，AI 必須盡量保留 transcript 的完整有意義內容；只有字幕重疊、明顯自動字幕誤字、口頭填充雜訊或無法形成自然學習句子的片段可以被合併、修正或刪除。每個 ready 影片至少需要：可閱讀的 scene 分段、每個 scene 有標題、句子英文與繁中都自然、至少一組重點單字、至少一組重點片語、至少一組句型解析。若 transcript 品質太差，該影片應留在 generated draft review 狀態，不應 promote 成 ready。

替代方案：只用 validator 檢查欄位存在。淘汰原因是目前問題主要是內容品質，不是欄位缺漏；只檢查 schema 會讓不通順的機器草稿繼續進入正式頁面。

### D5: Keep offline runtime data simple and explicit

正式內容仍存放在 `src/modules/playlists/data/videos/<level>/<slug>.json`，由 metadata 中的 contentLoader lazy import。完成狀態仍使用 localStorage key `slowy:miss-honey-completion`，shape 為 `{ [videoId: string]: boolean }`；初始值為空物件，讀取失敗時回到空物件且不阻斷頁面。Pinia 不新增 store，IndexedDB 不納入本次，因為 MissHoney 內容是 bundled JSON，不是使用者可編輯或需要同步的大量狀態。

同步策略：沒有遠端同步。衝突處理：若同一 videoId 被重複寫入 completion map，最後一次 localStorage 寫入為準；若影片 JSON 被重新 promote，completion 狀態仍以 videoId 保留。

### D6: Add tests around visual contracts and content quality gates

TDD 應先覆蓋三種可觀察行為：首頁 MissHoney gap、PlaylistView 卡片與完成切換、PlaylistVideoView 的 ch1-like section rendering。工具層要新增 validator 測試，至少能拒絕舊 schema、空翻譯、明顯 cue fragment、過長未切分句子、缺少 breakdowns 的 ready content。E2E 至少抽查首頁、A1 列表、每個等級一支影片內容頁。

## Implementation Contract

**Behavior:**

- 使用者訪問首頁時，文章列表仍在上方，MissHoney 區塊在下方；A1、A2、B1、B2 四張導航卡片之間有與文章列表一致的垂直間距，且不顯示完成圈圈
- 使用者訪問 `/a1`、`/a2`、`/b1`、`/b2` 時，影片清單卡片與首頁文章列表視覺一致，右側完成圈圈可切換並持久化到 MissHoney completion storage
- 使用者訪問任一 ready 影片子頁時，頁面呈現 header、quick nav、對話內容、單字、片語、句型解析；section 只在對應資料非空時顯示，編號依可見 section 自動排序
- 中英對照句子在手機版必須分行顯示，繁中翻譯不可與英文擠在同一行
- 若影片資料仍未通過新 validator，不應被 promote 為 ready；已存在舊 schema 的 JSON 必須重新校稿或被 validator 拒絕
- 尚未完成的 A2、B1、B2 內容由 AI 校稿。AI 校稿時必須對照 transcript/scaffold/source JSON，保留完整有意義字幕內容，並修正翻譯、英文拼字、語法、斷句、vocab/phrases/breakdowns 解釋錯誤；不得只摘要影片或大幅刪除可學習內容來規避校稿。

**Interface / data shape:**

`PlaylistVideoData` 新增或調整為正式閱讀 content shape，至少包含 `header`、`scenes`、`vocabGroups`、`phrases`、`breakdowns`。renderer 可以短期容忍舊欄位以避免開發途中空白頁，但 `validate-content` 與 `promote-content` 必須要求新欄位。

`PlaylistScene` 必須有 `id`、`no`、`titleZh`、`titleEn`、`sentences`、`tags`。`sentences` 每筆有 `en` 與 `tc`，英文應是完整句或自然短句，不應只是字幕 cue 片段。

`PlaylistVocabItem` 必須有 `english`、`kk`、`partOfSpeech`、`meaning`，可選 `note` 與 `highlight`。`PlaylistPhrase` 必須有 `id`、`phrase`、`meaning`、`examples`。`PlaylistSentenceBreakdown` 必須有 `id`、`sentence`、`translation`、`points`。

**Tooling contracts:**

- `npm run misshoney:scaffold-content -- --all` 產生的 scaffold 要包含 normalized transcript、cue source、建議 scene boundaries，以及 authoring checklist
- `npm run misshoney:validate-content -- --all` 必須拒絕缺少新欄位或品質門檻未過的 content，並列出 level、slug、欄位與原因
- `npm run misshoney:promote-content -- --all` 只允許已通過 validator 的 generated content 進入 app data
- AI 校稿需留下 apply 回報紀錄：每個完成等級至少列出校稿範圍、使用的驗證命令，以及抽查 slug；若修正了字幕拼字、翻譯或解釋錯誤，回報中需摘要修正類型，不需逐字貼完整內容。

**Failure modes:**

- 影片找不到或 contentLoader 缺失時，子頁顯示既有的「找不到此影片」或「內容整理中」，不得 console error
- localStorage 解析失敗時，完成狀態回到空 map，不阻斷清單或內容頁
- validator 發現舊 schema、空翻譯、疑似字幕 cue fragment、缺少 breakdowns 或過長段落時，以非 0 exit 結束，不改寫 app data
- promotion 遇到未通過 validator 的影片時，停止 promotion 並保留既有 app content

**Acceptance criteria:**

- `npm run test` 通過，且包含 HomeView、PlaylistView、PlaylistVideoView、content validator 的新增或更新測試
- `npm run build` 通過，無 chunk 警戒 regression
- `npm run misshoney:validate-content -- --all` 通過後，A1–B2 所有 ready JSON 都是新 schema
- Playwright smoke 覆蓋首頁 MissHoney gap、A1 列表卡片、每個等級至少一支影片內容頁
- AI 抽查每個等級至少 2 支影片，確認已盡量保留完整字幕、英文斷句自然、繁中翻譯順暢、單字片語與句型解析正確可讀，並在 apply 回報列出 level/slug

**Scope boundaries:**

在範圍內：HomeView、ArticleListItem、PlaylistView、PlaylistVideoView、playlists 專用呈現元件、PlaylistVideoData 型別、content scaffold / validator / promotion、A1–B2 generated JSON 校稿、相關測試與 PROJECT_ARCHITECTURE.md 更新。

不在範圍內：ch1–ch4 資料改寫、YouTube 權限繞過、runtime 外部 API、雲端同步、IndexedDB migration、NavBar 大幅重排。

## Risks / Trade-offs

- [Risk] 85 支影片逐支校稿耗時，可能讓 apply 過長 → Mitigation: tasks 依工具、UI、schema、A1、A2、B1、B2 切割，每個等級可獨立暫停與恢復
- [Risk] validator 無法完全判斷翻譯是否自然 → Mitigation: validator 擋明顯低品質模式，tasks 仍要求每個等級 AI 校稿、抽查與必要修稿
- [Risk] schema 擴充會讓既有 JSON 暫時不相容 → Mitigation: renderer 開發期可容忍舊資料，但 promotion 完成前必須全量轉新 schema
- [Risk] 共用 ArticleListItem 可能被播放清單需求污染 → Mitigation: 只加入通用、明確的 props；若 props 變得過多，改建 playlist 專用 wrapper 並保持同等視覺
- [Trade-off] 不使用 IndexedDB 會讓 bundled JSON 增加 build assets → Mitigation: 內容仍透過 lazy import 分包，build 後檢查 chunk 大小與 PWA precache 體積

## Migration Plan

1. 先更新型別、validator 與測試，讓舊 JSON 被明確標成不合格草稿
2. 更新 UI renderer，使新 schema 可正確顯示，並保持 loading / not-found / pendingTranscript 狀態可用
3. 依等級重建並由 AI 校稿 generated content，通過 validator 後逐級 promote
4. 完成全量 promotion 後跑 test、build、E2E smoke 與 AI 抽查

Rollback 策略：若內容 promotion 出現品質問題，可回退該等級的 generated content 與 metadata promotion；runtime 仍只讀取最後一次通過 build 的 bundled JSON，不涉及使用者資料 migration。localStorage completion 以 videoId keyed，不需清除。
