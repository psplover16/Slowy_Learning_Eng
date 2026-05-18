# Proposal（定稿）— 文法子路由新增「閱讀位置書籤」功能

> 此檔由 `/spectra-discuss` 產出。輸入：`_private/discuss.txt`（共 5 項需求）。
> **狀態：定稿** — 7 條假設全部收斂，使用者回覆已整合至下方「結論」區塊。可直接以 `/spectra-propose` 立案。

---

## 原始輸入（`_private/discuss.txt`）

1. 在容器的標題左側，設立書籤的 icon，大小、padding、觸發範圍與 checkbox 一致的書籤功能按鈕。
2. 一個 N5 文法只能有一個實心書籤，其餘都是空心書籤。
3. 預設全部都是空心書籤，空心書籤表示沒看過，實心書籤表示看過。
4. 因為未來可能會做 N4 文法，所以要先設立好，N5 一個書籤、N4 一個書籤，以此類推，此部分要有紀錄功能，也就是關掉網頁或 APP 之後，下次打開要記得上次是點選哪個書籤開啟。
5. 此部分要用 IndexedDB 做。

---

## Codebase 偵察結果（assumptions mode 依據）

已讀過的相關來源檔（前幾輪對話 + 本輪）：

| 檔案 | 用途 |
|---|---|
| `src/modules/n5Grammar/views/N5GrammarView.vue` | N5 文法主頁，分「未完成 / 已完成」兩區渲染 |
| `src/modules/n5Grammar/components/N5GrammarSectionCard.vue` | 每個容器卡片，標題列有 checkbox + 可展開按鈕 |
| `src/modules/n5Grammar/storage/n5GrammarCompletionStorage.ts` | 現有「已學完」狀態的 localStorage 封裝 |
| `src/shared/utils/storageGuard.ts` | localStorage 通用工具（`readJsonStorage` / `writeJsonStorage`） |
| `src/shared/config/storageKeys.ts` | storage key 集中管理 |
| `src/modules/vocabulary/storage/vocabularyMarksDb.ts` | 專案唯一 IndexedDB 實例（單字練習用） |
| `src/modules/vocabulary/storage/vocabularyMarksMigration.ts` | localStorage → IndexedDB 遷移範例 |
| `package.json` / `vite.config.ts` | 確認已裝 `unplugin-icons` + `@iconify-json/fa6-solid` |

**Spectra 狀態**：`spectra list` 無進行中變更。
**LANGUAGE.md**：不存在，跳過語彙載入。
**介面深度檢查**：觸發（新增儲存抽象 + 新 IPC 形狀）。

---

## 7 條假設

### 假設 1：書籤的語意是「閱讀位置標記」，不是另一種「已讀」

**做法**：書籤表示「目前/上次讀到這個段落」，全等級僅一個實心；checkbox 維持原意「永久標記為已學完」。兩者職責正交、可獨立切換。

**證據**：
- `discuss.txt` 第 2 行「只能有一個實心書籤」與「已讀」(可多筆) 的語意衝突
- 第 4 行「下次打開要記得上次是點選哪個書籤開啟」明確指向 reading position

**如果錯**：若實際上是「另一種已讀標記」，會跟現有 checkbox 重複，且「只能一個」的限制不合理 — 需要重新設計成多選或併入 checkbox。

**用語建議**：`discuss.txt` 用「沒看過 / 看過」描述書籤狀態，但這跟「只能一個實心」相矛盾。建議在 propose 中改用「**未標記 / 上次讀到**」這組精確用語，避免和 checkbox 的「未讀 / 已讀」混淆。

**❓ 需要使用者確認**：是不是這個意思？

**我的傾向**：✅ 是「閱讀位置標記」(reading position bookmark)，與 checkbox 職責正交。

---

### 假設 2：採用 IndexedDB（尊重指示，但記錄為有意識選擇）

**做法**：照 `discuss.txt` 第 5 行指示用 IndexedDB，仿 `vocabularyMarksDb.ts` 寫一個 thin wrapper。

