## Context

本專案為英語學習 PWA，章節內容以 TypeScript 資料檔定義（`ChapterData` 型別），透過 `chapters.ts` 集中登錄路由，並由 `ChapterView.vue` 動態渲染。語法頁面（`GrammarView.vue`）為獨立靜態元件，語法卡以 `GrammarCard` 元件組成。

目前 /ch3 指向「傳統學習法為何無法帶來流暢」，依課程順序需搬移為 ch4，並在 ch3 建立以影片 FDToep-SPWE 為內容的新章節。語法頁 Section 3 目前只有過去式與現在完成式，未收錄未來式。

## Goals / Non-Goals

**Goals:**
- 新增 `ch4.ts`（內容與現有 `ch3.ts` 相同，即傳統學習法）
- 以「用自然的未來式談你的計畫」替換 `ch3.ts` 內容（5 Scene，含 tags、vocabGroups、hl() 高亮）
- 更新 `chapters.ts` 登錄 ch3（新內容）與 ch4（搬移）
- 在 `GrammarView.vue` Section 3 末尾插入 G19 語法卡（三種未來式比較）

**Non-Goals:**
- 不修改 ch1、ch2 內容
- 不調整路由結構或 URL 設計
- 不為 ch3 新增音訊（mp3Src 維持 null）
- 不修改 `ChapterView.vue` 渲染邏輯

## Decisions

**D1：ch4 以複製方式建立，不重命名原始檔**
原因：確保 ch3.ts 的新內容完全獨立，不受舊內容干擾。手動複製亦讓 git 歷史清楚顯示 ch4 的內容來源。

**D2：章節順序維持線性（ch1→ch2→ch3→ch4）**
原因：使用者以線性方式進行課程，新 ch3 是更適合先學的入門主題（未來式），舊 ch3（傳統學習法）放在後面邏輯上也成立。

**D3：G19 插入 G07 之後、不重新編號現有 G 序號**
原因：編號為展示用 badge，改動現有卡片會導致書籤、截圖或使用者記憶失效。G19 填入未使用的序號。

**D4：hl() 高亮僅標注有對應 tag 的詞彙**
原因：避免過度標注造成閱讀干擾，hl() 與 tags[] 一對一對應。

## Implementation Contract

**行為（使用者觀察到的）：**
- /ch3 顯示新章節「用自然的未來式談你的計畫」，包含 5 個 Scene
- /ch4 顯示原 ch3 內容「傳統學習法為何無法帶來流暢」，行為與現有 /ch3 相同
- 首頁章節列表依序顯示 Ch1、Ch2、Ch3（新）、Ch4
- /grammar Section 3 末尾出現 G19 語法卡，badge 顯示 G19，標題為「三種自然未來式：going to / 現在進行式 / will」

**資料形狀（ChapterData 介面）：**
- 新 `ch3.ts` 匯出符合 `ChapterData` 型別的物件：5 個 Scene，每個 Scene 包含 sentences[]（`{en, tc}`）與 tags[]（`{english, pos, meaning}`），vocabGroups 含 2 個群組共 6 個補充詞彙，phrases 與 breakdowns 為空陣列
- `ch4.ts` 匯出與現有 `ch3.ts` 完全相同的內容
- `chapters.ts` 的 chapters 陣列順序：ch1、ch2、ch3（新）、ch4

**G19 語法卡介面：**
- `GrammarCard` 元件，badge="G19"，title="三種自然未來式：going to / 現在進行式 / will"
- script 中新增 `futureFormsTable`（陣列，3 筆：be going to、現在進行式、will）
- 每筆包含 `form`、`formula`、`usage`、`examples`（含 en、tc）

**失敗模式：**
- 若 `chapters.ts` 未正確登錄 ch4，/ch4 路由將 404 → 驗收時手動確認 /ch4 可正常進入
- 若 `ch3.ts` 型別不符 `ChapterData`，TypeScript build 將報錯 → `npm run build` 不得有 type error

**驗收條件：**
1. `npm run build` 無型別錯誤、無 chunk 超過 500 KB 警告
2. 開發伺服器下手動確認 /ch3 顯示新章節 header「用自然的未來式談你的計畫」
3. 手動確認 /ch4 顯示「傳統學習法為何無法帶來流暢」
4. 首頁章節列表顯示 4 個章節，順序正確
5. /grammar G19 語法卡可見，比較表顯示 3 列

## Risks / Trade-offs

- **風險**：`GrammarView.vue` 為靜態大型 Vue 元件（>50 KB），手動插入 G19 需謹慎定位插入點，避免破壞現有 Vue template 結構
- **緩解**：插入前確認 `<!-- G07 -->` 結束標記位置，在其後完整插入，不修改任何現有 GrammarCard
