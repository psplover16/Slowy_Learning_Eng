## Context

Slowy_Learning_Eng 是純前端 Vue 3 + Vite + PWA 專案，目前已有 Vitest 單元測試與 `vite build`，但沒有 GitHub Actions、lint、Playwright e2e、GitHub Pages base path 對齊機制，也沒有發布 `gh-pages` 的保護腳本。專案部署目標是 GitHub Pages，並會同時維護 production（`main` → `/Slowy_Learning_Eng/`）與 staging（`dev` → `/Slowy_Learning_Eng/staging/`）兩個環境。

本變更不修改任何學習功能，但會新增驗證／部署基礎設施與兩份說明文件。專案憲法要求 `PROJECT_ARCHITECTURE.md` 在 `src/` 結構或部署結構變動時同步更新，本變更同時建立這份檔案（目前 repo 尚無此檔）。

## Goals / Non-Goals

**Goals:**

- 建立可重跑的 CI workflow，覆蓋 lint、typecheck、unit、build 與 e2e，並於 e2e 失敗時保留 Playwright 報告。
- 建立 CD workflow，將 `dev` 發布到 `gh-pages/staging/`，`main` 發布到 `gh-pages/` root，使用 concurrency group 防止重疊部署。
- 建立 build-time base path 單一來源：Vite assets、PWA manifest `start_url`、PWA icon URLs、Service Worker `navigateFallback`、Vue Router history base 共用同一個 normalized 值。
- 以 guarded publish script 保護 `gh-pages` root 與 `staging/` 子目錄，避免空 `dist/`、空 commit、與既有檔案的誤刪。
- 補齊 ESLint、Playwright 設定與 package script contract，使本機與 CI 共用同一組驗證入口。
- 建立 README.md 與 PROJECT_ARCHITECTURE.md，記錄本地驗證指令、CI/CD 觸發條件、Pages 設定、first-deploy 一次性操作清單、部署架構與檔案地圖。

**Non-Goals:**

- 不修改英語學習功能、文章內容、localStorage 結構、Service Worker 更新體驗或 UI 排版。
- 不引入後端、SSR、資料庫、帳號系統、analytics。
- 不在本機直接推送 `gh-pages`；發布僅透過 GitHub Actions 完成。
- 不透過 API 設定 Pages source、custom domain 或 branch protection；這些屬於 repository settings，僅在 README 提供操作步驟。
- 不引入 Lighthouse、axe-core 等更深入的 QA 工具。
- 不擴大 e2e 覆蓋範圍超出 app shell smoke。

## Decisions

### Split CI and CD workflows by responsibility

CI 與 CD 分為兩個 workflow。CI（`.github/workflows/ci.yml`）處理 `pull_request` 與所有非 `gh-pages` push；CD（`.github/workflows/cd.yml`）只處理 `dev`/`main` push。這讓 PR 驗證與正式發布權限分離（CI permissions `contents: read`、CD `contents: write`），也避免 CD 推送 `gh-pages` 反覆觸發 CI。

**替代方案**：使用單一 workflow 依分支條件 if 切換。檔案較少，但 permissions、concurrency 與發布條件混在一起，後續調整時更容易誤觸 production deploy。淘汰。

### Use a single normalized base path for every deployment-aware consumer

CD 在 build 前以環境變數設定 deployment target 與 base path：production 使用 `/Slowy_Learning_Eng/`，staging 使用 `/Slowy_Learning_Eng/staging/`。`vite.config.ts` 透過一個純函式 `normalizeBasePath()` 把 `VITE_APP_BASE_PATH` 轉成標準形式（永遠以 `/` 開頭與結尾），這個 normalized 值被 Vite `base`、PWA manifest `start_url`、PWA icon URLs、Service Worker `navigateFallback`、Vue Router `createWebHistory(import.meta.env.BASE_URL)` 全部共用。

