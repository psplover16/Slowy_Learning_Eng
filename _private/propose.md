# Proposal — Slowy Learning Eng：行動優先英語學習 PWA

> 此檔由 `/spectra-discuss` 產出。輸入：`_private/discuss.txt`。
> **狀態：定稿** — Q1–Q5 已全部確認，可執行 `/spectra-apply`。

---

## 決議紀錄（Q&A 彙整）

| Q | 問題 | 決議 |
|---|---|---|
| Q1 | 舊 propose.md 是否保留 | 覆蓋無所謂，不保留 |
| Q2 | 技術棧 | **Vue3 + Tailwind**；`ch1-new york travel.html` 僅作設計/排版參考，不是實作技術棧 |
| Q3 | 文法頁範圍 | **B**：文法頁只放通用文法（英語詞性介紹 + like 的用法）；其餘詞彙/句型說明放在各**內容頁下方** |
| Q4 | MP3 來源 | Ch1 目前**無音檔**；播放器元件須條件渲染（有 mp3Src prop 才顯示），未來有音檔時傳入即可 |
| Q5 | 底線單字互動 | 平滑捲動至下方說明 + 右下角懸浮「回到單字」按鈕；按鈕記錄**被點選的那個底線單字**的位置（非說明區塊），避免多個底線字對應同一說明時回錯位置 |

---

## 一、專案定位

以 `_private/ch1-new york travel.html` 的**視覺設計語言**為參考，使用 **Vue3 + Tailwind CSS** 打造一個行動優先、可離線使用的英語學習 PWA，供使用者閱讀文章、學習文法、追蹤學習進度。

---

## 二、整體架構（3 個路由）

```
┌────────────────────────────────────┐
│          導覽列（頂部固定）          │
│  [首頁]          [文法]            │
└────────────────────────────────────┘
         │                 │
    ┌────┴────┐       ┌────┴────┐
    │  首頁   │       │  文法   │
    │  列表   │       │ 通用文法 │
    └────┬────┘       └─────────┘
         │ 點選列表
    ┌────┴────┐
    │  內容頁  │  （多頁，Ch1、Ch2…）
    │  文章   │
    └─────────┘
```

**技術選型**：

| 項目 | 選型 |
|---|---|
| 框架 | Vue 3（Composition API + `<script setup>`）|
| 樣式 | Tailwind CSS + 自訂 CSS variables（沿用 ch1 色系）|
| 路由 | Vue Router 4（History 或 Hash mode）|
| 建置 | Vite |
| PWA | vite-plugin-pwa（含 Service Worker）|
| 狀態 / 持久化 | localStorage（completion + bookmark）|

---

## 三、路由詳細規格

### 3.1 首頁（`/`）

| 元素 | 規格 |
|---|---|
| 頂部導覽列 | 固定頂部；兩個按鈕：首頁、文法；高亮當前路由 |
| 內容列表 | 每列 = 一篇文章（標題 + 副標題）|
| 完成標記 icon | 每列末端；預設空心；點選 → 填實心並寫入 localStorage |
| 下次開啟 | 恢復上次的完成狀態 |

**Storage key**：`slowy:completion` → `{ "ch1": true, "ch2": false, … }`

---

### 3.2 文法頁（`/grammar`）

範圍：**通用文法** —— 英語常見詞性介紹 + like 的全用法。  
內容頁相關的詞彙/句型說明**不放此處**，留在各內容頁下方。

每個文法容器的規格：

- **詞性 / 類別** badge
- **用途說明**（中文）
- **用法公式**（Newsreader 字型，底色 teal）
- **例句**（英文 + 中文翻譯，斜體）
- **常見用法表格**（如有多種用法）
- **注意事項 / 易混淆**（如有）

**初始內容**：

| # | 主題 |
|---|---|
| G01 | **英語常見詞性介紹** — n. / v. / adj. / adv. / prep. / conj. / pron. 各自的用途與識別方式 |
| G02 | **like 的全用法** — 動詞（喜歡）/ 介系詞（像）/ 連接詞（feel like + 子句）|

---

### 3.3 內容頁（`/ch1`、`/ch2`…）

#### MP3 播放器（Sticky 頂部）

```
┌─────────────────────────────────────────────┐
│ ◀━━━━━━━━━━━━━━━━━━━━━━━━▶  00:00 / 00:00  │ sticky top
│ ⏮5s  ⏸/▶  ⏭10s  🔊──●──  🔁 Loop        │
└─────────────────────────────────────────────┘
```