**證據**：
- 使用者明確指定（第 5 行）
- 專案已有 IndexedDB 先例（`src/modules/vocabulary/storage/vocabularyMarksDb.ts`）

**技術權衡備註**：本資料規模（最多 5 筆 × ~50 bytes ≈ < 1 KB）落在 localStorage 的舒適區。前幾輪對話的技術比較：

| 維度 | localStorage | IndexedDB | 本案需要 |
|---|---|---|---|
| 容量 | ~5 MB | 數百 MB+ | < 1 KB ❌ 用不到 |
| API | 同步 | 非同步（Promise） | 同步較簡單 ✅ |
| 查詢 | 只有 key | 索引、cursor | 無查詢需求 ❌ 用不到 |
| 結構 | 字串 | 物件、Blob 等 | 單一物件 ❌ 用不到 |
| 一致性 | 同模組已用 | — | 已用 localStorage ✅ |

**如果錯**：如果是被指示「應該用」而不是「想要用」IndexedDB，那以技術考量 localStorage 才合適 — 開發成本更低、API 同步寫起來更簡單、跟模組現有 storage 一致。

**❓ 需要使用者確認**：
- (A) 保留 IndexedDB（建議：在 `design.md` 註明「有意識的學習實踐 / 統一儲存層」選擇）
- (B) 改用 localStorage（建議理由：YAGNI、與現有 completion storage 一致）

**我的傾向**：技術上 ⭐ localStorage 更合適；若使用者堅持 IndexedDB 我會尊重並仿 vocabulary 模式實作。

---

### 假設 3：書籤位置在 checkbox 與標題之間，視覺/觸發區與 checkbox 一致

**做法**：HTML 結構新增書籤按鈕，順序變成 `[checkbox] [bookmark] [title]`；尺寸、padding、hit-area 比照現有 `n5-grammar-section-completion-hit-area`。

**證據**：
- `discuss.txt` 第 1 行「容器標題**左側**」+「大小、padding、觸發範圍與 checkbox 一致」
- 現有 `N5GrammarSectionCard.vue:62-89` 結構是 `<label>[checkbox]</label><button>[title]</button>`
- 書籤插在中間最自然，仍位於 title 的左側

**如果錯**：若「左側」指的是整個 header 列的最左邊（也就是要在 checkbox 之前），順序變成 `[bookmark] [checkbox] [title]` — 也可以，但會把書籤推到視覺最起點，反而搶過已讀勾選的優先級。

**❓ 需要使用者確認**：
- (A) `[checkbox] [bookmark] [title]` — 書籤在 title 左、checkbox 右（我的傾向）
- (B) `[bookmark] [checkbox] [title]` — 書籤在最左

**我的傾向**：⭐ (A)，視覺優先級「已讀 > 書籤 > 內容」較合理。

---

### 假設 4：跨等級（N5/N4/...）用單一 IndexedDB store + level 當 keyPath

**做法**：

```
DB: grammarBookmarks  (version: 1)
└─ Store: bookmarks (keyPath: 'level')
   ├─ { level: 'n5', sectionId: 'particles-wa',    updatedAt: '2026-05-11T...' }
   ├─ { level: 'n4', sectionId: '...',             updatedAt: '...' }
   └─ ...
```

- 每個等級最多一筆
- 切換書籤 = `put({ level, sectionId, updatedAt })`
- 取消書籤 = `delete(level)`
- 「同等級只能一個實心」由 keyPath 自然強制（同 level 寫入會覆蓋）

**證據**：`discuss.txt` 第 4 行明確要求 N5/N4 各一個書籤、且要「先設立好」結構。

**如果錯**：
- 若每個等級獨立一個 store（n5Bookmarks、n4Bookmarks）→ 冗餘、多次寫 migration、新增等級要動 DB version
- 若用 `${level}-${sectionId}` 當複合 key → 「只能一個」需在 app 層額外處理，較囉嗦