**正規化規則**：
- `undefined` / `null` / 空字串 / 只有空白 / `"/"` → `"/"`
- 其他輸入 → trim、缺前斜線補 `/`、缺尾斜線補 `/`
- 多斜線（如 `"//foo//"`）不主動 collapse，視為呼叫端錯誤、原樣通過

**替代方案**：在 workflow、Vite config、manifest 與 router 各自硬編路徑。初期直覺，但 staging 與 production 很容易出現其中一處漏改，造成 asset 404、direct route 失敗或 PWA scope 錯誤。淘汰。

### Publish with a gh-pages worktree and guarded sync script

CD checkout full history 後建立或使用 `gh-pages` worktree（路徑固定 `.deploy-pages`），再呼叫 `scripts/publishPages.mjs` 同步 `dist/`。首次部署（remote 無 `gh-pages` branch）時用 `git worktree add --detach` 加 `git checkout --orphan gh-pages` 並清空 worktree（保留 `.git`）來初始化。

**Script 保護規則**：
- 在 worktree root 永遠保留：`.git`、`.nojekyll`、`CNAME`、`staging`
- `production` target：清空 root（保留清單除外），再把 `dist/` 內容複製到 root
- `staging` target：清空 `<worktree>/staging/`，再把 `dist/` 內容複製到該子目錄；root 既有檔案僅在不在保留清單時才移除
- 任何 target：複製時跳過 `.gz`、`.br` 預壓縮檔（GH Pages 自己處理壓縮）
- 任何 target：publish 結束後在 root 寫入空的 `.nojekyll`，確保以 `_` 開頭的檔案能被服務
- `staging` target：若 worktree root 的 `index.html` 包含 `/src/` 字串（dev 模式檔案誤上傳），先刪除
- `dist/` 不存在或為空：throw error、exit code 非 0、不修改 worktree
- target 不是 `production`/`staging`：throw error、不修改 worktree
- 無 staged diff：CD 步驟 exit 0，不建立空 commit

**CNAME 為防禦性保留**：本專案目前無自訂網域，但保留規則允許未來加入 CNAME 後不被 production 部署覆蓋。

**替代方案**：使用現成 GitHub Pages action 直接發布整個 `dist`。簡單，但較難同時維護 production root 與 `staging/` 子目錄，也較難保證 production 清理時保留 staging。淘汰。

### Keep package scripts as the single CI contract

package scripts 是本機與 CI 的共同契約：`lint`、`typecheck`、`test:unit`、`build`、`test:e2e`、`test:ci`。`test:ci` 順序固定為 `lint && typecheck && test:unit && build && test:e2e`，遇錯即停。CI workflow 不直接散落工具內部命令，而是呼叫這些 script，讓本機重現 CI 更簡單。

**替代方案**：只在 workflow 寫完整命令。少改 `package.json`，但本機重現 CI 變得麻煩，且工具替換時要同時改 workflow 與文件。淘汰。

### Playwright config switches between dev server and preview server by CI flag

`playwright.config.ts` 根據 `process.env.CI` 切換 `webServer.command`：CI 時用 `npm run preview`（驗證 build 後的 dist），本機時用 `npm run dev`（提供 HMR 與快速回饋）。兩者皆綁定 `127.0.0.1:4173`，並設 `reuseExistingServer: !process.env.CI`，讓開發者已開的 dev server 不被重複啟動。Port 可由 `PLAYWRIGHT_PORT` 環境變數覆寫，方便平行測試。

**替代方案 A**：CI 與本機都用 `vite preview`。可以驗證 build 一致性，但本機每次跑 e2e 都要先 `npm run build`，反覆耗時。淘汰。

**替代方案 B**：CI 與本機都用 `vite dev`。本機快但 CI 沒驗證 build 輸出，無法及早抓到 base path 在 production build 才出現的問題（dev server `base` 處理跟 production 不同）。淘汰。

### Add ESLint and Playwright as validation-only dependencies

引入 ESLint（flat config）與 Playwright 為 `devDependencies`，不進入 production bundle。ESLint 結合三組規則集：

