# Slowy_Learning_Eng

行動優先（mobile-first）的英語學習 PWA。本文件聚焦於開發環境驗證、CI / CD 流程、GitHub Pages 部署設定，以及首次部署所需的一次性操作。

## 技術概覽

- Vue 3（Composition API、`<script setup lang="ts">`）+ TypeScript strict
- Vite 6 + `vite-plugin-pwa`（Workbox）
- Vue Router 4（`createWebHistory(import.meta.env.BASE_URL)`）
- Tailwind CSS（mobile-first）
- Vitest 單元測試、Playwright E2E（Chromium）
- ESLint flat config（`eslint.config.js`）

## 本機驗證

所有本機驗證指令皆為 `package.json` script，本機與 CI 使用相同入口。

| 指令 | 內容 |
| ---- | ---- |
| `npm run lint` | 執行 ESLint，掃描 `.ts` 與 `.vue` 檔案。 |
| `npm run typecheck` | 執行 `vue-tsc --noEmit -p tsconfig.app.json` 做型別檢查。 |
| `npm run test:unit` | 執行 Vitest（run 模式）所有單元測試。 |
| `npm run build` | 先 typecheck 再 `vite build` 產生 `dist/`。 |
| `npm run test:e2e` | 執行 Playwright e2e（Chromium）；本機自動啟動 `vite dev`，CI 啟動 `vite preview`。 |
| `npm run test:ci` | 依序串接 `lint && typecheck && test:unit && build && test:e2e`，任何一步失敗即停。 |

開發用：
- `npm run dev` 啟動 Vite dev server
- `npm run preview` 預覽 production build

## CI 流程

`/.github/workflows/ci.yml`（workflow 名稱：`CI`）。

- **觸發條件**：
  - `pull_request`（target 任何分支）
  - `push`（`branches-ignore: [gh-pages]`，避免 CD 推送 `gh-pages` 反覆觸發 CI）
- **執行步驟**（順序，遇錯即停）：
  1. `actions/checkout@v4`
  2. `actions/setup-node@v4` Node.js 22 + `cache: npm`
  3. `npm ci`
  4. `npm run lint`
  5. `npm run typecheck`
  6. `npm run test:unit`
  7. `npm run build`
  8. `npx playwright install chromium`
  9. `npm run test:e2e`
- **權限**：`permissions.contents: read`（不可寫入 repository）
- **失敗 diagnostics**：e2e 失敗時，`actions/upload-artifact@v4` 上傳 `playwright-report/` 與 `test-results/`，artifact 名稱 `playwright-diagnostics`，`if-no-files-found: ignore`。

## CD 流程

`/.github/workflows/cd.yml`（workflow 名稱：`CD`）。

- **觸發條件**：`push` 至 `dev` 或 `main` 分支。
- **權限**：`permissions.contents: write`（CD 需要 push `gh-pages`）。
- **Concurrency**：group `${{ github.workflow }}-${{ github.ref }}`，`cancel-in-progress: true`，防止同 ref 重疊部署。
- **分支對部署 target 對應**：

| Source branch | PUBLISH_TARGET | VITE_APP_BASE_PATH | 發布位置 |
| ------------- | -------------- | ------------------ | -------- |
| `dev` | `staging` | `/Slowy_Learning_Eng/staging/` | `gh-pages/staging/` |
| `main` | `production` | `/Slowy_Learning_Eng/` | `gh-pages/` 根目錄 |

- **執行步驟**（順序）：
  1. `actions/checkout@v4`（`fetch-depth: 0`，需要完整歷史才能建 worktree）
  2. `actions/setup-node@v4` Node.js 22 + `cache: npm`
  3. `npm ci`
  4. 依分支設定 `PUBLISH_TARGET`、`VITE_APP_BASE_PATH`、`VITE_APP_START_URL` 至 `$GITHUB_ENV`
  5. `npm run build`（環境變數注入 Vite）
  6. 設定 git author
  7. 建立或 fetch `gh-pages` worktree 於 `.deploy-pages/`：
     - 若 remote `gh-pages` 存在 → `git fetch origin gh-pages:gh-pages` + `git worktree add .deploy-pages gh-pages`
     - 若 remote `gh-pages` 不存在 → `git worktree add --detach .deploy-pages` + `checkout --orphan gh-pages` + 清空
  8. `node scripts/publishPages.mjs --worktree .deploy-pages --dist dist --target "$PUBLISH_TARGET"`
  9. `git add -A`；若 `git diff --cached --quiet` 則 `exit 0`（避免空 commit），否則 commit `deploy: publish ${PUBLISH_TARGET}` 並 `git push origin gh-pages`

## 部署 URL

| Target | 公開 URL |
| ------ | -------- |
| production | `https://<owner>.github.io/Slowy_Learning_Eng/` |
| staging | `https://<owner>.github.io/Slowy_Learning_Eng/staging/` |

`<owner>` 為 GitHub 帳號名稱。

## GitHub Pages 設定

在 GitHub repository 的 `Settings → Pages`：

- **Source**：選擇 `Deploy from a branch`
- **Branch**：`gh-pages`
- **Folder**：`/` (root)
- 儲存後等首次 CD 跑完，前端即可服務。

## Branch protection 建議

在 `Settings → Branches → Branch protection rules`，建議為 `main` 與 `dev` 各加一條規則：

- Require a pull request before merging
- Require status checks to pass before merging → 勾選 `CI` workflow
- 不需要 review 數量（個人專案）

如此可避免直接 push 到 `main` / `dev` 而觸發未經驗證的部署。

## 首次部署 First-deploy Checklist

CD workflow 第一次運轉前，請依序完成下列 6 個步驟（皆為一次性、需要在 GitHub UI 或本機 git 操作）：

1. 從目前 default 分支建立 `dev` 分支並 push 到 remote：
   ```
   git checkout -b dev
   git push -u origin dev
   ```
2. 從目前 default 分支建立 `main` 分支並 push 到 remote：
   ```
   git checkout -b main
   git push -u origin main
   ```
3. 進入 GitHub repository 的 `Settings → Pages`，將 Source 設為 `Deploy from a branch`、Branch 選 `gh-pages`、Folder 選 `/` (root)，按 Save。
4. 等 `main` 的第一次 CD 跑完後，於瀏覽器或 `curl -I` 確認 `https://<owner>.github.io/Slowy_Learning_Eng/` 回應 HTTP 200。
5. 等 `dev` 的第一次 CD 跑完後，於瀏覽器或 `curl -I` 確認 `https://<owner>.github.io/Slowy_Learning_Eng/staging/` 回應 HTTP 200。
6. 在 `Settings → Branches` 為 `main` 與 `dev` 各加一條 branch protection rule，要求 `CI` workflow 通過後才能 merge。

完成後，後續開發只要走 PR → merge 即可自動觸發 CI 驗證與 CD 發布。

## 專案結構

詳見 [`PROJECT_ARCHITECTURE.md`](./PROJECT_ARCHITECTURE.md)。