**❓ 預設採納**（除非使用者反對）

**我的傾向**：✅ 採用此設計。

---

### 假設 5：互動細節

**做法**：
1. 點空心書籤 → 變實心；同等級的舊書籤自動變回空心（資料層覆蓋即可）
2. 點實心書籤 → 變回空心（從 store 刪除該等級記錄）
3. 被書籤的 section 若被勾為「已學完」→ 自動清掉書籤（reading position 對已完成段落無意義）
4. 已學完區（finished zone）裡的 section 不顯示書籤按鈕

**證據**：
- 前幾輪討論中 #3 約定（被勾已讀清書籤）
- 單一書籤原則來自 `discuss.txt` 第 2 行
- 隱藏 finished 區的書籤是減少視覺雜訊

**如果錯**：
- 若希望已學完的 section 也能標書籤（複習用）→ 拿掉自動清除邏輯，書籤可獨立於 completion 存在
- 若希望點實心無法取消（必須切到另一個才會消失）→ 移除 #2

**❓ 需要使用者確認**：
- 行為 #1（單一書籤、自動切換）：✅ 預設採納
- 行為 #2（點實心可取消）：保留 / 移除？
- 行為 #3（勾已讀清書籤）：保留 / 移除？
- 行為 #4（已完成區隱藏書籤）：保留 / 移除？

**我的傾向**：⭐ 全部保留（語意最一致、UI 最乾淨）。

---

### 假設 6：實作範圍只做 N5，但 schema 預留 N4+

**做法**：
- 本次只在 `N5GrammarView.vue` / `N5GrammarSectionCard.vue` 加 UI
- IndexedDB schema 與 wrapper 直接設計成可接 N4/N3/N2/N1
- 不寫 N4 的 UI（N4 文法資料目前不存在）
- 未來 N4 模組做時，import 同一個 wrapper 傳 `level: 'n4'`

**證據**：
- `discuss.txt` 第 4 行「要先設立好」=結構先做好，不是 UI 都做出來
- YAGNI 原則 — 沒做 N4 UI 之前先寫 N4 邏輯是浪費

**❓ 預設採納**（除非使用者反對）

**我的傾向**：✅ 採用此設計。

---

### 假設 7：Seam 設計（介面深度檢查回答）

| 深度檢查問題 | 回答 |
|---|---|
| **Seam 位置** | `src/modules/grammar/storage/grammarBookmarkStorage.ts`（共用層，非 N5 專屬） |
| **Adapter 數量** | 1 個（thin wrapper over native IndexedDB，仿 `vocabularyMarksDb.ts`） |
| **深度** | 封裝 DB open / version migration / 失敗降級 (`console.warn` 一次) / 型別保護 — 不只是轉發 |
| **刪除測試** | 刪掉 → 全等級書籤功能無法持久化，重整即遺失 — **有實質意義，非 pass-through** ✅ |

**對外 API（草稿）**：

```ts
// src/modules/grammar/storage/grammarBookmarkStorage.ts
export type JlptLevel = 'n5' | 'n4' | 'n3' | 'n2' | 'n1';

export interface GrammarBookmarkRecord {
  level: JlptLevel;
  sectionId: string;
  updatedAt: string;  // ISO timestamp
}

export async function readGrammarBookmark(level: JlptLevel): Promise<GrammarBookmarkRecord | null>;
export async function writeGrammarBookmark(level: JlptLevel, sectionId: string): Promise<boolean>;
export async function clearGrammarBookmark(level: JlptLevel): Promise<void>;
```

**注意**：放在 `src/modules/grammar/`（新增共用層）而不是 `src/modules/n5Grammar/`，是為了配合假設 #4 的跨等級設計。

**❓ 需要使用者確認**：
- (A) `src/modules/grammar/storage/`（新增共用層；我的傾向）
- (B) `src/modules/n5Grammar/storage/`（暫放 N5 內，未來再搬）— schema 已經跨等級會語意彆扭

**我的傾向**：⭐ (A) 共用層。

