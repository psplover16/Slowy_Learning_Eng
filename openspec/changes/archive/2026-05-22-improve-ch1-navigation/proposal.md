## Why

目前 `/ch1` 內容頁長度很大（15 個場景、6 個主題單字群組、13 張片語卡、30+ 條句型解析），分為四大段：中英對照全文、重點單字、重點片語與慣用語、句型解析。使用者反映兩個導覽痛點：

1. **跨路由切換不便**：在 `/ch1` 想去 `/grammar` 查語法，看完想回 `/ch1` 沒辦法——NavBar 只有「首頁」「文法」兩個按鈕，必須先回首頁再從列表點 ch1，多一步且打斷學習動線。
2. **頁內導覽缺失**：閱讀過程想直接跳到「重點片語與慣用語」或「句型解析」，目前只能手動滾動找標題；滾到很下方時，想回頂部也得手動往上滑。

## What Changes

- NavBar 加第三顆按鈕「Ch1」，連到 `/ch1`，與既有「首頁」「文法」並列。
- `/ch1` 頁面 header 下方新增「快捷導覽列」（`SectionQuickNav`），含 4 顆按鈕，點下 smooth scroll 到對應段落：
  - 全文 → `#ch1-section-bilingual`
  - 單字 → `#ch1-section-vocabulary`
  - 片語 → `#ch1-section-phrases`
  - 句型 → `#ch1-section-breakdown`
- 快捷導覽列**不 sticky**，會跟著頁面滾動消失。
- 當快捷導覽列滾出 viewport 後，右下角顯示「回頂 fab」（`BackToTopFab`），點下 smooth scroll 回頂；用 IntersectionObserver 偵測快捷導覽列可見性決定 fab 顯隱。
- 既有 `BackToWordFab`（底線單字觸發、現役）與新的 `BackToTopFab` 兩個 fab 同時出現時，垂直堆疊：回單字在下、回頂在上，互不遮擋。
- 抽出兩個共用元件 `SectionQuickNav.vue` 與 `BackToTopFab.vue` 放 `src/shared/components/`，讓未來 Ch2/Ch3 內容頁能重用。
- `/ch1` 四個 `<section>` 加上對應 id，作為 scrollIntoView 目標。

## Non-Goals

- 不為 `/grammar` 加類似快捷導覽（grammar 頁是單一連續清單，G01–G18 已有 badge 編號）。
- 不為 NavBar 加動態內容頁清單（YAGNI——目前只有 ch1；未來真出 Ch2 時再 refactor 為下拉選單）。
- 不調整 NavBar 視覺風格／高度／背景色。
- 不引入 scroll spy（按鈕 highlight 當前正在閱讀的 section）——是 nice-to-have，留給未來變更。
- 不引入 URL hash 同步（`location.hash` 隨 section 變動）——只用 JS scrollIntoView，URL 不變。
- 不調整既有 `BackToWordFab.vue` 的視覺、行為或位置（只透過 prop 讓它與新 fab 共存）。
- 不新增「上一篇／下一篇」內容頁切換按鈕——目前只有單篇內容。
- 不為 sticky 模式留後門（discuss.txt 明示快捷按鈕需「滾到看不見」才出 fab，sticky 會與此語意衝突）。

## Capabilities

### New Capabilities

- `ch1-quick-nav`: 涵蓋 `/ch1` 頁的快捷導覽機制——NavBar 進入點、頁內 4 段 smooth scroll、捲動時的回頂 fab、與既有 fab 的並存規則。

### Modified Capabilities

(none)

## Impact

- Affected specs: `ch1-quick-nav`
- Affected code:
  - New:
    - src/shared/components/SectionQuickNav.vue
    - src/shared/components/BackToTopFab.vue
    - src/__tests__/SectionQuickNav.test.ts
    - src/__tests__/BackToTopFab.test.ts
  - Modified:
    - src/shared/components/NavBar.vue
    - src/modules/ch1/views/Ch1View.vue
    - src/__tests__/NavBar.test.ts
    - src/__tests__/Ch1View.test.ts
