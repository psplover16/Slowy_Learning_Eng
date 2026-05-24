## 1. TDD 與現況失敗案例

- [x] [P] 1.1 為「Home view displays a separated MissHoney navigation section」與「Article chapter list remains unchanged by MissHoney section」新增 HomeView 測試，先證明 MissHoney A1–B2 卡片需要穩定 gap、無完成圈圈，且 ch1 完成狀態仍寫入 `slowy:completion`；以 `npm run test -- HomeView` 驗證測試先失敗再通過。
- [x] [P] 1.2 為「Playlist level pages use article-list card styling」新增 PlaylistView 測試，覆蓋卡片結構、垂直間距、右側 MissHoney 完成切換與 storage 隔離；以 `npm run test -- PlaylistView` 驗證。
- [x] [P] 1.3 為「Playlist video pages render a polished reading layout」、「Playlist reading sections are data-driven」與「Playlist pages handle unavailable content without console errors」新增 PlaylistVideoView 測試，覆蓋 header、quick nav、動態 section、mobile 中英分行、unknown slug 與 pendingTranscript；以 `npm run test -- PlaylistVideoView` 驗證。
- [x] [P] 1.4 為「Playlist content uses the polished learning schema」、「Transcript cues are rebuilt into natural bilingual sentences」、「Vocabulary, phrases, and sentence breakdowns are instructional」與「Promotion is gated by validation」新增 content tooling 測試，要求舊 schema、空翻譯、cue fragment、缺少 breakdowns、未驗證 promotion 都會失敗；以 `npm run test -- contentCore` 或對應 validator 測試檔驗證。

## 2. Schema 與工具品質門檻

- [x] 2.1 落實 D3: Expand PlaylistVideoData to support polished learning content，擴充 `src/modules/playlists/types.ts` 的 header、scenes、vocabGroups、phrases、breakdowns 型別，完成後 TypeScript 可描述正式閱讀 schema；以 `npm run test -- PlaylistVideoView` 與 `npm run build` 驗證。
- [x] 2.2 落實 D4: Treat current generated content as draft and require content QA before promotion，讓 validator 將目前只有 scenes/vocabGroups/phrases 的舊 JSON 視為 draft 並拒絕 promote；以新增 validator 測試與 `npm run misshoney:validate-content -- --level a1` 目前會列出待修內容作為驗證。
- [x] 2.3 落實「Scaffold output guides human or AI-assisted authoring」，更新 scaffold output，讓每支影片 scaffold 包含 normalized transcript、cue references、suggested scene boundaries、authoring checklist 與新 schema skeleton；以 `npm run misshoney:scaffold-content -- --level a1` 抽查 scaffold 欄位驗證。
- [x] 2.4 落實「Transcript cues are rebuilt into natural bilingual sentences」，在 validator 增加 cue fragment 與過長未切分句子的品質檢查，完成後明顯斷裂句子會回報 scene id 與 sentence index；以 validator 單元測試與一個故意錯誤 fixture 驗證。
- [x] 2.5 落實「Vocabulary, phrases, and sentence breakdowns are instructional」，在 validator 檢查 KK、partOfSpeech、meaning、phrase examples、breakdown points 的必填與非空條件；以 validator 單元測試驗證。
- [x] 2.6 落實「Promotion is gated by validation」，讓 `promote-content` 在任何 generated content 未通過 polished validator 時停止且不改寫 app data；以 promotion 失敗 fixture 測試與 git diff 無 app data 改動驗證。

## 3. UI 對齊與閱讀頁呈現

- [x] 3.1 落實 D1: Reuse ArticleListItem semantics for MissHoney navigation lists，調整 `ArticleListItem` 或建立等價 playlist wrapper，使首頁與 PlaylistView 使用相同卡片語意但 storage 各自獨立；以 HomeView / PlaylistView 測試驗證。
- [x] 3.2 實作「Home view displays a separated MissHoney navigation section」，讓首頁 MissHoney A1–B2 卡片有穩定 gap、無完成圈圈、點擊導向 `/a1`、`/a2`、`/b1`、`/b2`；以 HomeView 測試與手機/桌機手動檢查驗證。
- [x] 3.3 實作「Article chapter list remains unchanged by MissHoney section」，確認 ch1–ch4 卡片完成圈圈、標題副標、導航與 localStorage 行為不受 MissHoney 區塊影響；以 HomeView 測試驗證。
- [x] 3.4 實作「Playlist level pages use article-list card styling」，讓 `/a1`–`/b2` 詳細列表套用文章列表卡片視覺、保留 MissHoney 完成切換與倒序影片順序；以 PlaylistView 測試與 `/a1` 手動檢查驗證。
- [x] 3.5 落實 D2: Build a playlist reading layout that mirrors ChapterView without coupling to ChapterData，建立 playlists 專用 header、scene、word、phrase、breakdown 呈現元件，視覺對齊 ch1 但資料仍使用 PlaylistVideoData；以 PlaylistVideoView 測試驗證。
- [x] 3.6 實作「Playlist video pages render a polished reading layout」，讓 ready 影片頁呈現 header、YouTube source、SectionQuickNav、編號 section、中英對照、單字、片語、句型解析；以 PlaylistVideoView 測試與手動檢查 `/a1/<ready-slug>` 驗證。
- [x] 3.7 實作「Playlist reading sections are data-driven」，讓 MissHoney quick nav 與 section DOM 只出現非空資料，section 編號依可見區塊自動排序；以 PlaylistVideoView 動態 section 測試驗證。
- [x] 3.8 實作「Playlist pages handle unavailable content without console errors」，確保 loading、unknown slug、pendingTranscript、localStorage parse failure 都有 fallback 且不丟 uncaught error；以 PlaylistVideoView / completion composable 測試驗證。

