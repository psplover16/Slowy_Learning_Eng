## Context

Slowy_Learning_Eng 目前只有 1 篇文章（Ch1），完整內容（15 個場景中英對照、6 個主題單字群組、13 張片語卡、30+ 條句型解析）全部硬寫在 `src/modules/ch1/views/Ch1View.vue`，總計 940 行。每個資料 const 都帶有 type interface 與 inline 的 `hl()` highlighter（在英文句子內包 `<span data-target="vocab-xxx">` 提供底線單字互動）。

使用者明確表態「我很快就會添加 ch2」與「未來可能有 ch100 的可能」，因此「直接 copy-paste Ch1View.vue 改成 Ch2View.vue」的路線無法持續。本變更把資料與檢視拆開，建立可重用骨架。

承接：前一個 change `improve-ch1-navigation` 已建立 `src/shared/config/chapters.ts` 單一資料源。本變更擴充其 schema 並真正資料化。

## Goals / Non-Goals

**Goals:**

- 將 Ch1 內容從 view 元件抽到獨立的 data 模組（pure TS）。
- 建立 generic `ChapterView.vue` 渲染任一章節（透過 chapters config 解析）。
- 擴充 chapters config 加 `dataLoader`，每個章節宣告自己的 lazy import 路徑。
- 從 chapters config 自動產生 Vue Router routes，路由註冊不再硬編。
- 共用元件（SceneBlock、WordTag、PhraseCard、SentenceBreakdown、`hl()` helper）搬到 `src/modules/chapters/`，讓新章節零成本重用。
- 保留全部現有行為：閱讀書籤、底線單字回跳、quick-nav、回頂 fab、PWA 離線。

**Non-Goals:**

- 不引入 `/chapter/:id` 動態路由形式，URL 保留 `/ch1`、`/ch2` 等可讀路徑。
- 不轉成 JSON / 後端 API：本變更只重組客戶端模組，不引入網路請求。
- 不加搜尋、分組、章節索引頁 UI。
- 不改 PWA Service Worker 快取策略；既有 `globPatterns` 涵蓋所有 `.js` 仍適用。
- 不引入 Pinia / Vuex 全域 store 管 chapter 資料。
- 不調整既有共用元件（NavBar、SectionQuickNav、BackToTopFab、Mp3Player、BackToWordFab）介面。

## Decisions

### 資料模組為 TS 而非 JSON

每個章節資料存 `src/modules/chapters/data/<id>.ts`，匯出 `default` 為 `ChapterData` 物件。

優點：
- TypeScript 型別檢查在編譯期抓欄位錯誤；JSON 無此保障。
- 可使用 template literal 與 import 進 `hl()` helper，產出帶 `data-target` 的英文句 HTML。原始 Ch1View 大量使用 `${hl('text', 'vocab-xxx')}` 字串拼接，改 JSON 無法保留。
- 動態 import (`import('./data/ch1')`) 觸發 Vite code-split，每個章節獨立 chunk，符合「離線可用 + 按需載入」目標。

**替代方案 A**：JSON 檔。失去型別與 hl 助益。淘汰。

**替代方案 B**：以 Markdown + custom plugin parse。對 ch1 既有 HTML 標記轉換成本太高。淘汰。

### 共用元件搬到 `src/modules/chapters/components/`

`SceneBlock.vue`、`WordTag.vue`、`PhraseCard.vue`、`SentenceBreakdown.vue` 不是「ch1 特有」而是「任何章節都會用」的呈現元件，因此從 `src/modules/ch1/components/` 搬到 `src/modules/chapters/components/`，與 generic `ChapterView.vue` 同層。

import 路徑變化：所有引用 `../components/SceneBlock.vue` 等的地方改為相對 `chapters` 模組。

**替代方案**：搬到 `src/shared/components/`。較廣的共用範圍但跟章節資料耦合（接受的 props 都是 chapter data 結構），放 shared 反而誤導。淘汰。

### ChapterView 透過 `useRoute().params.id` 解析

