## Context

MissHoney 目前已有 `/a1`、`/a2`、`/b1`、`/b2` 與 ready video JSON，但內容來自先前自動生成與批次整理，學習品質與互動密度不足。使用者要先以 A1 ch1 打通一條完整、可重複的校稿管線，再把同一流程延伸到其他影片。

此變更跨越 build-time tooling、playlist JSON schema、影片頁 UI、Playwright smoke、content validator 與 grammar route。runtime 必須保持離線可用：影片頁只讀 bundled JSON，不在瀏覽器端抓 YouTube、不呼叫外部翻譯或 AI API、不新增 Pinia store 或 IndexedDB migration。

## Goals / Non-Goals

**Goals:**

- 以 A1 ch1 完整驗證「字幕提取 → `english_proofreader` → proofread JSON → app JSON → 影片頁互動 → 測試」流程。
- 建立單支影片字幕提取命令，讓後續 task 可精準指定一支影片重跑。
- 讓 `proofread_result.md` 有固定 JSON 契約，主代理可解析並寫回 `PlaylistVideoData`。
- 讓英文全文 marker 精準跳到單字、片語、特殊用法項目，目標置中且短暫高亮，並可回到原本 marker instance。
- 讓特殊用法成為影片頁獨立區塊。
- 對 grammar route 採保守補充：明確能對上既有文法才補充。
- 完整規劃 A1/A2/B1/B2 後續批次，但第一輪 apply 只執行基礎能力與 A1 ch1。

**Non-Goals:**

- 不一次重做全部 MissHoney 影片。
- 不在 runtime 連線 YouTube、翻譯服務或 AI API。
- 不改寫 `/ch1` 到 `/ch4` 內容與既有 quick nav 行為。
- 不讓中文翻譯 marker 可點擊。
- 不做 hover tooltip。
- 不大改 grammar schema；分類不確定的文法留在影片頁內。

## Decisions

### D1: Add a single-video transcript command for controlled reruns

建立單支影片字幕提取命令，例如 `npm run misshoney:fetch-transcript -- --level a1 --slug ch1-slow-english-for-beginners-a1-listening-practice --out _private/tmp.txt`。命令根據 level 與 slug 找到影片 metadata 與 YouTube URL，只取得公開英文字幕或自動英文字幕，並覆寫輸出檔。

替代方案：沿用既有批次 import script。淘汰原因是批次流程不適合 vertical slice，也不方便在 tasks 中指定單支影片暫停或重跑。

### D2: Treat proofread_result JSON as the machine contract

`english_proofreader` 仍輸出人類可讀 Markdown，但必須額外輸出 JSON code block。parser 以 JSON 為主來源，Markdown 僅供人工檢查。parser 可做 normalization，例如補齊空陣列、修正常見欄位型別、合併 lemma，但不可改變字幕主要內容。

替代方案：解析 Markdown table。淘汰原因是 Markdown table 對換行、直線符號與長句不穩，會讓後續寫回 JSON 變成猜測。

### D3: Extend PlaylistVideoData with structured inline tokens and usages

ready video JSON 必須能表示英文全文 token：plain text、word marker、phrase marker、usage marker。每個 marker token 帶 `targetId` 與 `instanceId`，講解項目帶穩定 anchor id。特殊用法使用獨立 `usages` 或等價欄位，不併入 vocabulary 或 phrase。

同一 lemma 的變化形合併成一筆講解；全文 marker 保留原文 surface form。JSON 內不放 HTML 字串，Vue 元件負責 render token 與 button/anchor。

替代方案：直接把副代理標記後的 Markdown 或 HTML 存入 JSON。淘汰原因是無法可靠做精準跳轉、回原文 instance 與 accessibility 控制。

### D4: Implement precise marker navigation in PlaylistVideoView only

英文全文 marker 點擊後，使用 smooth scroll 將對應講解項目置中，並對目標卡片套用短暫高亮。講解項目上的回原文操作回到最後觸發的 marker instance。文法與句型解析只透過 quick nav 或區塊按鈕跳轉，不由全文 marker 觸發。

替代方案：復用 `/ch1` 內部資料結構。淘汰原因是 `/ch1` 與 MissHoney 的資料 schema 不同，硬套會混淆章節內容與播放清單內容的責任邊界。

### D5: Conservatively supplement grammar route

