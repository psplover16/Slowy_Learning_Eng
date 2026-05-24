## Context

目前 MissHoney 播放清單詳細頁已有內容與互動基礎，但舊 change 的落點是 A1 ch1 與 paused rollout；本次需求改為直接全量處理 A1、A2、B1、B2 全部字幕。原始字幕已放在 _private/tmp/originalContent/，實作必須以本地檔案為來源，透過副代理檔案 I/O 產生 step1 proofread output，再寫回既有 route 使用的影片資料來源。

此變更跨越副代理設定、批次 tooling、影片資料 schema、PlaylistVideoView 互動、grammar 路由與驗證報告。runtime 仍是純前端 PWA；完成後影片資料必須 bundled 進 app，離線可讀，不新增瀏覽器端 AI、YouTube fetch 或伺服器功能。

## Goals / Non-Goals

**Goals:**

- 全量處理 A1、A2、B1、B2 全部原始字幕檔，順序固定且不在 A1 ch1 後暫停。
- 每支字幕使用新的 english_proofreader 副代理，處理完該支字幕後關閉。
- 將 proofread JSON 解析並寫回既有 MissHoney 影片資料，使 route 顯示校稿、翻譯、單字、片語、特殊用法與文法解析。
- 從所有影片累積 grammar.md，透過 grammar_organizer 產出由簡到難排序的 grammar_deal.md，再同步到 /grammar。
- 建立總驗證，覆蓋字幕數、JSON 結構、app 寫回、grammar 同步、UI 互動與 lint/test/build。

**Non-Goals:**

- 不重新從 YouTube 抓字幕。
- 不讓同一個 english_proofreader 連續處理多支影片。
- 不新增全文文法 D 類 marker。
- 不新增 route 未使用的平行資料來源。
- 不引入 runtime AI API、翻譯服務、伺服器功能、localStorage/IndexedDB migration 或新的 Pinia store。

## Decisions

### Use local originalContent as the source of truth

本次批次輸入只讀 _private/tmp/originalContent/a1、a2、b1、b2。Markdown 檔直接作為字幕；JSON 檔必須先用結構化解析抽出 transcript/text 字幕欄位，再送入 proofreader。

替代方案：重新抓 YouTube 字幕。淘汰原因是使用者已準備好本地字幕，且重新抓取會引入網路不穩、來源變動與權限風險。

### Use one proofreader subagent per subtitle

每支影片處理流程是開啟 english_proofreader、處理一篇字幕、輸出 step1 檔、關閉該副代理。主流程負責遍歷檔案與記錄成功失敗清單。

替代方案：用同一個副代理連續處理整個 level。淘汰原因是長文本會造成 context 汙染、輸出截斷與跨影片內容混淆。

### Treat proofread JSON as the write-back contract

step1 Markdown 的人類可讀區塊只供檢查；app 寫回優先使用最後的 machine-readable JSON。JSON 必須含 correctedText、translation、segments、words、phrases、usages、grammar。JSON 壞掉時可退回 Markdown 解析，但該影片必須列入待修清單。

替代方案：只解析 Markdown 表格。淘汰原因是表格對長文本、換行、marker 與中文內容更脆弱，難以穩定批次寫回。

### Keep marker navigation limited to A/B/C

PlaylistVideoView 只把英文全文中的 word、phrase、usage token 做成可點擊 marker。文法 / 句型解析不由正文 marker 觸發，而是透過 quick nav 或區塊按鈕跳轉。

替代方案：新增 D 類 grammar inline marker。淘汰原因是 english_proofreader 的現有契約不在正文標 D 類，硬加會破壞可讀性並擴大 parser 風險。

### Accumulate grammar first, organize once at the end

每支影片完成後把 grammar 區塊累積到 _private/tmp/grammar.md。全部影片完成後才呼叫 grammar_organizer，輸出 _private/tmp/grammar_deal.md，由它合併重複、統一術語、標先修關係並由簡到難排序。

替代方案：每支影片即時更新 /grammar。淘汰原因是全量內容會產生重複文法與先後排序問題，最後集中整理更容易保持 pedagogical order。

### Make final verification a first-class artifact

總驗證不是手動看一頁，而是產出可檢查的報告：原始字幕數、step1 數、JSON 成功數、待修影片、已寫回 app route 數、grammar 新增/補充數、UI 抽查頁面、lint/test/build 結果與剩餘風險。

替代方案：只跑 npm run build。淘汰原因是 build 無法證明 proofread 覆蓋率、JSON 品質、marker 跳轉與 grammar 同步。

## Implementation Contract

### Batch proofread behavior

