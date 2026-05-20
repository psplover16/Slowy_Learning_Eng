## Why

Slowy_Learning_Eng 已具備 Vue/Vite/PWA 基礎與 Vitest 單元測試，但缺乏自動化驗證與發布流程：每次變更是否能 lint、typecheck、build、e2e、離線部署到 GitHub Pages，仍仰賴人工。本變更引入一套完整的 CI/CD 骨架，讓 pull request、`dev` staging、`main` production 的驗證與發布皆可重跑、可追蹤、可文件化，並建立 GitHub Pages base path 契約以避免子路徑下資產 404 與 PWA scope 錯誤。

## What Changes

- 新增 GitHub Actions CI workflow（`.github/workflows/ci.yml`）：pull request 與非 `gh-pages` push 都會執行 lint、typecheck、unit test、build、Playwright Chromium 安裝、e2e test；e2e 失敗時上傳 `playwright-report/` 與 `test-results/` 作為 diagnostics artifact。
- 新增 GitHub Actions CD workflow（`.github/workflows/cd.yml`）：`dev` 分支發布到 `gh-pages/staging/`；`main` 分支發布到 `gh-pages/` root；其他分支不部署。使用 concurrency group 防止重疊部署，並支援首次部署（remote `gh-pages` 不存在時用 detached worktree 與 `--orphan` 建立）。
- 新增 GitHub Pages base path 契約：production 使用 `/Slowy_Learning_Eng/`，staging 使用 `/Slowy_Learning_Eng/staging/`。Vite static asset base、PWA manifest `start_url`、PWA icon URLs、Service Worker `navigateFallback`、Vue Router history base 全部使用同一個 build-time normalized 值。
- 新增 build-time base path 正規化函式：在 `vite.config.ts` 中提供可單獨測試的純函式，將 `VITE_APP_BASE_PATH` 環境變數轉成「永遠以 `/` 開頭與結尾」的標準形式。
- 新增 guarded publish script（`scripts/publishPages.mjs`）：接收 `--worktree`、`--dist`、`--target` 三參數，安全同步 production root 與 staging 子目錄；保留 `.git`、`.nojekyll`、`CNAME`、`staging` 不被誤刪；複製時跳過 `.gz`/`.br` 預壓縮檔；空 `dist/` 或無效 target 提前失敗；staging 模式偵測並移除帶 `/src/` 的 stale `index.html`。
- 新增 ESLint flat config（`eslint.config.js`）：結合 `@eslint/js` 與 `@typescript-eslint` recommended、`eslint-plugin-vue` flat/recommended，並關掉 5 條跟本專案 mobile-first 元件慣例衝突的 Vue 規則。
- 新增 Playwright 設定（`playwright.config.ts`）：本機跑 `vite dev`、CI 跑 `vite preview`，皆綁定 `127.0.0.1:4173`（port 可由 `PLAYWRIGHT_PORT` 覆寫）；只跑 Chromium；CI 重試 2 次、本機 0 次；e2e 測試放在 `tests/e2e/`。
- 補齊 package scripts：`lint`、`typecheck`、`test:unit`、`build`、`test:e2e`、`test:ci`；`test:ci` 依序串接前 5 個 script，確保本機與 CI 共用同一組驗證入口。
- 新增第一支 Playwright app shell smoke 測試（`tests/e2e/app-shell.smoke.spec.ts`）：直接 deep-link 進入 `/`、`/grammar`、`/ch1` 三個主路由，驗證主要內容渲染且無 `console.error`。
- 新增 CI 單元測試覆蓋 workflow 文字契約、package scripts、publishPages 行為、README 文件、Vite base path normalize。
- 新增 README.md 與 PROJECT_ARCHITECTURE.md：兩份檔案目前在本 repo **不存在**，本變更建立它們；README 含本地驗證指令、CI/CD 觸發條件、Pages 設定、staging/production URL、branch protection 建議，以及一份「first-deploy checklist」一次性操作指南；PROJECT_ARCHITECTURE 記錄新增的 workflow、script、validation infrastructure、e2e 位置與 base path 契約。

## Non-Goals

- 不改任何英語學習功能、文章內容、文法頁、MP3 播放器、PWA 學習進度行為。
- 不引入後端、SSR、資料庫、帳號系統、analytics 或遙測。
- 不在本機流程直接推送 `gh-pages`；實際發布由 GitHub Actions 在 `dev`/`main` push 後執行。
- 不透過 GitHub REST API 自動設定 Pages source 或 branch protection；這些屬於 repository settings，本變更只在 README 提供操作步驟，由維護者在 GitHub UI 完成。
- 不為了配合 ESLint 初次導入做風格性大重構；若 lint 揭露既有錯誤，僅修「會中斷 build 的明確錯誤」，警告級別暫不處理。
- 不新增 `.nvmrc` 或 `package.json` `engines` 欄位；CI 透過 workflow hardcode `node-version: 22`，本機 Node 版本不強制鎖定（風險記於 design.md）。
- 不引入 Lighthouse、axe 等更深入的 QA 工具；本變更聚焦於 build/validate/publish 骨架，視覺與無障礙驗證留給後續變更。
- 不擴充 e2e 涵蓋範圍超出 app shell smoke；MP3 互動、PWA 離線情境、底線單字回跳等留給後續變更。

## Capabilities

### New Capabilities

- `ci-cd-pipeline`: 定義 GitHub Actions 驗證、GitHub Pages staging/production 發布、build-time base path 對齊、發布腳本保護規則、E2E 測試基礎設施、ESLint 設定基線、package script 契約、CI/CD 文件、first-deploy 一次性操作清單。

### Modified Capabilities

(none)

## Impact

- Affected specs: `ci-cd-pipeline`
- Affected code:
  - New:
    - .github/workflows/ci.yml
    - .github/workflows/cd.yml
    - scripts/publishPages.mjs
    - eslint.config.js
    - playwright.config.ts
    - tests/e2e/app-shell.smoke.spec.ts
    - src/__tests__/githubActionsWorkflows.test.ts
    - src/__tests__/packageScripts.test.ts
    - src/__tests__/publishPages.test.ts
    - src/__tests__/readmeCiCdDocs.test.ts
    - src/__tests__/viteBasePath.test.ts
    - README.md
    - PROJECT_ARCHITECTURE.md
  - Modified:
    - package.json
    - package-lock.json
    - vite.config.ts
    - src/app/router/index.ts
