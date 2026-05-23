## 1. 測試先行

- [x] [P] 1.1 為 `Single-video transcript extraction command`、`Proofread result JSON is the parser contract` 與 `A1 ch1 vertical slice is a real proofread run` 新增失敗測試，驗證單支字幕命令可解析 A1 ch1 metadata、無字幕時非零退出、parser 接受 required JSON shape 並拒絕缺欄位或 HTML 字串；以 `npm run test -- misshoney` 或對應 tooling test 指令先失敗再通過。
- [x] [P] 1.2 為 `Ready video JSON supports structured inline text`、`Marker targets resolve to learning entries`、`Special usage entries are first-class video content` 與 `Vocabulary entries merge inflected forms by lemma` 新增 validator 失敗測試，驗證 inline tokens、`targetId`、`instanceId`、特殊用法區塊與 lemma 合併規則；以 `npm run test -- contentCore` 先失敗再通過。
- [x] [P] 1.3 為 `Playlist video page supports precise English marker navigation`、`Learning item returns to the source marker instance`、`Special usages render as an independent section` 與 `Grammar navigation is section-based, not inline-marker-based` 新增 PlaylistVideoView / Playwright 失敗測試，驗證英文 marker 精準跳轉、置中、高亮、回原文 instance、特殊用法 quick nav 與文法不由 inline marker 觸發；以 `npm run test -- PlaylistVideoView` 與目標 e2e smoke 先失敗再通過。
- [x] [P] 1.4 為 `MissHoney grammar supplements are conservative` 與 `MissHoney supplements preserve grammar page organization` 新增 grammar 測試，驗證明確匹配才補充既有卡片、分類不確定留在影片頁、group order 與 badge 不變；以 `npm run test -- GrammarView` 或對應 grammar data test 先失敗再通過。

## 2. Tooling 與資料契約

- [x] 2.1 落實 `D1: Add a single-video transcript command for controlled reruns`，新增單支字幕命令，讓 `npm run misshoney:fetch-transcript -- --level a1 --slug ch1-slow-english-for-beginners-a1-listening-practice --out _private/tmp.txt` 只覆寫該輸出檔並在錯誤時回報 level、slug、YouTube URL 與原因；以 1.1 測試與實際指令驗證。
- [x] 2.2 落實 `D2: Treat proofread_result JSON as the machine contract` 的副代理契約，確認 `.codex/agents/english_proofreader.toml` 強制輸出 `correctedText`、`translation`、`segments`、`words`、`phrases`、`usages`、`grammar` JSON code block；以 `python -c "import tomllib, pathlib; data=tomllib.loads(pathlib.Path('.codex/agents/english_proofreader.toml').read_text(encoding='utf-8')); assert 'correctedText' in data['developer_instructions']"` 驗證。
- [x] 2.3 落實 `D2: Treat proofread_result JSON as the machine contract` 的 parser，讀取 `_private/proofread_result.md` 中的 JSON code block，輸出 normalized draft，拒絕缺欄位、非法 JSON、HTML 字串與無法對齊的 marker；以 1.1 測試與 parser CLI dry run fixture 驗證。
- [x] 2.4 落實 `D3: Extend PlaylistVideoData with structured inline tokens and usages`，擴充 `PlaylistVideoData` 型別與 validator，使 ready JSON 可描述英文 tokens、word/phrase/usage target、特殊用法、anchor id、lemma 合併與文法區塊；以 1.2 測試與 `npm run misshoney:validate-content -- --level a1` 驗證。
- [x] 2.5 強化 promotion gate，確保 parser 或 validator 失敗時不覆寫 app video JSON，並在失敗輸出列出 level、slug、欄位與 target id；以 1.1、1.2 測試和一次故意壞 JSON dry run 驗證。

## 3. Playlist 影片頁互動

- [x] 3.1 落實 `D4: Implement precise marker navigation in PlaylistVideoView only` 的英文 token render，讓 PlaylistVideoView 只把英文 word、phrase、usage token 渲染成可點擊 marker，中文翻譯保持純文字；以 1.3 測試驗證。
- [x] 3.2 落實 `Playlist video page supports precise English marker navigation`，點擊 `word-*`、`phrase-*`、`usage-*` marker 時 smooth scroll 到單一講解卡片、使用 center 對齊並套用短暫高亮；以 1.3 測試與 Playwright screenshot/assertion 驗證。
- [x] 3.3 落實 `Learning item returns to the source marker instance`，同一 marker 文字出現多次時，講解卡片的回原文動作回到最後點擊的 `instanceId`，不是固定回第一個 marker；以 1.3 測試驗證第二個 `apple` instance。
- [x] 3.4 落實 `Special usages render as an independent section` 與 `Special usage entries are first-class video content`，影片頁以獨立區塊呈現特殊用法並在 quick nav 出現對應入口，無 usages 時不渲染空區塊；以 1.3 測試驗證。
- [x] 3.5 落實 `Grammar navigation is section-based, not inline-marker-based`，文法 / 句型解析只透過 quick nav 或區塊按鈕跳轉，英文全文不產生 grammar inline marker；以 1.3 測試驗證 DOM 中沒有 grammar marker token。

