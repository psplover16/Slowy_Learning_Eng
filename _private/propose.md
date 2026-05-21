# Proposal — `/ch1` 路由切換與頁內快捷導覽

> 此檔由 `/spectra-discuss` 產出。輸入：`_private/discuss.txt`。
> **狀態：定稿** — 5 個 assumption 全部接受，可執行 `/spectra-propose` 立案。

---

## 一、問題

`_private/discuss.txt` 兩個訴求：

1. **路由切換不便**：在 `/ch1` 想去 `/grammar`，看完想回 `/ch1` 沒辦法——必須先切到首頁 `/`，再從首頁列表點 ch1。多一個步驟，太麻煩。
2. **`/ch1` 頁內缺乏快捷導覽**：ch1 文章很長（15 個 scene + 6 個 vocab group + 13 個 phrase + 30 個 sentence breakdown），分四大段（中英對照全文、重點單字、重點片語與慣用語、句型解析），想：
   - 頂部 4 個快捷按鈕，點下 smooth scroll 到對應段落
   - 當畫面滾動到快捷按鈕看不見時，右下角顯示懸浮 fab，點下 smooth scroll 回頂

---

## 二、決議

| # | 決議 | 理由 |
|---|------|------|
| D1 | NavBar 直接加第三個按鈕「Ch1」連到 `/ch1` | YAGNI——目前只有一篇內容，未來真出 Ch2 再 refactor 為下拉選單；最直接、不影響既有體驗 |
| D2 | 頁內快捷按鈕**不 sticky**，是 header 下方的普通元素 | discuss.txt 明示「滾到看不見快捷按鈕時」才出 fab；若 sticky 則永遠看得到 fab 永遠不需出現，矛盾 |
| D3 | 4 個 section 加 id，按鈕用 `scrollIntoView({behavior:"smooth"})` | 專案 `Ch1View.vue:120` 已用相同 API；id 用 `ch1-section-*` 前綴避免未來 Ch2 重複 |
| D4 | 用 `IntersectionObserver` 偵測快捷按鈕區塊可見性，決定 fab 顯示 | 比 scrollY threshold 精確；元素長度變化也不需重抓 threshold |
| D5 | 抽共用元件 `SectionQuickNav.vue` + `BackToTopFab.vue` 放 `src/shared/components/` | 未來 Ch2/Ch3 可重用；接受 `sections: Array<{id, label}>` prop |
| D6 | `BackToTopFab` 與既有 `BackToWordFab` 同時出現時**垂直堆疊**（回單字在上、回頂在下） | 兩個 fab 都用 `bottom-6 right-6 z-40`，需錯位；垂直堆疊不破壞既有 BackToWord 體驗 |

---

## 三、規格

### 3.1 NavBar 變更（D1）

`src/shared/components/NavBar.vue` 在「首頁」「文法」之間或之後加第三個 `<RouterLink>`：

```
[首頁]  [Ch1]  [文法]
```

- 連結 `to="/ch1"`
- 樣式同既有兩個按鈕：未 active 時 `bg-paper text-ink`，active 時 `bg-terracotta text-white`
- `data-testid="nav-ch1"`（為了測試）

按鈕順序：首頁 → Ch1 → 文法（讓「內容」位於中間，文法在右）。

### 3.2 `/ch1` 頁面快捷導覽（D2、D3）

`src/modules/ch1/views/Ch1View.vue` 結構變更：

```html
<main>
  <header>...</header>

  <!-- 新增：快捷導覽列（非 sticky，會跟著滾走）-->
  <SectionQuickNav :sections="ch1Sections" />

  <section id="ch1-section-bilingual">中英對照全文...</section>
  <section id="ch1-section-vocabulary">重點單字...</section>
  <section id="ch1-section-phrases">重點片語與慣用語...</section>
  <section id="ch1-section-breakdown">句型解析...</section>
</main>

<BackToWordFab ... />            <!-- 既有 -->
<BackToTopFab :anchorEl="..." /> <!-- 新增 -->
```

#### `SectionQuickNav.vue` 規格

```ts
interface QuickNavSection {
  id: string      // section 元素 id
  label: string   // 按鈕文字
}
defineProps<{ sections: QuickNavSection[] }>()
```