- `@eslint/js` recommended
- `@typescript-eslint/eslint-plugin` recommended（套用 `.ts`/`.tsx`，並關掉 `no-undef`，因為 TS 自己會抓）
- `eslint-plugin-vue` flat/recommended（套用 `.vue`）

並關掉以下 5 條 Vue 規則，因為與本專案 mobile-first 元件慣例衝突：
- `vue/multi-word-component-names`（`App.vue` 是單字檔名）
- `vue/html-self-closing`（手機優先 markup 不強制自閉合）
- `vue/max-attributes-per-line`
- `vue/singleline-html-element-content-newline`
- `vue/attributes-order`

ignore：`dist/**`、`build/**`、`coverage/**`、`node_modules/**`。Node globals 套用在 `scripts/**/*.mjs`。

E2E 首支 smoke 測試（`tests/e2e/app-shell.smoke.spec.ts`）deep-link 進入 `/`、`/grammar`、`/ch1`，驗證主內容渲染且 `console.error` 為零次。

**替代方案**：先把 lint/e2e script 設成 placeholder（echo "TODO"）。能快速通過 workflow 結構檢查，但 CI contract 名義存在、實際驗證不足。淘汰。

### Document repository operations and architecture impact

README.md 記錄：本地驗證指令對照表、CI 觸發條件、CD 觸發條件、`dev → staging` 與 `main → production` 映射、production / staging URL 範式、Pages source 設定、branch protection 建議，以及一份 6 條的 first-deploy checklist（建分支、設 Pages source、驗證 URL、設 branch protection）。PROJECT_ARCHITECTURE.md 記錄新增的 workflow、publish script、validation scripts、e2e 測試位置，以及 base path → target → 公開 URL 的對應關係。

**替代方案**：只依賴 workflow 自我說明。少寫文件，但 Pages source 與 branch protection 是 repository settings 而非檔案，缺文件會增加部署失敗與誤 merge 風險。淘汰。

## Implementation Contract

**CI behavior**
- Trigger：`pull_request`（targets any branch）與 `push`（`branches-ignore: [gh-pages]`）
- Runner：`ubuntu-latest`、Node.js 22、`actions/setup-node@v4` with `cache: npm`
- Permissions：`contents: read`
- Step order：checkout → setup-node → `npm ci` → `npm run lint` → `npm run typecheck` → `npm run test:unit` → `npm run build` → `npx playwright install chromium` → `npm run test:e2e`
- E2E 失敗時：`actions/upload-artifact@v4` 上傳 `playwright-report/`、`test-results/` 為 `playwright-diagnostics` artifact，`if-no-files-found: ignore`

**CD behavior**
- Trigger：`push` to `dev` 或 `main`
- Permissions：`contents: write`
- Concurrency：`group: ${{ github.workflow }}-${{ github.ref }}`、`cancel-in-progress: true`
- 分支判斷邏輯（bash）：`if [[ "$GITHUB_REF_NAME" == "main" ]]; then PUBLISH_TARGET=production; VITE_APP_BASE_PATH=/Slowy_Learning_Eng/; else PUBLISH_TARGET=staging; VITE_APP_BASE_PATH=/Slowy_Learning_Eng/staging/; fi`，並 `echo` 進 `$GITHUB_ENV`
- Build：`npm run build`（將 env vars 注入 Vite）
- Worktree 準備：若 remote `gh-pages` 存在 → `git fetch origin gh-pages:gh-pages && git worktree add .deploy-pages gh-pages`；若不存在 → `git worktree add --detach .deploy-pages && git -C .deploy-pages checkout --orphan gh-pages && find .deploy-pages -mindepth 1 -maxdepth 1 ! -name .git -exec rm -rf {} +`
- 同步：`node scripts/publishPages.mjs --worktree .deploy-pages --dist dist --target "$PUBLISH_TARGET"`
- Commit / push：`git -C .deploy-pages add -A`；若 `git diff --cached --quiet` 為真則 `exit 0`；否則 commit 訊息為 `deploy: publish ${PUBLISH_TARGET}` 並 `git push origin gh-pages`

