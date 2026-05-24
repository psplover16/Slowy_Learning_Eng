## 1. 搬移舊 Ch3 為 Ch4

- [x] 1.1 建立 `src/modules/chapters/data/ch4.ts`，完整複製現有 `src/modules/chapters/data/ch3.ts` 的全部內容（滿足「Ch4 chapter page is accessible at /ch4」requirement）。驗收：ch4.ts 匯出的 chapter 物件與舊 ch3.ts 逐字相同，TypeScript 型別無錯誤。

## 2. 建立新 Ch3 內容

- [x] [P] 2.1 以新章節資料替換 `src/modules/chapters/data/ch3.ts`（滿足「Ch3 has a full-text bilingual article with 10 scenes」requirement）：header（titleZh="用自然的未來式談你的計畫"，titleEn="Talking About Your Future Plans Naturally"，podcastLabel="Slow English Podcast · B1"，levelTag="程度 B1 初中級"，topicTag="主題：未來計畫・希望與目標"，mp3Src=null，sourceSrc="https://www.youtube.com/watch?v=FDToep-SPWE"，滿足「Ch3 displays source attribution」requirement）+ 5 Scenes（id: scene-01 至 scene-05，主題依序：Going To / Present Continuous for Future / Hopes and Goals / Real Life / Confidence）+ vocabGroups 2 群組 6 詞（滿足「Ch3 has vocabulary groups and a phrase card」requirement）+ phrases=[]（滿足「Ch3 quick-nav shows 3 buttons」requirement，phrases 為空時 quick-nav 只顯示 2 個按鈕：全文、單字）+ breakdowns=[]，所有 Scene sentences 的 en 欄位依 propose.md 第七節 hl() 規格加入 hl() 高亮標記。驗收：TypeScript 型別檢查通過，/ch3 顯示正確 header 標題與 5 個 scene，quick-nav 顯示 2 個按鈕，header 含 sourceSrc 連結。

## 3. 更新路由登錄

- [x] 3.1 更新 `src/shared/config/chapters.ts`（滿足「Ch4 appears in chapter navigation after Ch3」requirement）：（1）修改 ch3 條目（id='ch3'，path='/ch3'，shortLabel='Ch3'，titleZh='用自然的未來式談你的計畫'，titleEn='Talking About Your Future Plans Naturally'，dataLoader 指向 ch3）；（2）新增 ch4 條目（id='ch4'，path='/ch4'，shortLabel='Ch4'，titleZh='傳統學習法為何無法帶來流暢'，titleEn="Why Traditional Study Can't Create Fluency"，dataLoader 指向 ch4）；（3）陣列順序為 ch1 → ch2 → ch3 → ch4。驗收：首頁章節列表顯示 4 個章節，順序與 id 正確。

## 4. 新增文法卡 G19

- [x] [P] 4.1 在 `src/modules/grammar/views/GrammarView.vue` 的 script setup 區塊新增 futureFormsTable 常數陣列（3 筆：be going to / 現在進行式 / will，每筆含 form、formula、usage、examples）（為「G19 grammar card for three natural future forms is present in Section 3」requirement 的資料層）。驗收：futureFormsTable 可在 template 中以 v-for 引用，無 TypeScript 錯誤。
- [x] 4.2 在 `src/modules/grammar/views/GrammarView.vue` template 的 G07 GrammarCard 結束標記之後插入 G19 GrammarCard（滿足「G19 grammar card for three natural future forms is present in Section 3」requirement）：badge="G19"，title="三種自然未來式：going to / 現在進行式 / will"，卡片含介紹段落、以 v-for 渲染的比較表（引用 futureFormsTable）、四點補充說明。驗收：/grammar G19 卡片可見，比較表 3 列正確，G01–G18 卡片無變化。

## 5. 建置與手動驗收

- [x] 5.1 執行 `npm run build`，確認無 TypeScript 型別錯誤，無超過 500 KB 的 chunk 警告。
- [x] 5.2 手動確認（滿足「Ch3 chapter page is accessible at /ch3」requirement）：/ch3 header 顯示"用自然的未來式談你的計畫"；/ch4 header 顯示"傳統學習法為何無法帶來流暢"；首頁章節列表共 4 個章節，順序 Ch1 → Ch2 → Ch3 → Ch4。
- [x] 5.3 手動確認 /grammar：Section 3 G19 卡片可見，badge G19，比較表 3 列，G01–G18 無異常（滿足「G19 grammar card for three natural future forms is present in Section 3」requirement）。