- 4 個按鈕橫向排列（手機優先：必要時可橫向 scroll；`flex flex-nowrap overflow-x-auto`）
- 每個按鈕點下 `document.getElementById(id)?.scrollIntoView({behavior:"smooth", block:"start"})`
- 元素本身**不 sticky**，跟著頁面滾動
- 暴露根元素 ref（用 `defineExpose({ rootEl })` 或讓父層用 ref 抓）——給 `BackToTopFab` 監看用
- `data-testid="ch1-quick-nav"`

#### `Ch1View.vue` 的 sections 設定

```ts
const ch1Sections = [
  { id: 'ch1-section-bilingual', label: '全文' },
  { id: 'ch1-section-vocabulary', label: '單字' },
  { id: 'ch1-section-phrases', label: '片語' },
  { id: 'ch1-section-breakdown', label: '句型' },
]
```

label 用簡稱（手機橫向空間有限）。

### 3.3 回頂 fab（D4、D6）

#### `BackToTopFab.vue` 規格

```ts
defineProps<{
  /** 監看此元素是否在 viewport；元素不在時顯示 fab */
  anchorEl: HTMLElement | null
  /** 若已有其他 fab 顯示在 right-6 bottom-6，此 fab 上推；單位 px */
  offsetBottom?: number  // default 0
}>()
```

行為：
- 用 `IntersectionObserver` 監看 `anchorEl`
- 當 `anchorEl` 不在 viewport（`!isIntersecting`）→ 顯示 fab
- 點 fab → `window.scrollTo({top:0, behavior:"smooth"})`
- 樣式：`fixed right-6 z-40`，`bottom` 由 `offsetBottom` 計算（預設 `bottom: 1.5rem`，即 `bottom-6`）
- 圖示 / 文字：「↑ 回頂」
- Transition：複用 `BackToWordFab.vue` 的 fab fade pattern
- `data-testid="back-to-top-fab"`

#### Ch1View.vue 同時掛兩個 fab（D6 堆疊）

```vue
<BackToWordFab
  :source-scroll-y="sourceScrollY"
  @return-to-source="returnToSource"
/>
<BackToTopFab
  :anchor-el="quickNavRef"
  :offset-bottom="sourceScrollY !== null ? 60 : 0"
/>
```

- `BackToWordFab` 永遠在最底（`bottom-6 right-6`）
- `BackToTopFab` 若同時要顯示 → `offsetBottom=60`（堆疊在 BackToWord 上方）
- `BackToTopFab` 若獨自顯示 → `offsetBottom=0`（自己貼底）

這條件可由 `BackToTopFab` 自己查 DOM，但更乾淨是父層 `Ch1View` 控制（passing prop）。

---

## 四、影響範圍

### 新增檔案

| 路徑 | 說明 |
|------|------|
| `src/shared/components/SectionQuickNav.vue` | 4 段快捷按鈕橫向 toolbar |
| `src/shared/components/BackToTopFab.vue` | IntersectionObserver 觸發的回頂 fab |
| `src/__tests__/SectionQuickNav.test.ts` | 單元測試：sections prop、click → scrollIntoView 呼叫 |
| `src/__tests__/BackToTopFab.test.ts` | 單元測試：anchorEl 進出 viewport → fab 顯隱、offsetBottom 套用 |

### 修改檔案

| 路徑 | 變動 |
|------|------|
| `src/shared/components/NavBar.vue` | 加第 3 個 RouterLink「Ch1」連 `/ch1` |
| `src/modules/ch1/views/Ch1View.vue` | (a) 4 個 `<section>` 加 `id="ch1-section-*"`；(b) header 後加 `<SectionQuickNav>`；(c) 結尾加 `<BackToTopFab>` 並把 quickNavRef 串進去 |
| `src/__tests__/NavBar.test.ts` | 加斷言：第 3 個按鈕存在、文字「Ch1」、`to="/ch1"` |
| `src/__tests__/Ch1View.test.ts` | 加斷言：4 個 section 有對應 id、SectionQuickNav 渲染、BackToTopFab 渲染 |

### 不動的檔案

- `src/app/router/index.ts` — `/ch1` 路由已存在
- `src/shared/components/BackToWordFab.vue` — 既有 fab 不動，只透過父層 prop 調整位置
- `src/shared/composables/useUnderlinkBacklink.ts` — 不動
- `src/modules/grammar/views/GrammarView.vue` — 不動

---

## 五、Non-Goals（明確不做）

