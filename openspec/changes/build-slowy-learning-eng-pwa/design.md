## Context

目前 `_private/ch1-new york travel.html` 是一份完整的靜態 HTML 設計稿，展示了預期的視覺語言（paper 色系、Fraunces / Newsreader / Noto Sans TC 字型、terracotta / sage / ochre / teal 強調色）。這份稿沒有互動功能、無法離線、無路由、無學習進度追蹤。本次設計目標是以該視覺語言為基礎，建立可安裝的行動優先 PWA。

## Goals / Non-Goals

**Goals:**

- 建立可在 iPhone Safari / Android Chrome 上安裝並完全離線運作的 PWA
- 實現首頁（文章列表 + 完成標記）、文法頁（詞性 + like）、Ch1 內容頁（全文 + 詞彙 + 句型解析）三條路由
- 段落書籤：記憶上次閱讀位置，下次進入路由自動捲動
- 底線單字互動：平滑捲動至說明 + 懸浮 FAB 回到原始單字位置
- MP3 播放器：sticky 頂部，mp3Src 為空時不渲染（Ch1 目前無音檔）
- 所有 localStorage 操作有清理機制（key 數量已知且有上限）

**Non-Goals:**

- 不實作 Ch2 以後的內容頁（本次只做 Ch1）
- 不實作 SRS 字卡或測驗功能
- 不做雲端同步 / 後端 API
- 文法頁不收錄 Ch1 句型解析（留在內容頁下方）
- 不做 IndexedDB（本次資料量 < 5 KB，localStorage 足夠）

## Decisions

### 技術棧：Vue3 + Tailwind + Vite，而非維持純 HTML

**選擇**：Vue3（`<script setup lang="ts">`）+ Tailwind CSS + Vite + Vue Router

**理由**：
- 純 HTML 無法複用元件（WordTag、PhraseCard 在 Ch1 出現 60+ 次）
- Tailwind 的 utility class 對應 ch1 設計語言的 CSS variable 可一對一映射
- Vite + vite-plugin-pwa 是最輕量的 PWA 方案，無需手寫 sw.js

**淘汰方案**：維持純 HTML + vanilla JS
- 淘汰原因：WordTag / PhraseCard / SentenceBreakdown 等結構會大量重複，維護困難；無元件化也無法為 Ch2+ 復用

---

### 檔案結構：feature-based modules，而非 type-based

**選擇**：`src/modules/<feature>/`，跨模組共用放 `src/shared/`，骨幹放 `src/app/`

```
src/
  app/
    main.ts
    App.vue
    router/index.ts
  modules/
    home/
      views/HomeView.vue
      components/ArticleListItem.vue
      composables/useCompletion.ts
    grammar/
      views/GrammarView.vue
      components/GrammarCard.vue
    ch1/
      views/Ch1View.vue
      components/SceneBlock.vue
      components/WordTag.vue
      components/PhraseCard.vue
      components/SentenceBreakdown.vue
  shared/
    components/NavBar.vue
    components/Mp3Player.vue
    components/BackToWordFab.vue
    composables/useReadingBookmark.ts
    composables/useUnderlinkBacklink.ts
    config/storageKeys.ts
```

**淘汰方案**：`src/components/`（所有元件混在一起）
- 淘汰原因：違反專案架構慣例，且 WordTag 是 Ch1 專用元件、不適合與 NavBar 同層

---

### 路由模式：History mode（createWebHistory）

**選擇**：Vue Router History mode，路由為 `/`、`/grammar`、`/ch1`

**淘汰方案**：Hash mode（`#home`、`#grammar`）
- 淘汰原因：PWA `manifest.json` 的 `start_url` 與 History mode 搭配更自然；且 vite-plugin-pwa 預設支援 History mode 的離線 fallback

---

### 持久化：localStorage（完成標記 + 書籤）

**選擇**：localStorage，key 集中管理於 `src/shared/config/storageKeys.ts`

**Storage schema**：

```ts
// slowy:completion
interface CompletionMap { [chapterId: string]: boolean }
// 初始值：{}

// slowy:bookmark
interface BookmarkMap { [chapterId: string]: string | null }
// 值為段落元素的 id 字串，null 表示無書籤
// 初始值：{}
```

**清理機制**：key 數量固定（completion 與 bookmark 各一個 JSON 物件），不會無限增長；Ch 數量有限，無需清理策略。

**淘汰方案**：IndexedDB
- 淘汰原因：資料總量 < 5 KB，無查詢需求，同步 API 更簡單；IndexedDB 的非同步 API 在此場景屬過度設計

---

### PWA 快取策略（vite-plugin-pwa）