**Vite base path normalization**
- 函式名稱：`normalizeBasePath`，定義於 `vite.config.ts`，以 named export 對外暴露給 unit test
- Signature：`(value: string | undefined | null): string`
- 行為：見 spec.md 的 input/output 表格
- 呼叫時機：`defineConfig(({ mode }) => { const env = loadEnv(mode, process.cwd(), ''); const appBasePath = normalizeBasePath(env.VITE_APP_BASE_PATH); ... })`，每次 build 只呼叫一次

**Publish script interface**
- 路徑：`scripts/publishPages.mjs`（ESM、Node 22 內建 fs/promises、無第三方依賴）
- CLI：`--worktree <path> --dist <path> --target <production|staging>`
- Named exports 用於單元測試：`syncPublishedSite({ worktreeRoot, distPath, target })`、`formatPublishSummary(result)`、`formatNoPublishChangesMessage(target)`
- Result shape：`{ target, targetPath, removedRootEntries[], removedTargetEntries[], copiedEntries[] }`
- 失敗條件：empty `dist`、unknown target → throw + non-zero exit

**Playwright config interface**
- 路徑：`playwright.config.ts`
- testDir：`./tests/e2e`
- baseURL：`http://127.0.0.1:${PLAYWRIGHT_PORT ?? 4173}`
- webServer.command：`process.env.CI ? 'npm run preview -- --host 127.0.0.1 --port <port>' : 'npm run dev -- --host 127.0.0.1 --port <port>'`
- reuseExistingServer：`!process.env.CI`
- timeout：120 秒
- retries：CI 2 次、本機 0 次
- projects：只有 Chromium（`devices['Desktop Chrome']`）
- reporter：`[['html', { open: 'never' }]]`

**ESLint config interface**
- 路徑：`eslint.config.js`（ESM flat config）
- 結構：array of config objects
- 必含項：見上方 "Add ESLint and Playwright as validation-only dependencies" 決策段

**Package scripts**
- `package.json` 必須有：
  - `"lint": "eslint . --ext .ts,.vue"`
  - `"typecheck": "vue-tsc --noEmit -p tsconfig.app.json"`（若無 `tsconfig.app.json` 則建立或退回 `tsconfig.json`）
  - `"test:unit": "vitest run"`
  - `"build": "vue-tsc --noEmit -p tsconfig.app.json && vite build"`
  - `"test:e2e": "playwright test"`
  - `"test:ci": "npm run lint && npm run typecheck && npm run test:unit && npm run build && npm run test:e2e"`

**驗證條件**
- 5 支新單元測試覆蓋：workflow 文字契約（CI/CD 名稱、trigger、Node 22、step 順序、permissions、concurrency、env mapping）、package scripts contract、publishPages 各 scenario、README 文件章節存在性、Vite base path normalize（含 spec 表格所有 cases）
- 1 支 Playwright smoke 確認 `/`、`/grammar`、`/ch1` deep-link 渲染無 console error
- `npm run test:ci` 在本機完整通過後才算實作完成

**Scope boundary**
- 本變更只處理 validation 與 publish infrastructure，不修改：學習資料、UI 文案、進度儲存 schema、Service Worker 快取策略（除了 `navigateFallback` 與 base path 對齊外）、runtime analytics、router routes 的存在性（只調整 `createWebHistory` 的 base 來源）
- 若實作時發現既有 PWA cache 策略不支援 base path：僅做 base path 對齊，不重新設計離線策略
- ESLint 揭露既有錯誤：僅修「會中斷 build 的 error」，warning 不處理

## Risks / Trade-offs

