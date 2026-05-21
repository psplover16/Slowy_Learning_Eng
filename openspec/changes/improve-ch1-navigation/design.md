## Context

`/ch1` 是 Slowy_Learning_Eng 目前唯一的內容頁，承載一篇完整英語學習文章——15 個場景的中英對照 + 6 個主題單字群組 + 13 張片語慣用語卡 + 30+ 條句型解析。頁面結構由 4 個 `<section>` 構成（中英對照全文、重點單字、重點片語與慣用語、句型解析），手機 viewport 內整頁高度估計超過 15 個螢幕高。

既有元件：
- `src/shared/components/NavBar.vue` 提供「首頁」「文法」兩個按鈕，缺 ch1 入口。
- `src/shared/components/BackToWordFab.vue` 在底線單字被點選時出現於右下角 `fixed bottom-6 right-6 z-40`，點下捲回原本單字位置。

本變更不改商業邏輯，只新增導覽 UX：NavBar Ch1 進入點、頁內 4 段快捷捲動、回頂 fab。

## Goals / Non-Goals

**Goals:**

- 讓使用者從任一路由能一鍵進 `/ch1`（NavBar 第 3 個按鈕）。
- 讓 `/ch1` 內可一鍵跳到 4 大段任一段（smooth scroll）。
- 讓滾到頁面深處時能一鍵回頂（fab，僅在快捷按鈕已不可見時出現）。
- 抽出 2 個共用元件供未來 Ch2/Ch3 重用，不在 `Ch1View.vue` inline 寫死。
- 與既有 `BackToWordFab` 共存不互相遮擋。

**Non-Goals:**

- 不做 scroll spy（按鈕高亮當前 section）。
- 不做 URL hash 同步。
- 不調整既有 fab 的視覺、位置、行為。
- 不改 NavBar 風格／高度／背景。
- 不為 `/grammar` 加類似機制。

## Decisions

### 抽出共用元件 SectionQuickNav.vue 與 BackToTopFab.vue 至 src/shared/components/

兩個元件以「sections array + anchor element」為介面，與 ch1 內容完全解耦，未來新增 Ch2View / Ch3View 時直接 import + 餵 4 筆 sections 即可重用。

**替代方案**：把 quick nav 與 fab 邏輯 inline 寫進 `Ch1View.vue`。較少新檔案，但未來擴充內容頁時要 copy-paste，違反專案 constitution「不為了便利硬套共用」與「最簡可行解但不重複」原則。淘汰。

### 快捷導覽列不 sticky

discuss.txt 明示「畫面滾動到看不見快捷按鈕時」才出 fab——若 sticky 則永遠看得到，fab 永遠不需出現，整個 fab 設計失去意義。因此 `SectionQuickNav` 是 header 下方的**普通頁內元素**，跟隨頁面捲動消失，由 `BackToTopFab` 透過 IntersectionObserver 補位。

**替代方案**：sticky 模式 + fab 改用 scrollY threshold。語意改為「滾遠就提供回頂捷徑」。被 discuss.txt 字面排除。淘汰。

### Smooth scroll 用 scrollIntoView，section 加固定 id

每個 `<section>` 加上明確 id（`ch1-section-bilingual` / `ch1-section-vocabulary` / `ch1-section-phrases` / `ch1-section-breakdown`），按鈕點下時呼叫 `document.getElementById(id)?.scrollIntoView({behavior:"smooth", block:"start"})`。

`Ch1View.vue` 已有相同 pattern（既有閱讀書籤功能用 `scrollIntoView({behavior:"smooth"})`），保持一致。

**替代方案 A**：用 `<a href="#anchor">`。URL hash 會被 history 紀錄，下次切回 `/ch1` 可能直接跳到上次的 section，與既有「閱讀書籤」composable 行為混淆。淘汰。

**替代方案 B**：用 `element.scrollTo()` 手動計算 offset。更可控但程式碼較囉嗦；`scrollIntoView` 在所有目標瀏覽器（iOS Safari、Android Chrome）已穩定支援。淘汰。

### 全域 `scroll-padding-top` 處理 sticky NavBar 遮擋