`ChapterView.vue` 內部呼叫 `useRoute()`，從 `route.params.id` 取得 chapter id，到 chapters config 找 entry，呼叫 entry.dataLoader() 取得 ChapterData，渲染 layout。

route 註冊方式：`chapters.ts` 提供 `path` 與 `id`，`router/index.ts` 用 `chapters.map(...)` 自動產生 route，每條 route `path: chapter.path`、`name: chapter.id`、`component: () => import('../../modules/chapters/ChapterView.vue')`、`props: { id: chapter.id }`（或讓元件自己讀 `route.name`）。

選用 `props: route => ({ id: route.name })` 把 chapter id 注入 ChapterView，比 `useRoute().params` 更純粹（元件變成完全可測，不依賴 router 全域狀態）。

**替代方案 A**：直接用 `useRoute()` 內部取值。可行但測試需 mock router。淘汰。

**替代方案 B**：把 chapter id 透過 chapters config 提供的 component 工廠注入（`component: () => import(...).then(m => ({ default: defineComponent({ ... props: { id: 'ch1' } ... }) }))`）。過度間接。淘汰。

### chapters.ts schema 擴充：加 `dataLoader`

```ts
interface ChapterEntry {
  id: string
  path: string
  shortLabel: string
  titleZh: string
  titleEn: string
  dataLoader: () => Promise<{ default: ChapterData }>
}
```

每章 entry 自己宣告 import：
```ts
{
  id: 'ch1',
  path: '/ch1',
  // ...
  dataLoader: () => import('../../modules/chapters/data/ch1'),
}
```

Vite 看到 dynamic import 路徑會自動 code-split，第一次進章節才下載對應 chunk。NavBar dropdown 與 HomeView 列表不會觸發 dataLoader（只需 metadata），保留快速首屏。

### `hl()` helper 提取至 `src/modules/chapters/utils/highlight.ts`

原本是 Ch1View `<script setup>` 區的 inline 函式。提取後成為模組級別的純函式，被每個 chapter data 模組 import 使用。簽名 unchanged：`hl(text: string, targetId: string): string`，回傳 `<span data-target="..." class="...">` HTML。

**安全考量**：`hl()` 接收的 `text` 是英文字串字面值（從 chapter data 自己 author），不來自外部輸入，因此不需 escape。但 doc-string 應標明此函式輸出**不**安全 escape，僅用於受控 chapter content。

### 路由註冊改為從 chapters config 自動生成

`router/index.ts` 改為：

```ts
const chapterRoutes: RouteRecordRaw[] = chapters.map((chapter) => ({
  path: chapter.path,
  name: chapter.id,
  component: () => import('../../modules/chapters/ChapterView.vue'),
  props: (route) => ({ id: route.name as string }),
}))

export const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    { path: '/', name: 'home', component: HomeView },
    { path: '/grammar', name: 'grammar', component: () => import('../../modules/grammar/views/GrammarView.vue') },
    ...chapterRoutes,
  ],
})
```

新增章節時只需動 chapters.ts；router/index.ts 不變。

### Ch1View.test.ts → ChapterView.test.ts，所有 ch1 行為仍保留為「ch1 instance」 case

既有 20 個 Ch1View 測試（scene blocks、explanation anchors、WordTag count、underlined vocab、sentence breakdowns、section ids、quick nav、back-to-top integration）改為以 `id="ch1"` mount ChapterView。斷言內容不變，因為 chapter data 與既有 hardcoded 內容應**完全一致**。

新增 `chapterDataModule.test.ts` 驗證 `src/modules/chapters/data/ch1.ts` 符合 `ChapterData` 型別契約（scenes 至少 15、phrases 至少 13、breakdowns 至少 29 等）。

## Implementation Contract

#### Type definitions

- **路徑**：`src/modules/chapters/types.ts`
- **匯出**：interface `ChapterData`, `Scene`, `SceneSentence`, `VocabGroup`, `VocabItem`, `PhraseCard`, `SentenceBreakdown`, `BreakdownChunk`, `WordTag`
- `ChapterData` 必填欄位：
  - `headerTitleZh: string`
  - `headerTitleEn: string`
  - `headerPodcastLabel: string`
  - `headerLevelTag: string`
  - `headerTopicTag: string`
  - `scenes: Scene[]`
  - `vocabGroups: VocabGroup[]`
  - `phrases: PhraseCard[]`
  - `breakdowns: SentenceBreakdown[]`
  - `mp3Src?: string | null`