| 功能 | 規格 |
|---|---|
| 播放 / 暫停 | 切換圖示 |
| 前進 5 秒 | 按鈕 |
| 前進 10 秒 | 按鈕 |
| 音量調整 | slider |
| 拖拉時間軸 | range input |
| 重複播放 | loop toggle，預設 ON |
| 離線播放 | Service Worker 快取 MP3 |
| **無 MP3 時** | 整個播放器元件不渲染（prop `mp3Src` 為空時隱藏）|

> Ch1 目前無音檔，播放器預設隱藏；未來提供音檔路徑即可啟用。

---

#### 段落書籤（閱讀位置記憶）

- 每個段落標題可點選
- 點選 → 寫入 localStorage 作為「上次讀到」書籤
- 同一路由只能有一個書籤
- 下次進入同一路由 → 自動平滑捲動到書籤位置

**Storage key**：`slowy:bookmark` → `{ "ch1": "scene-04", … }`

---

#### 底線單字互動（Q5 規格）

```
使用者點選文章中底線單字
        │
        ▼
平滑捲動至該單字對應的「詳細說明區塊」
        │
        ▼
右下角出現懸浮「↑ 回到單字」按鈕
（按鈕內部記錄：被點選單字的 DOM id 或 scrollY 位置）
        │
        ▼
點擊按鈕 → 平滑捲動回到「當初點選的那個底線單字」
（非說明區塊，確保多個底線字 → 同一說明時，回到正確位置）
        │
        ▼
懸浮按鈕消失
```

**注意**：多個底線單字可能對應同一個說明區塊，因此懸浮按鈕必須記錄**觸發來源的單字位置**，而非說明區塊的位置。

---

#### 單字標記格式（行動裝置優先）

英語、KK音標、中文**各佔一行**，不並排：

```
英語單字 / 片語
[KK ˈfəʊnɛtɪks]   ← 字體較小
中文翻譯或註釋
```

- 文章行內有額外說明的單字/片語：加**底線**
- 底線單字的詳細說明放在**本段落下方的詞彙/句型補充區**

---

#### 詞彙補充區（段落下方）

| 類型 | 呈現元件 |
|---|---|
| 簡單單字 | word-tag（英語 / KK / 詞性 / 中文）|
| 複雜片語 / 慣用語 | phrase card（左 ochre 色條，含用法 + 例句）|
| 句型解析 | sentence breakdown card（含中譯 + 逐段拆解）|

---

## 四、Ch1 內容清單（全部必須收錄）

> 使用者確認：discuss.txt 中所有英語用法皆為不熟悉項目，**一個都不能省略**。

### 4.1 詞彙補充（KK 音標 + 詞性 + 意思）

| 英語 | 補充項目 |
|---|---|
| from the moment | 片語說明 + 用法 |
| chill | adj./v. KK + 意思 |
| intense | adj. KK + 意思 |
| since the night before | 片語 |
| deluxe | adj. KK + 意思 |
| tater tots | n. KK + 意思 |
| burrito | n. KK + 意思 |
| plenty of time | 片語 |
| layover | n. KK + 意思 |
| right away | 片語 |
| unnecessarily | adv. KK + 意思 |
| cone | n. KK + 意思 |
| graduation | n. KK + 意思 |
| huge | adj. KK + 意思 |
| went all out | 片語 |
| candy table | n. 意思 |
| nachos | n. KK + 意思 |
| Jenga | n. 意思 |
| tic tac toe | n. 意思 |
| mushroom | n. KK + 意思 |
| hydro | n. 意思（語境：水力發電）|
| got to see | 片語（get to + V = 有機會做）|
| landscapes | n. KK + 意思 |
| fields and fields of | 片語 |
| vegetation | n. KK + 意思 |
| windmills | n. KK + 意思 |
| screen door | n. 意思 |
| rhubarb | n. KK + 意思 |
| a little while | 片語 |
| renew | v. KK + 意思 |
| license | n. KK + 意思 |
| all the way | 片語 |
| weird | adj. KK + 意思 |
| definitely | adv. KK + 意思 |
| mowed | v. KK + 意思（mow 過去式）|
| lawn | n. KK + 意思 |
| underneath | prep. KK + 意思 |
| hogs | n. KK + 意思（豬）|
| head back | 片語 |
| winding around | 片語 |
| even more impressive | 比較級強調 |
| hostel | n. KK + 意思 |
| filmed | v. 意思 |
| passed out | 片語（昏倒 / 沉沉睡去）|
| construction sites | n. 意思 |
| sprinkling | v./n. KK + 意思（毛毛雨）|
| kebab | n. KK + 意思 |
| decent | adj. KK + 意思 |
| scammed / scamming | v. KK + 意思 |
| tourist | n. KK + 意思 |
| obsessed | adj. KK + 意思 |
| specifically | adv. KK + 意思 |
| doughy | adj. KK + 意思 |
| biased | adj. KK + 意思 |
| opinion | n. KK + 意思 |
| smoothies | n. KK + 意思 |
| ginger | n. KK + 意思 |
| shots（ginger shots）| n. 意思（一口量飲品）|
| salted | adj. 意思 |
| pretzel | n. KK + 意思 |
| avocado | n. KK + 意思 |
| souvenirs | n. KK + 意思 |
| mug | n. KK + 意思（馬克杯）|
| leftover | n./adj. 意思（名詞：剩菜；形容詞：剩餘的）|
| to board | v. 意思（登機 / 登船 / 上車）|