NavBar 是 `sticky top-0`，預設 `scrollIntoView({block:"start"})` 會把目標元素貼到 viewport 頂端——剛好被 NavBar 遮住。修法：在 `src/style.css` 加一條 `html { scroll-padding-top: calc(4rem + env(safe-area-inset-top, 0px)); }`。

優點：
- 一條規則 cover 全部 `scrollIntoView` 呼叫，包括既有的閱讀書籤（scene block scroll）與新的 section quick nav，不需要在每個元件分別處理。
- 用 CSS env() 自動處理 iOS 安全區（notch、瀏海），手機 viewport 也正確。

**替代方案 A**：在每個 `<section>` 加 Tailwind class `scroll-mt-20`。要對 N 個元素重複；未來新增章節頁或 anchored 元素時容易忘。淘汰。

**替代方案 B**：在 SectionQuickNav 的 click handler 內手動計算 `window.scrollTo({top: el.offsetTop - navHeight, behavior:"smooth"})`。把 layout 邏輯混進 JS，且無法 cover 既有閱讀書籤。淘汰。

### BackToTopFab 用 IntersectionObserver 監看 quick nav 元素

`BackToTopFab` 接受 `anchorEl: HTMLElement | null` prop。建立 IntersectionObserver 監看 `anchorEl`，當 `isIntersecting === false` 時顯示 fab、`true` 時隱藏。Observer 在元件 unmount 時 disconnect。

**替代方案**：scrollY > 某個 threshold 才顯示。threshold 需手動量測（取決於 quick nav 在頁面的位置），未來內容改動可能失準，而 IntersectionObserver 是「響應實際可見性」更直觀。淘汰。

### Fab 並存：BackToTopFab 在上、BackToWordFab 在下，靠 offsetBottom prop 控制

兩個 fab 都用 `fixed right-6 z-40`，預設 `bottom-6`。當兩者同時顯示時：

- `BackToWordFab` 維持原樣 `bottom-6`（不動既有元件，零侵入）。
- `BackToTopFab` 接受 `offsetBottom: number`（單位 px），預設 0；當父層偵測到 `BackToWordFab` 也在顯示時，傳入合適的 offset（例如 60）讓它疊在 BackToWord 之上。

`Ch1View.vue` 是兩個 fab 共同的父層，由它決定 `offsetBottom` 值：

```ts
const fabOffset = computed(() => sourceScrollY.value !== null ? 60 : 0)
```

**替代方案 A**：兩個 fab 都用 `bottom-6`，互相覆蓋。功能可用但視覺壞，使用者點到哪個不確定。淘汰。

**替代方案 B**：移到不同角落（一個左下、一個右下）。打破既有 BackToWord 位置慣例，使用者預期會被打亂。淘汰。

**替代方案 C**：只顯示其中之一（優先回單字）。會讓「滾到頁底想回頂時」剛好遇上單字 fab 卡住，使用者按不到回頂。淘汰。

### NavBar 採用「內容 ▾」dropdown 而非直連單章按鈕

NavBar 中間放一個 dropdown 觸發器「內容 ▾」，按下展開選單列出所有 chapter；不直接把單一 `Ch1` 寫成 NavBar 按鈕。所有 chapter 資料從 `src/shared/config/chapters.ts` 這個單一資料源讀取，未來新增 Ch2/Ch3 時 NavBar 本身不需要改——只需在 config 添加一筆。

實作要點：
- Trigger button `data-testid="nav-content-trigger"`，文字「內容 ▾」
- Menu panel `data-testid="nav-content-menu"`，絕對定位在 trigger 下方
- 每個 chapter 一個 `<button data-testid="nav-content-{id}">{titleZh}</button>`
- 點選 chapter button：呼叫 `router.push(chapter.path)` 並收合 menu
- 點 menu 外面 / 按 Esc：收合 menu
- Active 判定：當 `route.path` 等於任一 chapter 的 `path` 時，trigger 加 active 高亮
- mobile-first：min-width 約 12rem，hover 提示，整列可點

**替代方案 A**：直接把 `Ch1` 寫死成 NavBar 第三顆按鈕。一開始 propose 採用此方案，但使用者於 apply 階段反映：未來新增 Ch2/Ch3 時 NavBar 會變成「首頁 / Ch1 / Ch2 / Ch3 / 文法」一排，手機 viewport 無法承受。淘汰。