- 不為 `/grammar` 加類似快捷導覽（文法頁是單一連續清單，G01–G18 已用 badge 編號夠用）
- 不為 NavBar 加動態內容頁選單（YAGNI——目前只有 ch1）
- 不改 NavBar 視覺風格／高度／背景色
- 不新增「上一篇 / 下一篇」內容頁切換（單一篇內容，無需要）
- 不調整既有 `BackToWordFab` 的位置或行為
- 不引入 scroll spy（按鈕 highlight 當前 section）——這是 nice-to-have，可未來變更再做
- 不引入 `<a href="#anchor">` URL hash 同步——只用 JS scrollIntoView，URL 不變

---

## 六、設計與測試示例

### 6.1 SectionQuickNav 視覺示意

```
┌─────────────────────────────────────────────┐
│ [全文]  [單字]  [片語]  [句型]              │ ← 普通 flex 元素
└─────────────────────────────────────────────┘   非 sticky，會跟頁面滾走
        ↓ 點「單字」
┌─────────────────────────────────────────────┐
│  scrollIntoView({behavior:"smooth"})        │
│  捲到 <section id="ch1-section-vocabulary"> │
└─────────────────────────────────────────────┘
```

### 6.2 BackToTopFab 觸發示意

```
ViewPort 頂部
─────────────
│ NavBar
│ Header
│ [全文][單字][片語][句型]  ← anchorEl
│ ...                       ← 在 viewport，fab 隱藏
─────────────
↓ 使用者向下滾動

ViewPort 頂部
─────────────
│ ...單字 section 內容
│ ...                                       ┌──────┐
│                                           │↑回頂│ ← fab
─────────────                               └──────┘
                                             bottom:6
```

### 6.3 兩 fab 堆疊示意（同時顯示）

```
                                          ┌──────┐
                                          │↑回頂│ ← BackToTopFab, bottom:60+6
                                          └──────┘
                                          ┌────────┐
                                          │↑回單字│ ← BackToWordFab, bottom:6
                                          └────────┘
```

### 6.4 主要測試案例

**NavBar.test.ts**：
- 渲染後 `[data-testid="nav-ch1"]` 存在、文字是「Ch1」、`href` 包含 `/ch1`
- 點下後 router 切到 `/ch1`（用 mock router 驗證）

**SectionQuickNav.test.ts**：
- 給 4 個 sections → 渲染 4 個按鈕，文字符合 `section.label`
- 點第 N 個按鈕 → 呼叫 `document.getElementById(sections[N].id).scrollIntoView` with `{behavior:"smooth"}`
- 找不到對應 id 的元素時不 throw（gracefully no-op）

**BackToTopFab.test.ts**：
- anchorEl=null → fab 不顯示
- anchorEl 在 viewport（mock IntersectionObserver entry `isIntersecting=true`）→ fab 不顯示
- anchorEl 離開 viewport（`isIntersecting=false`）→ fab 顯示
- 再回到 viewport → fab 重新隱藏
- 點 fab → `window.scrollTo` 被呼叫且傳入 `{top:0, behavior:"smooth"}`
- `offsetBottom=60` prop → 樣式 `bottom: calc(1.5rem + 60px)` 或等價

**Ch1View.test.ts**（追加）：
- 4 個 `<section>` 有對應 `id`（`ch1-section-bilingual`、`ch1-section-vocabulary`、`ch1-section-phrases`、`ch1-section-breakdown`）
- `SectionQuickNav` 元件被渲染、`sections` prop 是 4 筆
- `BackToTopFab` 元件被渲染

---

## 七、下一步

執行 `/spectra-propose` 立案，建議 change name：

```
add-ch1-quick-nav-and-nav-ch1-link
```

或拆成兩個 change（單一職責更清晰）：

```
add-nav-ch1-link              ← 只動 NavBar（小）
add-ch1-section-quick-nav     ← 動 Ch1View + 兩個新共用元件（中）
```

**推薦**：合成一個 change，因為兩者都源自同一個使用者痛點（「在 ch1 內無法快速導航」），分兩個 PR 會打散 review context。tasks.md 內部分群即可。

實作建議順序：

1. `BackToTopFab.vue` + 單元測試（純元件，無依賴，先寫先綠）
2. `SectionQuickNav.vue` + 單元測試
3. `Ch1View.vue` 串接（加 section id、放兩個新元件、串 ref/prop）+ test 追加
4. `NavBar.vue` 加 Ch1 按鈕 + test 追加
5. 手機 viewport 手動驗證：點按鈕跳轉、滾出畫面看 fab 出現、fab 點下回頂、底線單字觸發兩 fab 並存時不重疊