| 資源類型 | 策略 |
|---|---|
| HTML / CSS / JS / 圖片 | Cache First（離線優先，首次快取後永久可用）|
| MP3 音檔 | Network First + fallback to cache（確保有網路時取最新，離線時播快取）|

**vite-plugin-pwa workbox 設定**：
- `globPatterns: ['**/*.{js,css,html,ico,png,svg,woff2}']`
- MP3 另設 `runtimeCaching` rule：`handler: 'NetworkFirst'`

---

### Tailwind 自訂色彩 token（對應 ch1 CSS variables）

```ts
// tailwind.config.ts extend.colors
{
  paper:    '#F4ECDC',
  'paper-2': '#FBF6EA',
  'paper-3': '#FFFCF4',
  ink:      '#322B22',
  'ink-soft': '#5E5446',
  'ink-faint': '#897C66',
  terracotta: '#BF5635',
  'terracotta-deep': '#9C4226',
  sage:     '#6B7848',
  'sage-deep': '#525C36',
  ochre:    '#C28A2C',
  'ochre-deep': '#9C6E1C',
  'teal-eng': '#3F726E',
  'teal-eng-deep': '#2F5754',
  line:     '#D9C9A8',
  'line-soft': '#E6DAC0',
}
```

（使用 `teal-eng` 避免與 Tailwind 內建 `teal` 衝突）

---

### 底線單字 FAB 回到原位：記錄 scrollY，而非 DOM id

**選擇**：點選底線單字時，將 `window.scrollY`（觸發當下的捲動位置）存入 `useUnderlinkBacklink` composable；FAB 按鈕點擊後 `window.scrollTo({ top: savedY, behavior: 'smooth' })`

**理由**：多個底線單字對應同一說明區塊時，各自的 `scrollY` 不同，以 scrollY 記錄比 DOM id 更精準，且不需要為每個底線單字設置唯一 id

**`useUnderlinkBacklink` 介面**：

```ts
interface UnderlinkBacklink {
  sourceScrollY: Ref<number | null>     // null = FAB 隱藏
  targetId: Ref<string | null>          // 說明區塊的 element id
  triggerScroll(targetId: string): void // 點選底線單字時呼叫
  returnToSource(): void                // FAB 點擊時呼叫
}
```

## Implementation Contract

### 行為合約

**NavBar**：
- 當前路由對應的按鈕呈現 terracotta 底色 + 白字；其他按鈕為 paper 底色 + ink 字
- 高度固定，`position: sticky; top: 0; z-index: 50`

**完成標記（ArticleListItem）**：
- 初始：空心圓圈圖示（outline）
- 點選後：實心圓圈圖示（solid）+ 寫入 `slowy:completion`
- 再次點選：切回空心 + 更新 localStorage
- 刷新頁面後恢復點選前的狀態

**段落書籤（useReadingBookmark）**：
- 點選段落標題（`SceneBlock` 的標題元素）→ 呼叫 `setBookmark(chapterId, paragraphId)`，寫 `slowy:bookmark`
- 路由進入時（`onMounted`）→ 讀 `slowy:bookmark`，若有值則 `scrollIntoView({ behavior: 'smooth' })`
- 同一路由同時只有一個書籤；點新標題覆蓋舊值

**底線單字 FAB（useUnderlinkBacklink + BackToWordFab）**：
- 點選底線單字 → 儲存當下 `window.scrollY`，`scrollIntoView({ behavior: 'smooth' })` 至說明區塊
- FAB 顯示條件：`sourceScrollY !== null`（即有觸發來源）
- FAB 消失條件：點擊 FAB 後 `returnToSource()` 將 scrollY 設回 null
- FAB 位置：`position: fixed; bottom: 1.5rem; right: 1.5rem`

**Mp3Player**：
- prop `mp3Src: string | null`；`mp3Src` 為 null 或空字串時，整個元件 `v-if="mp3Src"` 不渲染
- 功能：播放 / 暫停、+5s、+10s、音量 slider、time range input、loop toggle（預設 ON）
- Ch1 目前 `mp3Src = null`，播放器不顯示

**PWA**：
- `npm run build` 後 dist/ 含 sw.js
- 首次訪問快取所有 glob 資源；再次訪問在離線時仍可載入完整 App

### 驗收條件

- [ ] 手機（iOS Safari / Android Chrome）可安裝 PWA 至主畫面
- [ ] 關閉網路後重開 App，三條路由均可正常顯示
- [ ] 點選段落標題 → 重新整理 → 自動捲動至書籤段落
- [ ] 點選底線單字 → 頁面捲至說明 → FAB 出現 → 點 FAB → 回到底線單字原始位置
- [ ] 完成標記：點選 → 重新整理 → 狀態保留
- [ ] Mp3Player：Ch1 頁面不顯示播放器
- [ ] `npm run build` chunk 均 < 500 KB