---

## Icon 套件確認（前期討論結論）

- 已裝 `unplugin-icons` + `@iconify-json/fa6-solid`，按需匯入、不會打整包進 bundle。
- 實心書籤：`import IconBookmarkSolid from '~icons/fa6-solid/bookmark';`
- 空心書籤需另裝：`npm install -D @iconify-json/fa6-regular`，然後 `import IconBookmarkOutline from '~icons/fa6-regular/bookmark';`
- Vite 設定（`vite.config.ts:93`）已註冊 `Icons({ compiler: 'vue3' })`，新增 icon 不用改設定。

---

## 待使用者回答的問題（彙整 — 對應全部 7 條假設）

> 上一版只列了 5 題（漏掉預設採納的假設 4、6，且把假設 5 的 4 個子行為壓成 1 題）。本表展開為完整 7 條對應，並把假設 5 拆出子問題。

### 主表

| # | 對應假設 | 問題 | 選項 | 我的傾向 |
|---|---|---|---|---|
| Q1 | 假設 1 | 書籤 = 閱讀位置？（非「已讀」） | (A) 是 / (B) 否（其實是另一種已讀） | ⭐ (A) |
| Q2 | 假設 2 | 儲存技術 | (A) IndexedDB（照原始指示）/ (B) localStorage（技術建議） | ⭐ (B) — 但若你想實踐 IndexedDB 我尊重 |
| Q3 | 假設 3 | 書籤位置 | (A) `[chk][bm][title]` / (B) `[bm][chk][title]` | ⭐ (A) |
| Q4 | 假設 4 | 跨等級 schema | (A) 單一 store + level keyPath（預設）/ (B) 每等級獨立 store | ⭐ (A) — **預設採納**，除非反對 |
| Q5 | 假設 5 | 互動細節 4 個子行為 | 見下方子表 | 見下方子表 |
| Q6 | 假設 6 | 實作範圍 | (A) 只做 N5、schema 預留 N4+（預設）/ (B) 連 N4 placeholder 一起做 | ⭐ (A) — **預設採納**，除非反對；(B) 需要 N4 文法資料（目前不存在） |
| Q7 | 假設 7 | Seam 位置 | (A) `modules/grammar/` 共用層 / (B) `modules/n5Grammar/` 內 | ⭐ (A) |

### Q5 子表（互動細節）

| 子 # | 行為 | 選項 | 我的傾向 |
|---|---|---|---|
| Q5-1 | 切換書籤：點空心 → 變實心、同等級舊書籤自動變回空心 | (A) 採用（單一書籤原則）/ (B) 允許多個實心 | ⭐ (A) — 由 IndexedDB keyPath 自然強制；(B) 違反 `discuss.txt` 第 2 行 |
| Q5-2 | 點實心書籤是否可取消（刪除該等級記錄） | (A) 可取消 / (B) 不可取消，必須點另一個才會切走 | ⭐ (A) — 對稱、可預測 |
| Q5-3 | 被標書籤的 section 被勾為「已學完」時 | (A) 自動清書籤 / (B) 書籤保留（與 completion 獨立） | ⭐ (A) — reading position 對已完成段落無意義 |
| Q5-4 | 已完成（finished）區裡的 section 是否顯示書籤按鈕 | (A) 不顯示 / (B) 顯示，方便複習標記 | ⭐ (A) — 減少視覺雜訊；與 Q5-3 一致 |

### 摘要

- **必須回答（決定走向）**：Q1、Q2、Q3、Q7 — 4 條
- **預設採納，可反對**：Q4、Q6 — 2 條
- **互動細節**：Q5-1（基本不會反對）、Q5-2、Q5-3、Q5-4 — 4 條子問題

若你只想最快通過，回 **Q2 與 Q5-2/Q5-3/Q5-4 是否同意我的傾向** 即可，其餘照⭐走。

---

---

## 結論（已定稿）

### 決議總表