## 4. A1 內容重新校稿與 promote

- [x] [P] 4.1 重新校稿 A1 ch1–ch6，使「Existing MissHoney generated content is treated as draft until revalidated」落實為新 schema 正式稿：英文句子自然重建、繁中翻譯順暢、含單字片語句型解析；以內容 review 清單與 validator 驗證這 6 支。
- [x] [P] 4.2 重新校稿 A1 ch7–ch12，交付同樣的新 schema 正式稿與內容品質；以內容 review 清單與 validator 驗證這 6 支。
- [x] [P] 4.3 重新校稿 A1 ch13–ch18，交付同樣的新 schema 正式稿與內容品質；以內容 review 清單與 validator 驗證這 6 支。
- [x] 4.4 執行 A1 全等級驗證與 promotion，確保 A1 所有 ready JSON 通過 polished validator 並寫入 app data；以 `npm run misshoney:validate-content -- --level a1`、`npm run misshoney:promote-content -- --level a1` 與 `/a1` route smoke 驗證。

## 5. A2 內容 AI 校稿與 promote

- [x] [P] 5.1 依「AI proofreading preserves transcript coverage and corrects learning errors」由 AI 校稿 A2 ch1–ch10：對照 transcript/scaffold 與 generated JSON，盡量保留完整有意義字幕，不摘要或大幅刪除內容，並修正翻譯、英文拼字、語法、斷句、單字片語與句型解析錯誤；以校稿紀錄、抽查 slug 與 `npm run misshoney:validate-content -- --level a2 --generated-only` 驗證這 10 支。
- [x] [P] 5.2 依「AI proofreading preserves transcript coverage and corrects learning errors」由 AI 校稿 A2 ch11–ch20：對照 transcript/scaffold 與 generated JSON，盡量保留完整有意義字幕，不摘要或大幅刪除內容，並修正翻譯、英文拼字、語法、斷句、單字片語與句型解析錯誤；以校稿紀錄、抽查 slug 與 `npm run misshoney:validate-content -- --level a2 --generated-only` 驗證這 10 支。
- [x] [P] 5.3 依「AI proofreading preserves transcript coverage and corrects learning errors」由 AI 校稿 A2 ch21–ch29：對照 transcript/scaffold 與 generated JSON，盡量保留完整有意義字幕，不摘要或大幅刪除內容，並修正翻譯、英文拼字、語法、斷句、單字片語與句型解析錯誤；以校稿紀錄、抽查 slug 與 `npm run misshoney:validate-content -- --level a2 --generated-only` 驗證這 9 支。
- [x] 5.4 執行 A2 全等級驗證與 promotion，確保 A2 AI 校稿後所有 ready JSON 通過 polished validator 並寫入 app data；以 `npm run misshoney:validate-content -- --level a2`、`npm run misshoney:promote-content -- --level a2` 與 `/a2` route smoke 驗證。

## 6. B1 內容 AI 校稿與 promote