#### Highlight helper

- **路徑**：`src/modules/chapters/utils/highlight.ts`
- **匯出**：`function hl(text: string, targetId: string): string`
- **行為**：回傳 `<span data-target="{targetId}" class="underline decoration-terracotta underline-offset-2 cursor-pointer hover:text-terracotta transition-colors">{text}</span>`
- **不 escape** text 參數（doc-comment 標明僅供受控 chapter content 使用，不可吃外部輸入）

#### Chapter data module

- **路徑**：`src/modules/chapters/data/ch1.ts`
- **匯出**：`export default const chapter: ChapterData`（內容完全等同既有 Ch1View.vue 內 4 個 const 陣列 + header metadata）
- 引用 `hl` from `../utils/highlight`
- 任何使用 inline HTML（如 `<strong>`、`<span>`）的 sentence 字串完全保留

#### ChapterView component

- **路徑**：`src/modules/chapters/ChapterView.vue`
- **Props**：`id: string`（chapter id，從 router props 注入）
- **行為**：
  - `onMounted`：從 chapters config 查 entry → 呼叫 `entry.dataLoader()` → 把 returned `default` 設成 reactive ref。
  - 渲染既有 Ch1View layout：Mp3Player（接 chapter.mp3Src）、header、SectionQuickNav、4 個 sections、BackToWordFab、BackToTopFab。
  - 4 個 section id 用 `${id}-section-bilingual` 等模式生成（不再 hardcode `ch1-`）。
  - quick-nav sections array 同模式動態生成。
- **載入狀態**：第一次 dataLoader 完成前顯示簡單 loading 訊息（單行文字「載入中…」，不阻塞 NavBar）。
- **錯誤狀態**：chapters config 找不到 entry 或 dataLoader 拋錯時，顯示「找不到此章節」訊息，不 crash。
- 既有 useReadingBookmark + useUnderlinkBacklink composable 邏輯原樣保留，僅把 bookmark chapter key 從 `'ch1'` 改成 `props.id`。

#### chapters.ts schema 擴充

- **路徑**：`src/shared/config/chapters.ts`
- 新增欄位 `dataLoader: () => Promise<{ default: ChapterData }>` 到 `ChapterEntry` interface
- ch1 entry 加 `dataLoader: () => import('../../modules/chapters/data/ch1')`
- type import: `import type { ChapterData } from '../../modules/chapters/types'`

#### Router

- **路徑**：`src/app/router/index.ts`
- 改為：保留 `/`、`/grammar` 既有 routes；新增 `chapters.map(...)` 動態生成的 chapter routes
- 每條 chapter route：`path: chapter.path`, `name: chapter.id`, `component: () => import('../../modules/chapters/ChapterView.vue')`, `props: (route) => ({ id: route.name as string })`

#### 移動的共用元件

從 `src/modules/ch1/components/` 搬到 `src/modules/chapters/components/`：
- SceneBlock.vue
- WordTag.vue
- PhraseCard.vue
- SentenceBreakdown.vue

內容**完全不動**（只改檔案位置），import 路徑更新。`src/modules/ch1/` 整個資料夾在搬遷後刪除。

#### 移動的測試

- 既有 `src/__tests__/Ch1View.test.ts` 內容大多保留，重新命名為 `src/__tests__/ChapterView.test.ts`；mount 改為 `mount(ChapterView, { props: { id: 'ch1' }, ... })`；其他斷言（scene 數、id、section ids、quick-nav 整合等）保留。
- 新增 `src/__tests__/chapterDataModule.test.ts` 驗證 ch1 data module 符合 `ChapterData` 介面 + 內容 sanity（scenes ≥ 15、phrases ≥ 13、breakdowns ≥ 29）。
- `src/__tests__/router.test.ts` 加斷言：`/ch1` route 對應 component 是 ChapterView（用 router.resolve('/ch1').matched[0].name === 'ch1'）。