- Behavior: apply 執行後會依序處理 A1、A2、B1、B2 的原始字幕，除系統性錯誤外不在 A1 第一支後停下。
- Interface / data shape: input 是 _private/tmp/originalContent/<level>/<slug>.md 或 .json；output 是 _private/tmp/step1/<level>/<slug>.md。
- Failure modes: 單支字幕 JSON schema 不明、proofread JSON 壞掉或欄位缺失時，該影片進入待修清單；只有無法繼續遍歷、無法寫檔、或 parser 契約整體失效時才中止批次。
- Acceptance criteria: 原始字幕總數與 step1 output 總數相符，且待修清單列出所有失敗影片。
- Scope boundaries: 只處理 originalContent 內的字幕，不抓取外部字幕。

### Proofread write-back behavior

- Behavior: refreshed MissHoney video routes 顯示 proofread 後的英文全文、繁中翻譯、中英對照、單字、片語、特殊用法與文法解析。
- Interface / data shape: proofread JSON 必須含 correctedText、translation、segments、words、phrases、usages、grammar；寫回既有影片資料結構時保留 title、slug、level、youtubeUrl 等 metadata。
- Failure modes: parser 或 validator 失敗時不得靜默覆蓋 app video data，必須報告 level、slug、欄位與原因。
- Acceptance criteria: content validator、route smoke、以及每個 level 抽查第一支與最後一支影片都通過。
- Scope boundaries: 不建立 route 未使用的資料來源。

### Marker navigation behavior

- Behavior: 英文全文中的 A/B/C marker 點擊後 smooth scroll 到單一講解項目、目標置中、短暫高亮；講解項目可回到最後點擊的原文 marker instance。
- Interface / data shape: tokens 使用穩定 targetId 與 instanceId；word 連到單字、phrase 連到片語、usage 連到特殊用法。
- Failure modes: 找不到 targetId 時不得造成 runtime error，該 marker 保持可讀文字並在驗證報告列出資料問題。
- Acceptance criteria: PlaylistVideoView/Playwright smoke 驗證 word、phrase、usage 三類跳轉與回原文。
- Scope boundaries: grammar 不走 inline marker。

### Grammar synchronization behavior

- Behavior: /grammar 收錄 grammar_deal.md 的結果，既有主題補充內容，新主題依由簡到難位置新增。
- Interface / data shape: grammar_deal.md 必須含 Markdown 正文與 JSON；JSON grammarPoints 依 sortOrder 遞增，且 sortOrder 連續。
- Failure modes: 無法匹配的文法點不得消失，必須列入略過或待修清單並寫明原因。
- Acceptance criteria: grammar tests 驗證排序、既有主題補充、新主題新增與不重複。
- Scope boundaries: 不重構整個 grammar schema，除非既有 schema 無法承載必要資料且 tasks 明確記錄。

### Final verification behavior

- Behavior: 全量處理與 /grammar 同步完成後產生總驗證報告。
- Interface / data shape: 報告列出原始字幕總數、step1 output 總數、JSON 成功數、JSON 失敗清單、已寫回 route 數、grammar 新增數、grammar 補充數、UI 抽查頁、lint/test/build 結果與剩餘風險。
- Failure modes: 若 npm script 不存在，報告記為專案未提供該檢查；不得臨時 invent script。
- Acceptance criteria: npm run lint、npm run test、npm run build 中存在的 scripts 已執行並記錄結果。
- Scope boundaries: 總驗證不要求外部網路服務。

## Risks / Trade-offs

- [Risk] 全量副代理處理時間長且成本高 → Mitigation：每支影片獨立 output 與待修清單，允許從已完成 level/slug 恢復。
- [Risk] JSON 字幕 schema 不一致 → Mitigation：先檢查 schema，不明欄位列入待修，不猜測後批次覆寫。
- [Risk] proofread output 過長或被截斷 → Mitigation：強制檔案 I/O，並用 JSON 欄位與禁止省略文字檢查。
- [Risk] grammar 重複或排序混亂 → Mitigation：先累積 grammar.md，最後用 grammar_organizer 統一合併與排序。
- [Risk] 大量內容更新破壞既有 route → Mitigation：每個 level 抽查第一支與最後一支，並跑既有 lint/test/build。

## Migration Plan

1. 保留既有影片資料與 metadata 作為 fallback。
2. 逐 level 產生 step1 output 與 normalized app data，validator 通過後才覆蓋 app route 使用資料。
3. 同步 grammar 後跑總驗證。
4. 若某批次失敗，回復該 level/slug 的 app data，保留 step1 output 與待修清單供重跑。

## Open Questions

- 各 JSON 原始字幕檔的 transcript 欄位名稱需在 apply 時由實際檔案 schema 確認。
- 最終總驗證報告的存放路徑由 apply 依現有 scripts 或 _private/tmp 結構決定。