A1 ch1 的文法結果若能明確對上既有 grammar topic，才補充例句或補充說明；若無法明確分類，保留在該影片頁的文法解析區，不新增全站 grammar card，不調整 grammar group order。

替代方案：積極把副代理產生的每個文法點都加入 `/grammar`。淘汰原因是會快速擴大 scope，且可能造成 grammar taxonomy 重複或分類錯誤。

### D6: Keep runtime storage unchanged and offline-first

本變更不新增 Pinia store、localStorage key 或 IndexedDB migration。字幕提取與副代理處理只在 apply/build-time tooling 執行；runtime 只 lazy load bundled JSON。若 A1 ch1 proofread 尚未完成或 JSON 驗證失敗，該影片不得被 promote 為通過的新格式。

替代方案：在 runtime 依需要抓 YouTube 字幕或呼叫 AI。淘汰原因是違反離線 PWA 原則，且會引入外部 API 失敗模式與使用者隱私風險。

## Implementation Contract

- `english_proofreader` 契約：`proofread_result.md` 必須包含 JSON code block，至少有 `correctedText`、`translation`、`segments`、`words`、`phrases`、`usages`、`grammar`。每個清單缺資料時輸出空陣列，不省略欄位。
- 單支字幕命令契約：給定 `--level a1` 與 A1 ch1 slug，命令覆寫 `_private/tmp.txt`，內容為英文字幕純文字；找不到影片、無英文字幕或網路錯誤時以非零 exit code 結束並輸出可讀錯誤。
- parser 契約：讀取 `_private/proofread_result.md` 的 JSON code block，輸出可寫回 `PlaylistVideoData` 的 normalized draft；JSON 缺必填欄位、不是合法 JSON、或含 HTML 字串時驗證失敗。
- 影片 schema 契約：A1 ch1 ready JSON 包含英文/中文 segments、inline tokens、word/phrase/usage/grammar entries、anchor id 與 source YouTube URL。每個 marker token 的 `targetId` 必須能找到對應講解項目。
- UI 契約：只在英文全文 token 上提供可點擊 marker。點擊 word/phrase/usage marker 會 smooth scroll 到單一講解卡片並置中，高亮該卡片；卡片回原文會回到剛才點擊的 token instance。
- 文法契約：quick nav 可跳到影片頁文法區；全文 inline marker 不觸發 grammar jump。grammar route 只接收明確可歸類的補充例句或說明。
- 驗證契約：新增或更新 Vitest 覆蓋 parser、schema validator、navigation state；Playwright smoke 覆蓋 A1 ch1 marker 跳轉、高亮、回原文、特殊用法區塊。執行 `npm run test`、`npm run misshoney:validate-content -- --level a1`、`npm run build` 與相關 e2e smoke。
- Scope boundary：第一輪 apply 到 A1 ch1 完整通過為止；A1 ch2 以後、A2、B1、B2 只在 tasks 中規劃，不在第一輪勾選完成。

## Risks / Trade-offs

- [Risk] 副代理 JSON 仍可能有格式小錯 → parser 執行嚴格 validation 與有限 normalization，失敗時不 promote。
- [Risk] YouTube 字幕提取受網路或公開字幕狀態影響 → 單支命令提供清楚錯誤，A1 ch1 未取得字幕時停止 apply，不使用假資料替代。
- [Risk] inline token schema 使 JSON 較複雜 → 只為英文 marker 建 token，中文翻譯維持純文字，降低資料量。
- [Risk] grammar 補充分類錯誤 → 第一輪只做明確匹配，分類不確定者留在影片頁。
- [Risk] 任務量大 → tasks 完整列後續批次，但以 Paused / later phase 或明確未執行範圍保護第一輪。

## Migration Plan

1. 更新副代理設定與 tooling 契約。
2. 實作 parser/schema/UI 前先加失敗測試。
3. 跑 A1 ch1 單支字幕與 proofread 流程。
4. 將 A1 ch1 寫回新 schema 並通過 validator。
5. 保守補充 grammar route。
6. 跑 unit、content validator、build、Playwright smoke。
7. 若失敗，回滾 A1 ch1 JSON 與 grammar 補充，保留 tooling 測試讓下一輪修正。

## Open Questions

無。第一輪以 A1 ch1 vertical slice、單支字幕命令、保守 grammar 補充為固定邊界。