- [Risk] GitHub Pages source 未在 GitHub Settings → Pages 設為 `gh-pages`，CD 成功推送後仍無法對外服務。→ Mitigation：README 的 first-deploy checklist 列為步驟 3，並要求步驟 4/5 用 HTTP 200 確認。
- [Risk] production 發布清理 root 時誤刪 staging。→ Mitigation：publishPages script 對 production root 使用 `ROOT_ENTRIES_ALWAYS_PRESERVED = Set(['.git', '.nojekyll', 'CNAME', 'staging'])`，並以單元測試覆蓋「production 後 staging 仍存在」。
- [Risk] base path 漏接到 router、manifest 或 SW `navigateFallback`。→ Mitigation：新增 Vite base path unit test 涵蓋 spec 表格所有 cases；新增 e2e direct route smoke；`createWebHistory(import.meta.env.BASE_URL)` 由 Vite 注入。
- [Risk] Playwright Chromium 安裝增加 CI 時間（約 30 秒-1 分）。→ Mitigation：只 install Chromium 而非全部瀏覽器；smoke 範圍最小（3 個 deep-link）；後續若需要可加 Playwright cache。
- [Risk] ESLint 初次導入揭露既有 lint error 中斷 build。→ Mitigation：5 條 Vue 規則先關掉；若仍有錯誤，在同一變更內修正「明確 error」，warning 不處理；必要時把規則臨時降為 `'warn'` 並在 README 標註待清理。
- [Risk] Node 22 在 CI 與本機 18/20 行為差異。→ Mitigation：README 註明「建議本機使用 Node 22」；未來若導入 `.nvmrc` 為另一變更。
- [Risk] PWA Service Worker 在 staging（`/Slowy_Learning_Eng/staging/`）與 production（`/Slowy_Learning_Eng/`）scope 重疊，瀏覽器可能保留舊 SW。→ Mitigation：兩個 base path 雖有共同前綴但 staging 多一層子目錄，SW scope 由 base 決定不會直接覆寫；README 提醒首次測試 staging 時若有奇怪行為可手動清 cache。
- [Risk] 首次 CD 部署時 worktree 初始化失敗（例如 git 版本太舊不支援 `--orphan` worktree）。→ Mitigation：runner 使用 `ubuntu-latest` + actions/checkout@v4，內建 git 版本足夠新；若仍失敗，README 提供「手動建立 gh-pages 分支」備援步驟。

## Migration Plan

1. 新增 `package.json` scripts 與 devDependencies（ESLint、Playwright、相關 plugin），先讓本機可跑完整驗證入口。
2. 新增 `eslint.config.js`、`playwright.config.ts`、`tests/e2e/app-shell.smoke.spec.ts`，本機跑 `npm run lint`、`npm run test:e2e` 通過。
3. 修改 `vite.config.ts` 加入 `normalizeBasePath` 函式並接通 Vite `base`、PWA manifest、SW navigateFallback；修改 `src/app/router/index.ts` 改用 `createWebHistory(import.meta.env.BASE_URL)`。
4. 新增 5 支單元測試覆蓋 workflow 契約、package scripts、publishPages、README 章節、base path normalize。
5. 新增 `.github/workflows/ci.yml`，本地用 `act` 或 GitHub UI 試跑 PR 流程確認步驟順序與 diagnostics upload。
6. 新增 `scripts/publishPages.mjs`，搭配 unit test 在本機驗證各 scenario。
7. 新增 `.github/workflows/cd.yml`，建立 `dev` 與 `main` 分支推送以實際觸發部署，根據 first-deploy checklist 在 GitHub Settings 設 Pages source。
8. 新增 `README.md` 與 `PROJECT_ARCHITECTURE.md`，記錄上述操作與 first-deploy checklist。

**Rollback 策略**：若 CD 發布造成 `gh-pages` 內容錯誤——
- 暫停 CD：在 GitHub Actions UI 停用 CD workflow，或暫停對 `dev`/`main` 的 push
- 還原內容：把 `gh-pages` 分支用 `git reset --hard <last-good-sha>` + `git push --force` 回到上一個正常提交
- 修正後重試：修 publishPages 或 base path 設定後，重新 push 觸發 CD

## Open Questions

無。所有實作細節已在本文件 Implementation Contract 與 spec.md scenarios/examples 明確規範。
