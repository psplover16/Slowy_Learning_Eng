## 1. 測試與契約護欄

- [ ] [P] 1.1 為 `Full local subtitle rollout pipeline`、`Local subtitle extraction before proofread`、`One proofreader lifecycle per subtitle`、`Use local originalContent as the source of truth`、`Use one proofreader subagent per subtitle` 新增失敗測試或 fixture 驗證：source inventory 依 A1→A2→B1→B2 排序、Markdown 直接取全文、JSON 只抽 transcript/text、同一 proofreader 不可處理多檔；以 `npm run test -- misshoney` 或新增的對應 test 指令先失敗再通過。
- [ ] [P] 1.2 為 `Proofread output validation and final report`、`Treat proofread JSON as the write-back contract`、`Batch proofread behavior`、`Proofread write-back behavior` 新增失敗測試，驗證 step1 Markdown 必須含可解析 JSON、必要欄位、非空核心內容、禁止省略字樣，且壞檔只進待修清單不覆寫 app data；以 `npm run test -- proofread` 或對應 parser test 指令先失敗再通過。
- [ ] [P] 1.3 為 `Refreshed playlist video pages support A/B/C marker navigation`、`Learning entries return to the clicked marker instance`、`Grammar navigation remains section-based`、`Refreshed pages preserve existing route behavior`、`Keep marker navigation limited to A/B/C`、`Marker navigation behavior` 新增 PlaylistVideoView/Vitest 或 Playwright 失敗測試，驗證 word/phrase/usage marker 跳轉、高亮、回最後點擊 instance、grammar 不產生 inline marker、/ch1 到 /ch4 可載入；以目標 UI test 指令先失敗再通過。
- [ ] [P] 1.4 為 `MissHoney grammar content is organized before route sync`、`Grammar topics follow simple-to-difficult ordering`、`Existing grammar topics are supplemented without duplication`、`Grammar omissions are explicit`、`Grammar synchronization behavior` 新增 grammar 資料測試，驗證 grammar_deal JSON sortOrder 連續遞增、既有主題只補充不重複、新主題依排序插入、略過項目有原因；以 `npm run test -- GrammarView` 或對應 grammar data test 指令先失敗再通過。
- [ ] 1.5 為 `Make final verification a first-class artifact` 與 `Final verification behavior` 新增總驗證 fixture 或 snapshot 測試，驗證報告列出原始字幕總數、step1 總數、JSON 成功數、待修清單、已寫回 route 數、grammar 新增/補充數、UI 抽查頁、lint/test/build 結果與剩餘風險；以新增 final verification test 先失敗再通過。

## 2. Tooling 與資料契約實作

- [ ] 2.1 實作本地字幕 inventory 與 extraction contract，交付 `Use local originalContent as the source of truth`、`Full local subtitle rollout pipeline`、`Local subtitle extraction before proofread`：工具列出 _private/tmp/originalContent/a1、a2、b1、b2 的來源檔並固定排序，Markdown 輸出全文，JSON 僅輸出 transcript/text；以 1.1 測試與一次 dry run 驗證 source count、level order、未知 JSON schema 待修輸出。
- [ ] 2.2 實作 proofreader 執行紀錄與生命週期 guard，交付 `Use one proofreader subagent per subtitle` 與 `One proofreader lifecycle per subtitle`：每支影片的執行紀錄必須顯示開新 english_proofreader、處理單一 source、寫出單一 step1、關閉；以 1.1 測試及一個雙檔 fixture 驗證不可重用同一 proofreader。
- [ ] 2.3 實作 step1 proofread parser 與 validator，交付 `Treat proofread JSON as the write-back contract` 與 `Proofread output validation and final report`：parser 優先讀取 machine-readable JSON，驗證 required fields、非空 correctedText/translation/segments、禁止省略字樣，並輸出 normalized result 或 repair item；以 1.2 測試、合法 fixture、壞 JSON fixture 驗證。
- [ ] 2.4 實作 app video write-back normalizer，交付 `Refreshed video data is sourced from proofread JSON`、`Proofread sections map to first-class video content`、`Source traceability is retained for refreshed content` 與 `Proofread write-back behavior`：validated proofread JSON 轉成既有 ready video data，保留 title/slug/level/videoId/youtubeUrl，建立 vocabulary、phrases、special usages、grammar sections 與 source/proofread path traceability；以 1.2 測試和 content validator 驗證壞檔不覆寫。
- [ ] 2.5 實作 grammar 累積工具，交付 `Accumulate grammar first, organize once at the end`：每支影片寫回後把 grammar entries 追加或補充到 _private/tmp/grammar.md，已存在相近主題只補例句/變體/來源句，不做最終排序；以 grammar fixture 驗證同一主題不重複開標題且 Sources 保留 level/slug/source sentence。

## 3. App UI 與內容呈現

