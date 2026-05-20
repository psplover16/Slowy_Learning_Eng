# Project Architecture

## 應用程式結構（`src/`）

```
src/
  app/
    main.ts                 — App 進入點（createApp、mount）
    App.vue                 — 根 shell（NavBar + RouterView）
    router/
      index.ts              — Vue Router（`/`、`/grammar`、`/ch1`），使用 `createWebHistory(import.meta.env.BASE_URL)`
  modules/
    home/
      views/HomeView.vue           — 文章列表（含完讀標記）
      components/ArticleListItem.vue — 單篇文章卡片
      composables/useCompletion.ts  — localStorage 完讀切換
    grammar/
      views/GrammarView.vue        — 文法頁
      components/GrammarCard.vue   — 單篇文法卡
    ch1/
      views/Ch1View.vue            — Ch1 全文頁
      components/SceneBlock.vue    — 場景容器
      components/WordTag.vue       — 單字（KK、詞性、中文）
      components/PhraseCard.vue    — 片語卡
      components/SentenceBreakdown.vue — 句構解析卡
  shared/
    components/NavBar.vue          — 黏頂導覽
    components/Mp3Player.vue       — 條件式 MP3 播放器
    components/BackToWordFab.vue   — 回到單字 FAB
    components/UpdateToast.vue     — SW 更新提示
    composables/useReadingBookmark.ts — 段落書籤（localStorage）
    composables/useUnderlinkBacklink.ts — 底線單字 ↔ FAB 狀態
    config/storageKeys.ts          — 集中 localStorage key 常數
```

## 設計原則

- **Feature-based modules**：每個 feature 自帶 views、components、composables
- **Shared**：跨 feature 共用的元件與 composables
- **App**：進入點、router、根 shell
- 元件命名沿用 Vue 3 `<script setup lang="ts">` 風格

## CI / CD / 驗證基礎設施（本 change 新增）

| 路徑 | 用途 |
| ---- | ---- |
| `.github/workflows/ci.yml` | CI workflow：PR 與非 `gh-pages` push 觸發；lint → typecheck → test:unit → build → install chromium → test:e2e；e2e 失敗時上傳 `playwright-diagnostics`。 |
| `.github/workflows/cd.yml` | CD workflow：`dev` push → `gh-pages/staging/`；`main` push → `gh-pages/` 根目錄；使用 concurrency group 防止重疊部署。 |
| `scripts/publishPages.mjs` | 純 Node 22 ESM 發布腳本：將 `dist/` 同步進 `gh-pages` worktree，保留 `.git`、`.nojekyll`、`CNAME`、`staging`，跳過 `.gz` / `.br`，結束寫 `.nojekyll`，empty dist / unknown target 提前 throw。 |
| `eslint.config.js` | ESLint flat config：`@eslint/js` recommended + `@typescript-eslint` recommended + `eslint-plugin-vue` flat/recommended，關掉 5 條 Vue 規則（multi-word component names、self-closing、max-attributes-per-line、singleline-html-element-content-newline、attributes-order）。 |
| `playwright.config.ts` | Playwright 設定：`testDir: ./tests/e2e`、`127.0.0.1:4173`（port 可由 `PLAYWRIGHT_PORT` 覆寫）、本機 `npm run dev`、CI `npm run preview`、只跑 Chromium、retries CI 2 / 本機 0、`reuseExistingServer: !CI`。 |
| `tests/e2e/app-shell.smoke.spec.ts` | App shell smoke：deep-link `/`、`/grammar`、`/ch1`，斷言 NavBar 與主內容渲染，且整個測試累計 `console.error` 為 0。 |
| `src/__tests__/packageScripts.test.ts` | 驗證 `package.json` 提供 6 個 script 且 `test:ci` 依序串接前 5 個。 |
| `src/__tests__/viteBasePath.test.ts` | 驗證 `normalizeBasePath` 函式對應 spec input/output 表所有 cases。 |
| `src/__tests__/githubActionsWorkflows.test.ts` | 驗證 `.github/workflows/ci.yml` 與 `cd.yml` 的文字契約（name、trigger、權限、step 順序、env mapping、concurrency 等）。 |
| `src/__tests__/publishPages.test.ts` | 驗證 publishPages 各 scenario（production 保留清單、staging 子目錄、stale index.html、空 dist throw、unknown target throw、skip `.gz`/`.br`、`.nojekyll` 寫入）。 |
| `src/__tests__/readmeCiCdDocs.test.ts` | 驗證 `README.md` 與 `PROJECT_ARCHITECTURE.md` 含必要章節、URL pattern、first-deploy checklist。 |

## Base path → Deployment target → 公開 URL

`vite.config.ts` 匯出純函式 `normalizeBasePath(value)`，於 build 時把 `VITE_APP_BASE_PATH` 轉成標準形式（永遠以 `/` 開頭與結尾），結果同時供應給：

- Vite `base`
- PWA manifest `start_url`、`scope`、icon `src`
- Workbox `navigateFallback`
- Vue Router `createWebHistory(import.meta.env.BASE_URL)`（由 Vite 注入）

| Deployment target | Source branch | `VITE_APP_BASE_PATH` | 公開 URL |
| ----------------- | ------------- | -------------------- | -------- |
| production | `main` | `/Slowy_Learning_Eng/` | `https://<owner>.github.io/Slowy_Learning_Eng/` |
| staging | `dev` | `/Slowy_Learning_Eng/staging/` | `https://<owner>.github.io/Slowy_Learning_Eng/staging/` |
| local dev | any | （預設）`/` | `http://localhost:5173/` |

CD 在 build 前用 bash 判斷分支，把 `VITE_APP_BASE_PATH` 與 `VITE_APP_START_URL` 寫入 `$GITHUB_ENV`，再呼叫 `npm run build`，確保 build artifact 一致。

## Publish 保護規則

`scripts/publishPages.mjs` 於 `gh-pages` worktree 根目錄永遠保留：

- `.git`
- `.nojekyll`
- `CNAME`（防禦性保留，未來啟用自訂網域時不被覆蓋）
- `staging`

| Target | 對 `gh-pages` 根目錄 | 對 `gh-pages/staging/` |
| ------ | ------------------- | ---------------------- |
| `production` | 清掉非保留檔，再複製 `dist/` 內容（跳過 `.gz`/`.br`） | 不動 |
| `staging` | 不動（除了 stale `index.html` 含 `/src/` 字串會被刪） | 清空再複製 `dist/` 內容（跳過 `.gz`/`.br`） |

任何 target 結束時，根目錄都會寫入空的 `.nojekyll`。

`dist/` 不存在 / 為空、或 target 不是 `production` / `staging`，腳本會 throw 並 exit 非 0，不修改 worktree。