#### 驗證條件

- `npm run typecheck` 必須通過（新型別正確、imports 解析）。
- `npm run test:unit` 全綠（既有 138+ 測試 + 本變更新增測試），尤其 ChapterView/ch1 行為斷言全部繼承自原 Ch1View.test.ts。
- `npm run build` 成功，且 dist/assets 含獨立的 ch1 chunk（驗證 code-split 生效）。
- 手動驗證 `/ch1` 渲染與 migration 前視覺、互動行為完全一致。

#### Scope boundary

- **In scope**：型別定義、hl helper 抽出、ch1 data 模組化、generic ChapterView、共用元件搬移、chapters.ts schema 擴充、router 動態生成、測試重組。
- **Out of scope**：新增 ch2 或任何其他章節的 data 模組（這是「未來新增章節」的事，本變更只證明骨架可運作）；URL 形式變更為 `/chapter/:id`；NavBar / HomeView UX 擴充（搜尋分組）；PWA cache 策略；MP3 資源管線；資料 hot reload。

## Risks / Trade-offs

- [Risk] dataLoader 動態 import 第一次切換到 `/ch1` 多一次 network round-trip → Mitigation：Vite 預設會 prefetch on hover（`<link rel="modulepreload">`），且 Service Worker 會快取已下載的 chunk；實測差異約 50–200ms，可接受。
- [Risk] 既有測試 mount `Ch1View` 直接 import 元件、不走 router，搬到 ChapterView 後若 mount 不正確會炸 → Mitigation：ChapterView 接 `id` prop，測試 mount 可直接傳 `{ props: { id: 'ch1' } }`，避免複雜 router setup。
- [Risk] dynamic import path 若打錯字 TypeScript 不抓 → Mitigation：在 chapters.ts 裡用 satisfies operator 約束 dataLoader 回傳型別 `() => Promise<{ default: ChapterData }>`；CI test 1 個 case 真的 invoke 一次 dataLoader 確認解析正確。
- [Risk] 共用元件搬移 break 既有 import paths（其他地方可能 import `src/modules/ch1/components/...`）→ Mitigation：先 grep 所有 import 路徑、批次更新；若漏掉，typecheck 會 fail。
- [Risk] `hl()` helper 提取後 type 簽名與既有 inline 版本不一致 → Mitigation：簽名完全一致（`(text: string, targetId: string) => string`）；單元測試確認 input 對應 output 字串一致。
- [Risk] router auto-registration 與既有 router.test.ts 假設衝突 → Mitigation：先 grep router.test.ts 看現有斷言，再決定要不要保留 chapter-specific test 或統一改為 chapters 驅動。

## Migration Plan

1. 建立型別定義 (`types.ts`)、helper (`highlight.ts`)、空殼 `data/ch1.ts`。
2. 把 Ch1View.vue 內 4 個 const 陣列 + header metadata 搬入 `data/ch1.ts`。
3. 把 4 個共用元件搬到 `src/modules/chapters/components/`。
4. 建立 `ChapterView.vue`，從 chapters config + dataLoader 渲染。
5. 擴充 `chapters.ts`：加 `dataLoader` 欄位、ch1 entry 補上。
6. 改 `router/index.ts`：chapters.map 動態註冊。
7. 重命名測試 `Ch1View.test.ts` → `ChapterView.test.ts`，調整 mount 方式。
8. 新增 `chapterDataModule.test.ts` 確保 data 結構契約。
9. 刪除 `src/modules/ch1/` 整個資料夾。
10. 跑 `npm run typecheck`、`npm run test:unit`、`npm run build`，全綠後手動驗證 `/ch1`。

**Rollback**：每個步驟都可獨立 revert（git revert <commit>）；若 step 9 出問題，git checkout HEAD~1 -- src/modules/ch1/ 即可恢復。

## Open Questions

無。設計細節已在 Implementation Contract 與 spec scenarios 寫明。