### 範圍邊界

- 本次範圍：上述 8 項功能的初始實作
- 不在範圍：測驗 / SRS / 字卡、Ch2+ 內容頁、後端 / API

### RWD 斷點策略：mobile-first + 桌機 max-width 840px

**選擇**：單一主要斷點。375 px 以下為手機版（預設）；768 px+ 時內容區塊加上 `max-w-3xl mx-auto`（≈ 840 px），NavBar 同步置中，不做欄位重排。

**理由**：此 App 的桌機使用者是少數，版型差異只需「加邊距」，不需要 sidebar 或兩欄佈局。參考稿 `ch1-new york travel.html` 已採用 840px max-width 置中策略，維持一致。

**淘汰方案**：依內容種類設計不同桌機版型
- 淘汰原因：過度設計；手機首重，桌機加邊距已足夠。

---

### PWA：完全離線模式（Precache All）

**選擇**：所有資源（HTML / CSS / JS / 字型 / 圖示 / 音檔）一律加入 Workbox **precache manifest**，App 安裝後完全不依賴網路。`navigateFallback: '/index.html'` 確保 History mode 路由離線時可正確解析。

**具體設定**：
- `globPatterns: ['**/*.{js,css,html,ico,png,svg,woff2,mp3}']`（含 mp3）
- `navigateFallback: '/index.html'`
- 不設 runtimeCaching（移除舊版 Network First for MP3）

**驗收強制**：完全離線模式為**關鍵驗收項**，需在飛航模式下完整測試三條路由 + 音檔播放（若有音檔）。

**淘汰方案**：Network First for MP3
- 淘汰原因：與完全離線目標衝突；使用者在地鐵等無網路環境必須能播放。

---

### iOS PWA Safe Area（瀏海 / 靈動島）

**選擇**：
1. `<meta name="viewport">` 加入 `viewport-fit=cover`
2. NavBar 的 top padding 改為 `padding-top: env(safe-area-inset-top)`
3. 使用 `tailwindcss-safe-area` 外掛提供 `pt-safe-top` utility class

**理由**：iPhone 以 standalone PWA 模式開啟時，系統 UI（靈動島 / 狀態列）會覆蓋在 App 頂部；不處理 safe area 導覽列會被遮住，功能性受損。

**淘汰方案**：不處理（導覽列接受被遮住）
- 淘汰原因：使用者明確要求不接受。

---

### SW 更新策略：Toast 3 秒 → 無論點否均自動更新

**選擇**：使用 `vite-plugin-pwa` 的 `useRegisterSW` composable：
1. 偵測到新 Service Worker 待命（waiting）時，顯示「有新版本，點此立即更新」Toast
2. Toast 持續 3 秒後自動關閉
3. 點選 Toast → `wb.messageSkipWaiting()` + `location.reload()`（立即更新）
4. Toast 關閉（未點選，3 秒到期）→ 同樣執行 `wb.messageSkipWaiting()` + `location.reload()`（自動更新）

**實作元件**：`src/shared/components/UpdateToast.vue`

**理由**：使用者無論如何都會在 3 秒內獲得最新版；Toast 只是給 3 秒視覺提示，不是讓使用者「選擇要不要更新」。

---

### PWA Icons：佔位圖規格

**選擇**：提供三個尺寸的佔位圖：

| 檔案 | 尺寸 | 用途 |
|---|---|---|
| `public/icons/icon-192.png` | 192×192 | Android manifest 必要 |
| `public/icons/icon-512.png` | 512×512 | Android 啟動畫面 |
| `public/icons/apple-touch-icon.png` | 180×180 | iOS 加入主畫面 |

`manifest.json` 的 `icons` 陣列引用上述三個；`<link rel="apple-touch-icon">` 引用 180×180。

---

## Risks / Trade-offs

- [Risk] Tailwind custom tokens 與 ch1 CSS variables 顏色對應有誤 → Mitigation：建置前人工逐色比對；Ch1 頁面截圖對照
- [Risk] iOS Safari PWA 的 Service Worker 支援版本較舊，cache 行為略有差異 → Mitigation：使用 vite-plugin-pwa 預設策略，已針對 Safari 做相容處理
- [Risk] Ch1 詞彙量大（60+ 個 WordTag），首次渲染可能略慢 → Mitigation：Vue 虛擬 DOM 效率佳，預計不需分頁；若 chunk > 500 KB 再考慮 lazy import
- [Risk] 底線單字的說明區塊 id 若打錯會導致捲動無反應 → Mitigation：WordTag / PhraseCard 的 anchor id 統一命名規則 `vocab-{slug}`；spec 明確約束