**替代方案 B**：1 章用直連按鈕、3+ 章自動轉 dropdown 的數量分支。使用者會看到 NavBar 行為隨章節數量跳變，使用體驗不一致。淘汰。

**替代方案 C**：完全移除中間按鈕、依賴首頁列表切換內容頁。回到原始痛點「ch1 → grammar → 想回 ch1 無法」。淘汰。

### 共用 chapters config 作為單一資料源

新增 `src/shared/config/chapters.ts`，匯出 `chapters` 陣列。NavBar dropdown 與 HomeView 文章列表皆 import 此 config，不再硬編 chapter 字串。HomeView 原本硬編 `<ArticleListItem title="我的紐約之旅" ... @navigate="router.push('/ch1')" ...>` 改成 `v-for` 跑 chapters。

`ChapterEntry` 型別：
- `id: string` — 用於 completion key、route 識別
- `path: string` — Vue Router path（如 `/ch1`）
- `shortLabel: string` — 短標籤（如 `Ch1`），未來可能用於麵包屑或卡片角標
- `titleZh: string` — 中文標題（顯示用主標題）
- `titleEn: string` — 英文副標題

**替代方案**：把 chapters 寫進 Pinia store 或 IndexedDB。對「靜態內容頁清單」過度工程。淘汰。

## Implementation Contract

#### SectionQuickNav.vue

- **路徑**：`src/shared/components/SectionQuickNav.vue`
- **Props**：
  ```ts
  interface QuickNavSection { id: string; label: string }
  defineProps<{ sections: QuickNavSection[] }>()
  ```
- **暴露給父層**：根元素 ref，給 `BackToTopFab` 的 `anchorEl` 用。透過 `defineExpose({ rootEl })`，並在 template root 上掛 `ref="rootEl"`。
- **行為**：
  - 渲染 `sections.length` 顆按鈕，按鈕文字 = `section.label`。
  - 點按鈕時呼叫 `document.getElementById(section.id)?.scrollIntoView({behavior:"smooth", block:"start"})`。
  - 找不到對應元素時 silent no-op（不 throw）。
- **樣式**：
  - 容器 `flex flex-nowrap gap-2 overflow-x-auto`（手機橫向空間有限，允許橫向捲動）。
  - 按鈕沿用既有按鈕風格：`px-3 py-1.5 rounded text-sm font-medium bg-paper-2 border border-line text-ink hover:bg-line transition-colors`。
- **測試 hooks**：
  - 根元素 `data-testid="ch1-quick-nav"`。
  - 每顆按鈕 `data-testid="quick-nav-{section.id}"`。

#### BackToTopFab.vue

- **路徑**：`src/shared/components/BackToTopFab.vue`
- **Props**：
  ```ts
  defineProps<{
    anchorEl: HTMLElement | null
    offsetBottom?: number  // px, default 0
  }>()
  ```
- **行為**：
  - 元件 mount 時，若 `anchorEl` 非 null，建立 `IntersectionObserver(callback)` 並 observe `anchorEl`。
  - callback：`isVisible.value = entries[0].isIntersecting`，fab 在 `isVisible === false` 時顯示。
  - 元件 unmount 時 `observer.disconnect()`。
  - `anchorEl` prop 變動時（reactive ref 來源變化），重新 observe 新的元素。
  - 點 fab 時呼叫 `window.scrollTo({top:0, behavior:"smooth"})`。
- **樣式**：
  - `fixed right-6 z-40`。
  - `bottom: calc(1.5rem + ${offsetBottom}px)`（1.5rem = `bottom-6` 預設）；用 inline style 設 `bottom`。
  - Fab 視覺沿用 `BackToWordFab` 的圓角矩形 + terracotta 配色 + transition fade pattern。
- **測試 hooks**：
  - `data-testid="back-to-top-fab"`。

#### Ch1View.vue 變更

- 4 個 `<section>` 加 id：
  - `<section id="ch1-section-bilingual">` 中英對照全文
  - `<section id="ch1-section-vocabulary">` 重點單字
  - `<section id="ch1-section-phrases">` 重點片語與慣用語
  - `<section id="ch1-section-breakdown">` 句型解析
- header 之後、第一個 section 之前，插入 `<SectionQuickNav>`：
  ```vue
  <SectionQuickNav ref="quickNavRef" :sections="ch1Sections" />
  ```