### 4.2 句型 / 用法解析（放在各段落下方）

| 原句 / 主題 | 解析項目 |
|---|---|
| `that's where my aunt picked us up` | that's where 強調句型；pick up 結構 |
| `imagine walking somewhere` | imagine + V-ing；somewhere 在此的意思 |
| `for the next few days` | for 表示「在接下來的…時間」 |
| `hung out with them` | hang out 完整用法（搭配 with / at / in）|
| `used to + V` | 過去曾經…（現已不）用法 |
| `it brought back so many nostalgic feelings` | bring back + 抽象名詞；nostalgic / nostalgia |
| `There's nothing like that nostalgic feeling of being in...` | 三層拆解：There's nothing like / feeling of / being in |
| `What brings those feelings for you?` | those 作指示代名詞；brings 在情感語境的意思 |
| `cut through the middle` / `going through the tree` | cut through / go through 穿越 / 貫穿 |
| `instead of chopping down` | instead of + V-ing；chopping down 意思 |
| `cut around so the cable could go through` | so 表示「這樣一來」；句子拆解 |
| `to have had such a beautiful childhood` | 不定詞完成式 to have had：使用時機、如何用、舉例 |
| `grateful for having as a kid` | 關係代名詞省略規則；grateful for + V-ing；as a kid |
| `for + 時間長度` | 列舉常見用法：for a while / for an hour / for days… |
| `all torn apart everywhere` | all 加強語氣；torn apart；副詞片語 everywhere |
| `The first thing we did was head to bed` | 關係代名詞受詞省略 + be 動詞後接原形 |
| `I don't know if I was scammed` | if 作「是否 / whether」用法；與假設用法的差異 |
| `getting you to pay attention... so that behind you they can take your wallets` | 分詞片語介紹（種類 / 意義 / 現在 vs 過去分詞）；使役動詞 make / have / get / let；so that 表目的；語序強調說明 |
| `be aware of` vs `be aware` | 有具體對象時接 of；單獨使用表保持警覺 |
| `ever`（疑問句 / 最高級後 / 否定句）| 三種語境的強調用法 |
| `I have been obsessed` | 現在完成式：have/has + 過去分詞；語意說明 |
| `I've been dreaming of this moment for so long` | 現在完成進行式：have been + V-ing；與完成式差異 |
| `get` 各種用法 | 取得 / 變成 / 使某人 / 到達 / 搭（交通）逐一列舉 |
| `it felt like I was in a movie eating a salted pretzel` | feel like + 子句；eating 作現在分詞修飾 I |
| `the best pizza that I have ever had` | 現在完成式 + ever 強調 |
| `while boarding` | while + V-ing 用法 |
| `prefer to + V` | 比較喜歡；與 prefer V-ing 的差異 |
| `put on` | 穿上 / 放到身上 / 開啟（電器 / 節目）|
| `just as beautiful as the landing` | just as + 形容詞 + as 結構 |

---

## 五、技術方案

### 5.1 專案結構（Vue3 + Vite + Tailwind）

