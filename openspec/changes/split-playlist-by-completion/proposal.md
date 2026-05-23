## Why

使用者在 A1/A2/B1/B2 播放清單頁已經可以勾選完成狀態，但目前已完成與未完成影片混在同一個排序中。現在要做這個變更，是為了讓使用者進入等級列表時，第一眼就看到接下來最該練習的未完成影片，同時仍保留已完成影片供回顧。

## What Changes

- A1/A2/B1/B2 播放清單頁會依本機完成狀態分成兩個連續區塊呈現。
- 未完成影片顯示在上方；已完成影片顯示在下方。
- 兩個區塊內部仍維持各自原本的 displayOrder 排序。
- 卡片視覺、checkbox 操作、路由連結與完成狀態儲存方式維持不變。
- 此變更不新增同步策略；完成狀態仍沿用目前 localStorage 的本機資料，無跨裝置同步與衝突處理。

## Non-Goals

- 不新增 /a3 或 /a4 路由；本次範圍是既有 /a1、/a2、/b1、/b2。
- 不修改完成紀錄資料結構，不加入完成時間、練習次數或進度統計。
- 不新增區塊標題、徽章、篩選器或新的卡片樣式；使用者透過既有 checkbox 辨識完成狀態。
- 不隱藏已完成影片；已完成影片只移到列表下方。

## Capabilities

### New Capabilities

- `misshoney-playlist-completion-grouping`: MissHoney 等級播放清單依完成狀態將未完成影片優先呈現，已完成影片下移供回顧。

### Modified Capabilities

(none)

## Impact

- Affected specs: misshoney-playlist-completion-grouping
- Affected code:
  - Modified: src/modules/playlists/PlaylistView.vue
  - Modified: src/__tests__/PlaylistView.test.ts
  - New: none
  - Removed: none
- APIs/dependencies: no route, storage schema, or dependency changes.