- [ ] 3.1 擴充或校準 ready video schema 與 validator，交付 `Proofread sections map to first-class video content`：所有 refreshed video data 能承載 bilingual segments、word entries、phrase entries、special usage entries、grammar entries、targetId、instanceId；以 1.2 測試和 `npm run misshoney:validate-content -- --level a1` 類型驗證通過。
- [ ] 3.2 實作 refreshed detail page marker 行為，交付 `Refreshed playlist video pages support A/B/C marker navigation`、`Learning entries return to the clicked marker instance`、`Grammar navigation remains section-based`、`Keep marker navigation limited to A/B/C` 與 `Marker navigation behavior`：word/phrase/usage marker smooth scroll 到對應卡片、置中、高亮，return 回最後點擊 marker instance，grammar 只走 quick nav；以 1.3 測試和 Playwright smoke 驗證。
- [ ] 3.3 驗證 refreshed UI 不破壞既有路由，交付 `Refreshed pages preserve existing route behavior`：/a1、/a2、/b1、/b2 level pages 仍列出影片，ready video 可進入詳細頁，/ch1 到 /ch4 無 runtime error；以 1.3 測試、Playwright smoke、離線模式手動檢查驗證。
- [ ] 3.4 更新 PROJECT_ARCHITECTURE.md，記錄本地字幕來源、proofreader 單檔生命週期、proofread JSON contract、marker A/B/C 邊界、grammar_deal 同步與總驗證契約；以文件 review 對照 proposal/design/specs 驗證沒有行為只留在對話中。

## 4. 全量 Proofread Rollout 執行

- [ ] 4.1 建立全量來源清單並初始化輸出目錄，交付 `Batch proofread behavior` 與 `Full local subtitle rollout pipeline`：統計 originalContent 四個 level 的來源檔、確認輸出路徑 _private/tmp/step1/<level>/<slug>.md、建立或清理本次 run manifest；以 dry run 報告驗證原始字幕總數與每個 expected output path。
- [ ] 4.2 執行 A1 全部字幕 proofread/write-back/grammar 累積，交付 `One proofreader lifecycle per subtitle`、`Proofread write-back behavior`、`Source traceability is retained for refreshed content`：A1 每個 source 都使用新的 english_proofreader，輸出 step1、解析 JSON、寫回 app data、累積 grammar.md，並在完成後立即進入 A2 任務；以 A1 source count = step1 count、A1 validator、A1 repair list 驗證。
- [ ] 4.3 執行 A2 全部字幕 proofread/write-back/grammar 累積，延續 `Batch proofread behavior` 並不得等待額外人工確認：A2 每個 source 都使用新的 english_proofreader，輸出 step1、解析 JSON、寫回 app data、累積 grammar.md；以 A2 source count = step1 count、A2 validator、A2 repair list 驗證。
- [ ] 4.4 執行 B1 全部字幕 proofread/write-back/grammar 累積，延續 `Batch proofread behavior`：B1 每個 source 都使用新的 english_proofreader，輸出 step1、解析 JSON、寫回 app data、累積 grammar.md；以 B1 source count = step1 count、B1 validator、B1 repair list 驗證。
- [ ] 4.5 執行 B2 全部字幕 proofread/write-back/grammar 累積，完成 `Full local subtitle rollout pipeline`：B2 每個 source 都使用新的 english_proofreader，輸出 step1、解析 JSON、寫回 app data、累積 grammar.md；以 B2 source count = step1 count、B2 validator、B2 repair list 驗證。

## 5. Grammar 整理與 /grammar 同步

- [ ] 5.1 呼叫 grammar_organizer 檔案 I/O 流程，交付 `MissHoney grammar content is organized before route sync`、`Grammar topics follow simple-to-difficult ordering`、`Accumulate grammar first, organize once at the end`：讀取 _private/tmp/grammar.md，覆寫 _private/tmp/grammar_deal.md，完成後關閉 grammar_organizer；以檔案存在、Markdown 正文、JSON grammarPoints、sortOrder 連續遞增驗證。
- [ ] 5.2 同步既有 /grammar 主題補充，交付 `Existing grammar topics are supplemented without duplication` 與 `Grammar synchronization behavior`：grammar_deal 中能匹配既有 topic 的內容只補充說明、限制、變體、例句或來源句，不新增重複 topic；以 1.4 測試和 grammar content review 驗證。
- [ ] 5.3 新增 /grammar 缺失主題，交付 `Grammar topics follow simple-to-difficult ordering`：grammar_deal 中不存在於 /grammar 的 topic 依 sortOrder/level 插入合適位置且維持既有 UI 風格；以 1.4 測試和 /grammar route smoke 驗證。
- [ ] 5.4 記錄未同步文法，交付 `Grammar omissions are explicit`：每個刻意不加入 /grammar 的 grammar point 都在 verification report 或 omission list 中列出 title、sourceCoverage、reason；以 1.4 測試和報告內容 review 驗證沒有 silent omission。

## 6. 總驗證與收尾

- [ ] 6.1 產出總驗證報告，交付 `Make final verification a first-class artifact` 與 `Final verification behavior`：報告列出原始字幕總數、step1 總數、JSON 成功數、JSON 失敗或待修影片、已寫回 app route 數、grammar 新增/補充數、UI 抽查頁、lint/test/build 結果、剩餘風險；以 1.5 測試和報告人工 review 驗證。
- [ ] 6.2 執行自動化檢查：跑專案存在的 `npm run lint`、`npm run test`、`npm run build`，不存在的 script 在總驗證報告記為專案未提供，不新增假 script；以 command exit code 與報告紀錄驗證。
- [ ] 6.3 執行 UI smoke 與離線檢查：每個 level 抽查第一支與最後一支影片，驗證詳細頁載入、全文/中英對照、A/B/C marker 跳轉、高亮、回原文、grammar section nav，並確認 /ch1 到 /ch4 未破壞；以 Playwright 或手動驗證紀錄寫入總驗證報告。
- [ ] 6.4 做 artifact 一致性自查：確認 proposal、design、specs、tasks 的範圍一致，所有 requirement 名稱與 design decision 都有任務覆蓋，且沒有 line-number-coupled 或 file-path-only task；以 `spectra analyze refresh-all-misshoney-proofread-content --json` Critical/Warning 為零驗證。