```
Slowy_Learning_Eng/
├── public/
│   ├── manifest.json         ← PWA manifest
│   └── audio/                ← 未來 MP3 音檔放置處
├── src/
│   ├── main.ts
│   ├── App.vue               ← 殼層（NavBar + <RouterView>）
│   ├── router/
│   │   └── index.ts          ← Vue Router（/ , /grammar, /ch1…）
│   ├── views/
│   │   ├── HomeView.vue      ← 首頁列表
│   │   ├── GrammarView.vue   ← 文法頁（詞性 + like）
│   │   └── Ch1View.vue       ← Ch1 內容頁
│   ├── components/
│   │   ├── NavBar.vue        ← 頂部固定導覽
│   │   ├── Mp3Player.vue     ← 播放器（mp3Src 為空則不渲染）
│   │   ├── WordTag.vue       ← 單字標記（KK / 詞性 / 中文）
│   │   ├── PhraseCard.vue    ← 片語卡片
│   │   ├── SentenceBreakdown.vue ← 句型拆解卡片
│   │   └── BackToWordFab.vue ← 右下角懸浮「回到單字」按鈕
│   └── composables/
│       ├── useCompletion.ts  ← 完成標記讀寫
│       └── useBookmark.ts    ← 段落書籤讀寫
├── tailwind.config.ts
├── vite.config.ts            ← 含 vite-plugin-pwa
└── package.json
```

### 5.2 Storage Schema

```json
// localStorage key: "slowy:completion"
{ "ch1": true, "ch2": false }

// localStorage key: "slowy:bookmark"
{ "ch1": "scene-04", "ch2": null }
```

### 5.3 PWA / Service Worker（vite-plugin-pwa）

- 快取策略：Cache First（HTML / CSS / JS）
- MP3：Network First with fallback to cache
- `manifest.json`：`display: "standalone"`, `theme_color: "#F4ECDC"`

---

## 六、設計規範（參考 ch1 設計語言）

| 色彩 token | 對應 Tailwind 自訂色 | 用途 |
|---|---|---|
| `--paper` `#F4ECDC` | `paper` | 主背景 |
| `--paper-2` `#FBF6EA` | `paper-2` | 次背景 |
| `--paper-3` `#FFFCF4` | `paper-3` | 卡片背景 |
| `--terracotta` `#BF5635` | `terracotta` | 強調色（數字、標題）|
| `--sage` `#6B7848` | `sage` | 詞彙分組標題 |
| `--ochre` `#C28A2C` | `ochre` | 片語卡片左邊條 |
| `--teal` `#3F726E` | `teal-eng` | 文法公式底色 |
| `--ink` `#322B22` | `ink` | 主文字 |

**字型**（Google Fonts）：Fraunces（標題）/ Newsreader（英文內文）/ Noto Sans TC（中文）

**行動優先斷行**：英語與中文之間使用 `block` 顯示，不並排。

---

## 七、影響範圍（全新建立）

| 檔案 / 目錄 | 說明 |
|---|---|
| `src/App.vue` | 殼層 + NavBar + RouterView |
| `src/router/index.ts` | 路由設定 |
| `src/views/HomeView.vue` | 首頁列表 + 完成標記 |
| `src/views/GrammarView.vue` | 文法頁（詞性 + like）|
| `src/views/Ch1View.vue` | Ch1 完整內容（詞彙 + 句型解析）|
| `src/components/NavBar.vue` | 頂部固定導覽列 |
| `src/components/Mp3Player.vue` | 播放器，mp3Src 空則隱藏 |
| `src/components/WordTag.vue` | 單字標記 |
| `src/components/PhraseCard.vue` | 片語卡片 |
| `src/components/SentenceBreakdown.vue` | 句型拆解卡片 |
| `src/components/BackToWordFab.vue` | 懸浮「回到單字」按鈕 |
| `src/composables/useCompletion.ts` | 完成標記邏輯 |
| `src/composables/useBookmark.ts` | 段落書籤邏輯 |
| `tailwind.config.ts` | 自訂色彩 token |
| `vite.config.ts` | 含 vite-plugin-pwa |
| `public/manifest.json` | PWA manifest |

---

## 八、下一步

執行 `/spectra-propose` 正式立案，產出 `openspec/changes/<name>/`，建議 change name：

```
build-slowy-learning-eng-pwa
```

實作建議順序：

1. 建立 Vite + Vue3 + Tailwind 專案骨架
2. `NavBar.vue` + Router（3 個路由）
3. `HomeView.vue`（列表 + 完成標記）
4. `Mp3Player.vue`（播放器，Ch1 暫無音檔）
5. `Ch1View.vue`（文章 + 詞彙 + 書籤 + 底線單字互動）
6. `BackToWordFab.vue`
7. `GrammarView.vue`（詞性 + like）
8. PWA（manifest + Service Worker）