- `ch1Sections` 常數：
  ```ts
  const ch1Sections = [
    { id: 'ch1-section-bilingual', label: '全文' },
    { id: 'ch1-section-vocabulary', label: '單字' },
    { id: 'ch1-section-phrases', label: '片語' },
    { id: 'ch1-section-breakdown', label: '句型' },
  ]
  ```
- 在現有 `<BackToWordFab>` 旁掛 `<BackToTopFab>`：
  ```vue
  <BackToTopFab
    :anchor-el="quickNavRootEl"
    :offset-bottom="sourceScrollY !== null ? 60 : 0"
  />
  ```
- 用 `quickNavRef.value?.rootEl` 取得根元素，賦給 `quickNavRootEl` ref（在 `onMounted` 後）。

#### NavBar.vue 變更

- 在「首頁」與「文法」兩個 RouterLink 之間插入第 3 個 RouterLink：
  ```vue
  <RouterLink to="/ch1" custom v-slot="{ navigate, href, isActive }">
    <a :href="href" data-testid="nav-ch1" @click="navigate" :class="[...]">Ch1</a>
  </RouterLink>
  ```
- 樣式 class 與既有兩顆完全一致（包括 active 高亮）。
- 順序：首頁 → Ch1 → 文法。

#### 驗證條件

- 4 個新單元測試檔（SectionQuickNav、BackToTopFab、NavBar 追加、Ch1View 追加）皆綠燈。
- `npm run test:unit` 全項通過、無回歸。
- 手機 viewport（Chrome DevTools iPhone 14, 390×844）手動驗證 4 條 happy path（見 tasks 7.x）。

#### Scope boundary

- **In scope**：NavBar Ch1 按鈕、SectionQuickNav 元件、BackToTopFab 元件、Ch1View 整合、相關測試。
- **Out of scope**：scroll spy 高亮、URL hash 同步、其他內容頁、其他路由、既有 BackToWordFab 任何視覺／行為變動、grammar 頁類似機制、PWA 離線快取調整。

## Risks / Trade-offs

- [Risk] iOS Safari 對 `scrollIntoView({behavior:"smooth"})` 在某些舊版本支援不完整 → Mitigation：目標 Safari 15+（已涵蓋當前 iOS 15+），符合既有 ch1 書籤功能已用過此 API 的兼容性基線。
- [Risk] IntersectionObserver 在元件早期 mount（anchorEl 還是 null）建立失敗 → Mitigation：在 `BackToTopFab` 內用 `watch(() => props.anchorEl, ...)` 響應 prop 變動才 observe；初始為 null 時不建 observer。
- [Risk] 兩個 fab 同時 transition，視覺重疊一瞬 → Mitigation：transition duration 都用既有的 0.2s opacity + transform 8px，兩個 fab 動畫一致；offsetBottom 是 inline style，prop 一變即更新，不會有過渡撕裂。
- [Risk] NavBar 加按鈕導致 mobile viewport 過窄擠出 → Mitigation：3 顆按鈕加 gap 在 390px viewport 仍寬鬆（總寬約 240px）；無溢出風險。
- [Risk] 未來新增 ch2 時，SectionQuickNav 跨 chapter 的 id 命名衝突 → Mitigation：本變更採 `ch1-section-*` 前綴；Ch2View 用 `ch2-section-*`，sections array 由父層提供，元件本身不假設前綴。

## Migration Plan

1. 先建 `BackToTopFab.vue` 與其測試（純元件，無依賴，TDD 紅 → 綠）。
2. 建 `SectionQuickNav.vue` 與其測試（同上）。
3. `Ch1View.vue` 串接：加 4 個 section id、放兩個新元件、串 ref / prop；追加 ch1 測試。
4. `NavBar.vue` 加 Ch1 按鈕；追加 NavBar 測試。
5. 跑 `npm run test:unit` 確認全綠。
6. `npm run dev` 起 dev server，Chrome DevTools iPhone 14 preset 手動驗證 4 條 happy path。

無 rollback 複雜性——若實作中發現問題，因為 2 個新元件、2 處變動皆獨立可單獨 revert。

## Open Questions

無。所有實作細節已於本文件 Implementation Contract 與 spec scenarios 明確規範。
