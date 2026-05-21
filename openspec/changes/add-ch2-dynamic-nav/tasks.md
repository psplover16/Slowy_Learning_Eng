## 1. ChapterView 動態區塊（修改 src/modules/chapters/ChapterView.vue）

- [x] [P] 1.1 將 `quickNavSections` computed 改為依資料陣列長度動態篩選：`scenes.length` 控制 全文、`vocabGroups.length` 控制 單字、`phrases.length` 控制 片語、`breakdowns.length` 控制 句型——符合「Navigation buttons reflect only sections with data」規格。驗證：以 `scenes:[]` 的章節存取頁面，快速導覽列不出現「全文」按鈕，仍出現「單字」「片語」「句型」三顆。

- [x] 1.2 在 `ChapterView.vue` 的四個 `<section>` 區塊各加上對應的 `v-if`（`scenes.length`、`vocabGroups.length`、`phrases.length`、`breakdowns.length`）——符合「Section blocks render only when their data is non-empty」規格。驗證：Ch2 頁面 DOM 中不存在 `id="ch2-section-bilingual"` 的元素。

- [x] 1.3 在 `quickNavSections` computed 中，以自動遞增計數器為每個可見區塊附加 `num` 欄位（從 1 開始），並更新 template 用 `section.num` 取代硬寫的 1/2/3/4——符合「Section numbers auto-increment from 1 based on visible sections」規格。驗證：Ch2（無全文）頁面上，單字區塊顯示序號 1、片語顯示 2、句型顯示 3。

- [x] 1.4 將 `ChapterView.vue` header 區域的兩個 badge `<span>` 加上 `v-if` 條件（`chapterData.headerLevelTag` 及 `chapterData.headerTopicTag` 為非空字串時才渲染）——符合「Header tag badges are conditionally rendered」規格。驗證：Ch2 頁面 header 區域不出現任何 badge 空元素，Ch1 頁面 badge 正常顯示不受影響。

## 2. Ch2 資料與路由

- [x] [P] 2.1 依照 `_private/ch2-data-draft.ts` 的內容，建立 `src/modules/chapters/data/ch2.ts`：修正 import 路徑為 `'../types'`，移除草稿用的行內備註，確認 `scenes: []`、`headerLevelTag: ''`、`headerTopicTag: ''`、四組 vocabGroups、五張 phrase cards、五條 breakdowns 均完整——符合「Ch2 has no full-text article」「Ch2 header level and topic tags are empty」「Ch2 vocabulary section is present」「Ch2 phrases section is present」「Ch2 sentence breakdowns section is present」規格。驗證：`tsc --noEmit` 通過，無型別錯誤。

- [x] 2.2 在 `src/shared/config/chapters.ts` 新增 Ch2 條目：`id: 'ch2'`、`path: '/ch2'`、`shortLabel: 'Ch2'`、`titleZh: '語言究竟是怎麼學會的'`、`titleEn: 'How Languages Are Really Learned'`、`dataLoader` 指向 `ch2.ts`——符合「Ch2 chapter page is accessible at /ch2」「Ch2 route appears in chapter registry」規格。驗證：瀏覽器前往 `/ch2` 正確渲染章節頁、標題文字與設定值一致。

## 3. 測試補強

- [x] 3.1 在 Vitest 單元測試中新增 `ChapterView` 動態區塊測試：(a) 傳入 `scenes:[]` 時快速導覽不含「全文」按鈕、bilingual section 不在 DOM、單字序號為 1；(b) 傳入 `headerLevelTag:''` 時無 badge 元素——覆蓋「Navigation buttons reflect only sections with data」「Section blocks render only when their data is non-empty」「Section numbers auto-increment」「Header tag badges are conditionally rendered」四條規格。驗證：`vitest run` 中所有新增測試通過，無既有測試回歸。

- [x] 3.2 新增 Playwright E2E smoke test：前往 `/ch2`，斷言頁面標題含「語言究竟是怎麼學會的」，斷言導覽列存在且不含「全文」按鈕，斷言單字、片語、句型三個區塊各自可見——符合「Ch2 chapter page is accessible at /ch2」「Ch2 has no full-text article」規格。驗證：`playwright test` 新增測試通過。
