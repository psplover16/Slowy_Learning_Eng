## 1. 測試保護

- [x] 1.1 為 `Playlist videos are grouped by completion state` 補上 `src/__tests__/PlaylistView.test.ts` 測試：先建立同一播放清單中未完成與已完成影片混合的狀態，驗證渲染順序為所有未完成影片在前、所有已完成影片在後，且兩組內仍依 `displayOrder` 排序；以 `npm run test -- PlaylistView` 驗證此測試在實作前會失敗。
- [x] 1.2 為 `Playlist videos are grouped by completion state` 補上切換互動測試：使用既有 completion checkbox 將未完成影片切成已完成時，該影片移到未完成影片之後；再切回未完成時，該影片回到未完成群組並依 `displayOrder` 排序；以 `npm run test -- PlaylistView` 驗證測試覆蓋完成與未完成兩個方向。

## 2. 列表分組實作

- [x] 2.1 在 `src/modules/playlists/PlaylistView.vue` 實作播放清單分組行為：載入後先依既有 `displayOrder` 得到穩定基準排序，再渲染未完成影片群組，最後渲染已完成影片群組；完成狀態來源沿用 `useMissHoneyCompletion()`，不修改 localStorage key 或資料 shape；以 `npm run test -- PlaylistView` 驗證 `Playlist videos are grouped by completion state` 通過。
- [x] 2.2 保持 `ArticleListItem` 卡片 UI、checkbox、標題、副標題與路由連結行為不變，只在未完成群組與已完成群組之間加入非侵入式 spacing；不得新增區塊標題、篩選器或新的卡片視覺；以 `npm run test -- PlaylistView` 與瀏覽器手動檢查 `/a1`、`/a2`、`/b1`、`/b2` 驗證。

## 3. 驗證與交付

- [x] 3.1 執行 `npm run test -- PlaylistView`，驗證 playlist 列表排序、切換完成狀態、卡片互動與中文/英文標題顯示仍符合既有測試。
- [x] 3.2 執行 `npm run build`，驗證 TypeScript、Vue build 與 Vite bundle 能完成，且沒有新增依賴。
- [x] 3.3 啟動本機頁面並在瀏覽器 DevTools Offline 模式下檢查 `/a1`、`/a2`、`/b1`、`/b2`：未完成影片位於上方、已完成影片位於下方、checkbox 可切換並立即改變所在群組，頁面不出現 console error。