| Q | 決議 | 備註 |
|---|---|---|
| Q1 | 書籤語意 = **閱讀位置標記**（reading position bookmark） | 與 checkbox「已學完」職責正交 |
| Q2 | **改用 localStorage**（不採用 `discuss.txt` 第 5 行的 IndexedDB） | 覆蓋原始指示；理由：< 1 KB 資料、無查詢需求、與現有 `n5GrammarCompletionStorage` 一致 |
| Q3 | **`[bookmark] [title] [checkbox]`**：書籤新增於左側、title 維持置中、checkbox 維持原位（右側） | 現有 CSS 用絕對定位：`.completion-hit-area` 已 `position: absolute; right: -0.375rem`、`.toggle` 滿寬置中。**新增書籤只需鏡像 checkbox 的 pattern 放到 left 側**，不動既有元素 |
| Q4 | 跨等級採單一 storage + `byLevel` map（因 Q2 改 localStorage 連帶調整） | 單 key、整包 JSON 讀寫 |
| Q5-1 | 單一書籤、自動切換（覆蓋同等級舊書籤） | |
| Q5-2 | 點實心可取消（從 storage 刪除該等級記錄） | |
| Q5-3 | 被標書籤的 section 被勾為已學完 → 自動清書籤 | |
| Q5-4 | 已完成（finished）區裡的 section 不顯示書籤按鈕 | |
| Q6 | 只做 N5 UI；storage schema 預留 N4/N3/N2/N1 | YAGNI |
| Q7 | Seam 位置 = `src/modules/grammar/storage/`（新增共用層） | 不放 N5 內 |

### 最終設計（已套用 Q2/Q4 改動）

#### Storage 層

**新增 key**：

```ts
// src/shared/config/storageKeys.ts
export const grammarBookmarkStorageKey = 'spectra:grammar:bookmark';
```

**新增 wrapper**：

```ts
// src/modules/grammar/storage/grammarBookmarkStorage.ts
import { grammarBookmarkStorageKey } from '@/shared/config/storageKeys';
import { readJsonStorage, removeStorage, writeJsonStorage } from '@/shared/utils/storageGuard';

export type JlptLevel = 'n5' | 'n4' | 'n3' | 'n2' | 'n1';

interface BookmarkEntry {
  sectionId: string;
  updatedAt: string;  // ISO timestamp
}

interface GrammarBookmarkSnapshot {
  version: 1;
  byLevel: Partial<Record<JlptLevel, BookmarkEntry>>;
}

export function readGrammarBookmark(level: JlptLevel): BookmarkEntry | null;
export function writeGrammarBookmark(level: JlptLevel, sectionId: string): boolean;
export function clearGrammarBookmark(level: JlptLevel): void;
```

**儲存樣態示例**：

```json
{
  "version": 1,
  "byLevel": {
    "n5": { "sectionId": "particles-wa", "updatedAt": "2026-05-11T..." }
  }
}
```

#### UI 層改動（`N5GrammarSectionCard.vue`）

**現況視覺**（CSS 絕對定位實作，非 source order）：

```
┌──────────────────────────────────────────────────────────┐
│                     title (置中)                  [chk]  │
└──────────────────────────────────────────────────────────┘
```

- `.n5-grammar-section-heading` 是 `position: relative`（定位脈絡）
- `.n5-grammar-section-completion-hit-area` 是 `position: absolute; right: -0.375rem`（checkbox 在右側）
- `.n5-grammar-section-toggle` 是 `w-full justify-center`（title 滿寬置中）

**目標視覺**：

```
┌──────────────────────────────────────────────────────────┐
│  [bm]               title (置中)                  [chk]  │
└──────────────────────────────────────────────────────────┘
```

**改動內容**（**checkbox 與 title 完全不動**，只新增書籤按鈕）：