- [x] [P] 6.1 依「AI proofreading preserves transcript coverage and corrects learning errors」由 AI 校稿 B1 ch1–ch7：對照 transcript/scaffold 與 generated JSON，盡量保留完整有意義字幕，不摘要或大幅刪除內容，並修正翻譯、英文拼字、語法、斷句、單字片語與句型解析錯誤；以校稿紀錄、抽查 slug 與 `npm run misshoney:validate-content -- --level b1 --generated-only` 驗證這 7 支。
- [x] [P] 6.2 依「AI proofreading preserves transcript coverage and corrects learning errors」由 AI 校稿 B1 ch8–ch14：對照 transcript/scaffold 與 generated JSON，盡量保留完整有意義字幕，不摘要或大幅刪除內容，並修正翻譯、英文拼字、語法、斷句、單字片語與句型解析錯誤；以校稿紀錄、抽查 slug 與 `npm run misshoney:validate-content -- --level b1 --generated-only` 驗證這 7 支。
- [x] [P] 6.3 依「AI proofreading preserves transcript coverage and corrects learning errors」由 AI 校稿 B1 ch15–ch21：對照 transcript/scaffold 與 generated JSON，盡量保留完整有意義字幕，不摘要或大幅刪除內容，並修正翻譯、英文拼字、語法、斷句、單字片語與句型解析錯誤；以校稿紀錄、抽查 slug 與 `npm run misshoney:validate-content -- --level b1 --generated-only` 驗證這 7 支。
- [x] 6.4 執行 B1 全等級驗證與 promotion，確保 B1 AI 校稿後所有 ready JSON 通過 polished validator 並寫入 app data；以 `npm run misshoney:validate-content -- --level b1`、`npm run misshoney:promote-content -- --level b1` 與 `/b1` route smoke 驗證。

## 7. B2 內容 AI 校稿與 promote

- [x] [P] 7.1 依「AI proofreading preserves transcript coverage and corrects learning errors」由 AI 校稿 B2 ch1–ch6：對照 transcript/scaffold 與 generated JSON，盡量保留完整有意義字幕，不摘要或大幅刪除內容，並修正翻譯、英文拼字、語法、斷句、單字片語與句型解析錯誤；以校稿紀錄、抽查 slug 與 `npm run misshoney:validate-content -- --level b2 --generated-only` 驗證這 6 支。
- [x] [P] 7.2 依「AI proofreading preserves transcript coverage and corrects learning errors」由 AI 校稿 B2 ch7–ch12：對照 transcript/scaffold 與 generated JSON，盡量保留完整有意義字幕，不摘要或大幅刪除內容，並修正翻譯、英文拼字、語法、斷句、單字片語與句型解析錯誤；以校稿紀錄、抽查 slug 與 `npm run misshoney:validate-content -- --level b2 --generated-only` 驗證這 6 支。
- [x] [P] 7.3 依「AI proofreading preserves transcript coverage and corrects learning errors」由 AI 校稿 B2 ch13–ch17：對照 transcript/scaffold 與 generated JSON，盡量保留完整有意義字幕，不摘要或大幅刪除內容，並修正翻譯、英文拼字、語法、斷句、單字片語與句型解析錯誤；以校稿紀錄、抽查 slug 與 `npm run misshoney:validate-content -- --level b2 --generated-only` 驗證這 5 支。
- [x] 7.4 執行 B2 全等級驗證與 promotion，確保 B2 AI 校稿後所有 ready JSON 通過 polished validator 並寫入 app data；以 `npm run misshoney:validate-content -- --level b2`、`npm run misshoney:promote-content -- --level b2` 與 `/b2` route smoke 驗證。

## 8. 全量驗收與文件同步

- [x] 8.1 落實 D5: Keep offline runtime data simple and explicit，確認 runtime 只讀 bundled JSON 與 `slowy:miss-honey-completion`，不新增外部 API、Pinia store 或 IndexedDB migration；以 code review、`npm run build` 與離線手動檢查驗證。
- [x] 8.2 落實 D6: Add tests around visual contracts and content quality gates，跑完整 `npm run test`，確認 HomeView、PlaylistView、PlaylistVideoView、validator、promotion gating 測試全部通過。
- [x] 8.3 跑 `npm run misshoney:validate-content -- --all`，確認 A1–B2 所有 ready 影片皆使用 polished schema，且 A2/B1/B2 已符合 AI 校稿後的內容品質門檻。
- [x] 8.4 跑 `npm run build`，確認 TypeScript、Vite build、PWA precache 無錯誤，且沒有明顯 chunk 警戒 regression。
- [x] 8.5 新增或更新 Playwright smoke，覆蓋首頁 MissHoney gap、A1 詳細列表卡片、A1/A2/B1/B2 各一支 ready 影片內容頁；以 Playwright 指令與離線模式手動檢查驗證。
- [x] 8.6 更新 `PROJECT_ARCHITECTURE.md`，記錄 polished MissHoney UI、content schema、validator、promotion 與離線資料責任邊界；以文件 review 驗證內容與實作一致。
- [x] 8.7 最終 AI 抽查每個等級至少 2 支影片，確認已盡量保留完整有意義字幕、英文拼字與語法正確、斷句自然、繁中翻譯順暢、單字片語與句型解析正確可讀，並在 apply 回報列出抽查的 level/slug 與主要修正類型。
