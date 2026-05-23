## Why

Ch3（/ch3）目前的主題為「傳統學習法為何無法帶來流暢」，但依課程規劃，下一個學習單元應為「用自然的未來式談你的計畫」，需要將現有 ch3 搬移為 ch4，並以新內容取代 ch3。同時，文法頁面尚未收錄未來式相關語法，應一併補齊。

## What Changes

- `src/modules/chapters/data/ch3.ts` 內容替換為「用自然的未來式談你的計畫」（來源：YouTube 影片 FDToep-SPWE，共 5 個 Scene）
- 原 `src/modules/chapters/data/ch3.ts` 內容複製為 `src/modules/chapters/data/ch4.ts`（傳統學習法）
- `src/shared/config/chapters.ts` 更新：ch3 條目改為新主題，新增 ch4 條目，順序為 ch1 → ch2 → ch3 → ch4
- `src/modules/grammar/views/GrammarView.vue` 在 Section 3（動詞時態）新增 G19 語法卡「三種自然未來式：going to / 現在進行式 / will」

## Non-Goals

- 不修改 ch1、ch2 的任何內容
- 不為 ch4 新增獨立規格頁面以外的功能（ch4 只是搬移，不做額外設計）
- 不在此次變更中處理 ch3 的音訊（mp3Src 維持 null）
- 不修改路由結構或 URL 設計

## Capabilities

### New Capabilities

- `ch4-content`: /ch4 路由，承載從 ch3 搬移過來的「傳統學習法為何無法帶來流暢」內容，維持原有 scenes、tags 與 vocabGroups 不變

### Modified Capabilities

- `ch3-content`: /ch3 路由內容更換為「用自然的未來式談你的計畫」，包含 5 個 Scene、scenes 層級 tags、vocabGroups，以及 hl() 高亮標記
- `grammar-page`: Section 3 新增 G19 語法卡，包含三種未來式比較表與補充說明

## Impact

- Affected specs: ch4-content（新建）、ch3-content（修改）、grammar-page（修改）
- Affected code:
  - New: `src/modules/chapters/data/ch4.ts`
  - Modified: `src/modules/chapters/data/ch3.ts`、`src/shared/config/chapters.ts`、`src/modules/grammar/views/GrammarView.vue`
  - Removed: （無）