- 新增 `<button class="n5-grammar-section-bookmark-hit-area">`，鏡像現有 completion 的絕對定位 pattern，但定位 `left: -0.375rem`
- 尺寸、padding、hit-area（h-11 w-11）比照 `.n5-grammar-section-completion-hit-area`
- 書籤 icon：空心 `~icons/fa6-regular/bookmark`（需 `npm i -D @iconify-json/fa6-regular`）/ 實心 `~icons/fa6-solid/bookmark`
- 在 finished 區（`N5GrammarView.vue` 下半區）的 SectionCard 不渲染書籤按鈕（Q5-4）— 透過新增 prop `showBookmark`（預設 `true`）控制
- 新增 prop `bookmarked: boolean`、新增 emit `update:bookmarked`

#### View 層改動（`N5GrammarView.vue`）

新增書籤狀態管理：
- `onMounted` / `onActivated` 時讀 `readGrammarBookmark('n5')`
- 點書籤 → `writeGrammarBookmark('n5', sectionId)` 或 `clearGrammarBookmark('n5')`
- `updateSectionCompleted(sectionId, true)` 時若該 sectionId === 書籤位置 → 自動清書籤（Q5-3）

#### Icon 套件

新增 dev 依賴：

```bash
npm install -D @iconify-json/fa6-regular
```

### 影響範圍

| 檔案 | 改動 |
|---|---|
| `src/shared/config/storageKeys.ts` | 新增 `grammarBookmarkStorageKey` |
| `src/modules/grammar/storage/grammarBookmarkStorage.ts` | **新檔** — storage wrapper |
| `src/modules/n5Grammar/components/N5GrammarSectionCard.vue` | 新增書籤按鈕（絕對定位 left 側）、props（`bookmarked`、`showBookmark`）、emit `update:bookmarked` — checkbox 與 title 不動 |
| `src/modules/n5Grammar/views/N5GrammarView.vue` | 書籤狀態讀寫、勾已讀自動清書籤、unfinished 區傳 `showBookmark=true`、finished 區傳 `showBookmark=false` |
| `src/styles/main.css` | 新增 `.n5-grammar-section-bookmark-hit-area`（鏡像 completion-hit-area，改 `left` 而非 `right`） |
| `tests/unit/` | 新增 `grammarBookmarkStorage.spec.ts` |
| `tests/e2e/n5-grammar-layout.spec.ts` | 新增書籤按鈕的存在 / 視覺位置（左側）斷言 — 既有 checkbox / title 斷言不動 |
| `package.json` | 新增 `@iconify-json/fa6-regular` |

### 介面深度檢查（已套用 Q2 改動後重新評估）

| 問題 | 回答 |
|---|---|
| **Seam 位置** | `src/modules/grammar/storage/grammarBookmarkStorage.ts` |
| **Adapter 數量** | 1 個（thin wrapper over `storageGuard`） |
| **深度** | 封裝 byLevel partial map 操作（讀/寫/刪單一 level 而不影響其他 level）+ 型別保護 — 雖然底層用同步 localStorage，但抽象層仍有實質責任，非 pass-through |
| **刪除測試** | 刪掉 → 所有等級書籤無法持久化、無單一進入點 → SectionCard 必須直接碰 storage key 與 JSON schema，違反邊界 — **有實質意義** ✅ |

---

## 使用者原始回覆（已整合至上方結論，保留作為來源紀錄）

```
Q1: 是「閱讀位置標記」
Q2: localStorage才對
Q3: 顯示上， [bookmark] [title] [checkbox] — 書籤在最左，標題置中，checkbox為最右
Q4: 採納你的設計
Q5: 全部保留
Q6: 採納你的設計
Q7: A
```

---

## 下一步

執行 `/spectra-propose` 立案，產生：

- `openspec/changes/<name>/proposal.md`
- `openspec/changes/<name>/design.md`（含 Q2 從 IndexedDB 改為 localStorage 的有意識記錄、Q3 重新排版的理由、互動規則表）
- `openspec/changes/<name>/tasks.md`
- `openspec/specs/grammar-bookmark/spec.md`（新 capability）

建議的 change name：`add-grammar-reading-position-bookmark`