## 4. A1 ch1 真實 vertical slice

- [x] 4.1 執行 `Single-video transcript extraction command` 真實流程，針對 A1 ch1 把公開英文字幕覆寫到 `_private/tmp.txt`，不得使用人工 fixture 取代；以指令 exit code 0、檔案非空與人工抽查前 20 行字幕驗證。
- [x] 4.2 執行 `english_proofreader` 真實檔案 I/O 流程，讀取 `_private/tmp.txt` 並覆寫 `_private/proofread_result.md`，輸出 Markdown 六大區塊與 JSON code block；以檔案存在、JSON 可解析、`words`/`phrases`/`usages`/`grammar` 陣列存在驗證。
- [x] 4.3 使用 parser 寫回 A1 ch1 JSON，完成 `A1 ch1 vertical slice is a real proofread run`：A1 ch1 內容來自 `_private/proofread_result.md` JSON，主代理只做 normalization / correction 且不改變字幕主要內容；以 git diff、content review 與 `npm run misshoney:validate-content -- --level a1` 驗證。
- [x] 4.4 落實 `D5: Conservatively supplement grammar route` 與 `MissHoney grammar supplements are conservative`，只把 A1 ch1 中明確匹配既有 grammar card 的文法補充到 grammar route，分類不確定者留在 A1 ch1 文法區；以 1.4 測試與人工 review 補充項目驗證。
- [x] 4.5 驗證 `MissHoney supplements preserve grammar page organization`，確認 grammar group order、card order 與 badge 仍與既有規格一致；以 `npm run test -- GrammarView` 驗證。

## 5. 離線邊界與完整驗證

- [x] 5.1 落實 `D6: Keep runtime storage unchanged and offline-first`，確認 runtime 只 lazy load bundled JSON，不新增 Pinia store、localStorage key、IndexedDB migration、瀏覽器端 YouTube fetch、翻譯服務或 AI API；以 `rg "fetch\(|indexedDB|createPinia|localStorage|youtube" src scripts -n` 的 code review、`npm run build` 與離線手動檢查驗證。
- [x] 5.2 更新 `PROJECT_ARCHITECTURE.md`，記錄單支字幕命令、proofread JSON parser、inline token schema、特殊用法區塊、精準 marker navigation、grammar 保守補充與 runtime 離線邊界；以文件 review 對照 proposal/design/specs 驗證。
- [x] 5.3 跑單元與內容驗證，確認 tooling、validator、PlaylistVideoView、GrammarView 與 A1 content quality gate 全部通過；以 `npm run test` 與 `npm run misshoney:validate-content -- --level a1` 驗證。
- [x] 5.4 跑 build 與 e2e smoke，確認 A1 ch1 頁面在手機/桌機 viewport 可顯示特殊用法區、marker 跳轉、高亮、回原文與 quick nav 文法區；以 `npm run build` 與目標 Playwright smoke 驗證。
- [x] 5.5 落實 `Later playlist refresh tasks remain planned but unexecuted in the first pass`，完成第一輪 apply 邊界檢查：只標記基礎能力與 A1 ch1 相關任務完成，Phase 6 後續 rollout 任務保持未完成並在回報中列明；以 `spectra instructions apply --change "refresh-misshoney-proofread-content-and-navigation" --json` 檢查剩餘任務驗證。

## 6. Paused 後續 rollout 任務

- [ ] 6.1 Paused: 展開 A1 剩餘影片 refresh 任務，對 A1 ch2 到 A1 最後一支 ready 影片逐支套用字幕提取、`english_proofreader`、parser、JSON 寫回、validator、route smoke 流程；只在使用者明確要求 Phase 2 時執行，並以每支影片各自的 `npm run misshoney:validate-content -- --level a1` 與抽查頁面驗證。
- [ ] 6.2 Paused: 展開 A2 全部影片 refresh 任務，逐支套用與 A1 ch1 相同流程並保留每支影片 proofread review 證據；只在使用者明確要求 Phase 3 時執行，並以 `npm run misshoney:validate-content -- --level a2` 與 A2 route smoke 驗證。
- [ ] 6.3 Paused: 展開 B1 全部影片 refresh 任務，逐支套用與 A1 ch1 相同流程並保留每支影片 proofread review 證據；只在使用者明確要求 Phase 4 時執行，並以 `npm run misshoney:validate-content -- --level b1` 與 B1 route smoke 驗證。
- [ ] 6.4 Paused: 展開 B2 全部影片 refresh 任務，逐支套用與 A1 ch1 相同流程並保留每支影片 proofread review 證據；只在使用者明確要求 Phase 5 時執行，並以 `npm run misshoney:validate-content -- --level b2` 與 B2 route smoke 驗證。
