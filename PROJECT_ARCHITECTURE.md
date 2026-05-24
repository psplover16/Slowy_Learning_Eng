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

## MissHoney 播放清單模組（`src/modules/playlists/`）

```
src/modules/playlists/
  types.ts                        — PlaylistData, PlaylistVideoEntry, SkippedVideoEntry,
                                    PlaylistVideoData, PlaylistScene, PlaylistVocabGroup,
                                    PlaylistPhrase, ContentScaffold, ImportSummary 等型別
  PlaylistView.vue                — 播放清單入口頁（/a1, /a2, /b1, /b2）
  PlaylistVideoView.vue           — 影片學習內容頁（/:level/:videoSlug）
  components/                     — MissHoney 專用閱讀元件（header、scene、word、phrase、
                                    usage、sentence breakdown），視覺貼近 ChapterView 但不耦合 ChapterData
  data/
    a1.ts / a2.ts / b1.ts / b2.ts — 各難度 metadata（videos[] + skippedVideos[]）
    videos/
      a1/<slug>.json              — 每支 ready 影片的 PlaylistVideoData（lazy import）
      a2/<slug>.json
      b1/<slug>.json
      b2/<slug>.json

src/modules/home/composables/
  useMissHoneyCompletion.ts       — 影片完讀切換（localStorage key: slowy:miss-honey-completion）
```

**路由所有權（/a1–/b2）：**
- `/a1`, `/a2`, `/b1`, `/b2` → `PlaylistView.vue`（接 `level` prop）
- `/:level/:videoSlug` → `PlaylistVideoView.vue`（接 `level` + `videoSlug` props）
- skipped 影片不產生子路由；`pendingTranscript` 影片子頁顯示「內容整理中」

**UI / runtime 邊界：**
- 首頁 MissHoney A1–B2 導航卡片沿用 `ArticleListItem` 卡片語意，但 `showCompletion=false`，不寫入 MissHoney 完成狀態。
- `/a1`–`/b2` 列表頁使用同一組 article-style card，右側完成圈圈只寫 `slowy:miss-honey-completion`。
- 影片內容頁只讀 bundled JSON lazy import 與 localStorage；runtime 不抓 YouTube 字幕、不呼叫翻譯服務、不呼叫 AI/API，也不新增 Pinia store 或 IndexedDB migration。
- 影片內容頁只在英文全文 token 上渲染 word / phrase / usage marker；中文翻譯維持純文字。
- marker 點擊後由 `PlaylistVideoView.vue` smooth scroll 到同頁單一講解卡片、center 對齊、短暫高亮；講解卡片的「回原文」會回到最後點擊的 marker `instanceId`。
- 特殊用法使用 `usages` 獨立區塊與 quick nav，不併入 vocabulary 或 phrases。
- 文法 / 句型解析只透過 quick nav 或區塊導覽；全文不產生 grammar inline marker。
- content loader 找不到、pending transcript、localStorage parse failure 皆回到安全 fallback，不阻斷畫面。

## MissHoney Import 工具（`scripts/misshoney/`）

```
scripts/misshoney/
  sources.json                — 四個播放清單 URL（A1/A2/B1/B2）
  import-core.mjs             — 純函式：reverse-order、slug 推導、cue 正規化、output planning
  import-playlists.mjs        — CLI：呼叫 yt-dlp，寫 raw outputs，不覆蓋 app content
  fetch-transcript.mjs        — CLI：依 level + slug 提取單支英文字幕到指定文字檔，優先用 raw transcript cache
  content-core.mjs            — 純函式：scaffold 建立、schema 驗證、completeness 驗證、promotion planning
  proofread-core.mjs          — 純函式：解析 proofread JSON、檢查 HTML/marker target、產生 PlaylistVideoData draft
  full-refresh-core.mjs       — 純函式：本地 originalContent inventory、subtitle extraction、
                                step1 validation、單檔 proofreader lifecycle manifest、write-back、
                                grammar accumulation、grammar_deal parsing、final verification report
  scaffold-content.mjs        — CLI：raw transcripts → authoring scaffolds（不含 TC 翻譯）
  parse-proofread-result.mjs  — CLI：讀 `_private/proofread_result.md` 的 JSON code block，輸出 draft 或單支影片 JSON
  full-refresh.mjs            — CLI：全量 refresh dry-run / step1 sync / write-back / grammar / final report
  validate-content.mjs        — CLI：驗證 generated/promoted JSON 完整性
  promote-content.mjs         — CLI：通過驗證後複製到 app data 並更新 metadata
  author-polished-content.mjs — build-time/apply authoring helper：讀 scaffold，
                                重建自然英文句、呼叫翻譯 provider 產生繁中草稿，
                                補 vocab/phrases/breakdowns，並先跑 validator

_private/misshoney/           — 原始 import 輸出（不進 app bundle，不提交至 git）
  inventory/<level>.json      — playlist metadata 清冊
  transcripts/<level>/<slug>.json — 正規化英文字幕 cues
  skipped/<level>.json        — 不可學習影片與原因
  import-summary.json         — 各等級 import 統計
  content-scaffolds/<level>/<slug>.json — authoring 素材（script 生成）
  generated-content/<level>/<slug>.json — 完整 PlaylistVideoData（apply agent 撰寫）

_private/tmp/
  originalContent/<level>/<slug>.json|md — 本次全量 refresh 的本地字幕來源；apply 不重新抓 YouTube
  step1/<level>/<slug>.md                — 每支字幕對應的 english_proofreader output；Markdown 供 review，
                                           fenced JSON 是 app write-back contract
  grammar.md                             — 所有 step1 grammar entries 的累積檔，不在逐支影片時排序
  grammar_deal.md                        — grammar_organizer / deterministic organizer 輸出的整理檔；
                                           JSON grammarPoints 依 simple-to-difficult sortOrder 連續遞增
  misshoney-full-refresh-manifest.json   — source inventory、抽字欄位、proofreader lifecycle record
  final-verification-report.md           — 覆蓋率、JSON 成功、repair list、route write-back、grammar、UI smoke、
                                           lint/test/build 與剩餘風險
```

**內容 Pipeline 流程：**
1. `npm run misshoney:import` — yt-dlp 抓 playlist metadata 與公開字幕 → `_private/misshoney/`
2. `npm run misshoney:scaffold-content` — transcripts → authoring scaffolds（不含教學內容）
3. `npm run misshoney:author-polished-content` 或 apply agent 依 scaffold 撰寫 `_private/misshoney/generated-content/<level>/<slug>.json`
4. AI 校稿階段對照 transcript/scaffold/generated JSON，盡量保留有意義字幕，修正英文拼字、語法、斷句、繁中翻譯、vocab/phrases/breakdowns 解釋錯誤
5. `npm run misshoney:validate-content` — 驗證 polished schema、非空繁中翻譯、cue fragment、泛用 placeholder 單字/片語與 breakdown 欄位
6. `npm run misshoney:promote-content` — 只有通過 validator 的 generated content 才複製到 `src/modules/playlists/data/videos/` 並更新 metadata；任一檔失敗時停止 promotion

**全量 proofread refresh 流程（A1 → A2 → B1 → B2）：**
1. `npm run misshoney:full-refresh -- --dry-run` — 只讀 `_private/tmp/originalContent/a1`、`a2`、`b1`、`b2`，依 A1→A2→B1→B2 與自然章節順序建立 manifest；Markdown 來源直接取全文，JSON 來源只抽 `transcriptText` / `transcript` / `text` / cues 文字，不把 metadata 當字幕。
2. 每支 subtitle 對應一個新的 `english_proofreader` lifecycle：open → process one source → write one `_private/tmp/step1/<level>/<slug>.md` → close。manifest 會記錄 proofreader id，validator 會拒絕同一 proofreader 處理多檔。
3. `npm run misshoney:full-refresh -- --sync-step1 --validate-step1` — 檢查每個 step1 Markdown 必須含 fenced JSON、必要欄位、非空 correctedText / translation / segments，且不得含 `same as above` / `omitted for length` 等截斷字樣；壞檔進 repair list，不進 app write-back。
4. `npm run misshoney:full-refresh -- --write-back` — 只用 validated proofread JSON 覆寫 `src/modules/playlists/data/videos/<level>/<slug>.json`，保留 title、slug、level、videoId、youtubeUrl 等 metadata，並產生 vocabulary、phrases、usages、breakdowns、A/B/C marker token 與 source traceability；validator 失敗時不覆寫該 route。
5. `npm run misshoney:full-refresh -- --build-grammar` — 從全部 step1 grammar entries 產生 `_private/tmp/grammar.md`，再輸出 `_private/tmp/grammar_deal.md`；`grammar_deal.md` 同時含 Markdown 與 JSON，`grammarPoints[].sortOrder` 需由簡到難且連續遞增。
6. `/grammar` 同步採保守策略：既有 topic 只補充說明、限制、變體、例句或來源句，不新增重複 topic；無法明確納入的 grammar point 必須在 final report 的 omission list 列出 title、sourceCoverage、reason。
7. `npm run misshoney:full-refresh -- --final-report` — 產出 `_private/tmp/final-verification-report.md`，記錄 source count、step1 count、JSON success、repair list、route write-back count、grammar additions/supplements/omissions、UI smoke pages、lint/test/build 結果與剩餘風險。

**Polished PlaylistVideoData schema：**
- top-level：`videoId`、`slug`、`level`、`title`、`youtubeUrl`、`header`、`scenes`、`vocabGroups`、`phrases`、`usages`、`breakdowns`
- `header`：podcastLabel、titleZh、titleEn、levelTag、topicTag
- `scenes`：id、no、titleZh、titleEn、sentences、tags；sentences 使用自然英文與繁中分行，並可附 `englishTokens`
- `englishTokens`：`text` token 保留純文字；`word` / `phrase` / `usage` marker token 必須有 `targetId` 與 `instanceId`
- `vocabGroups` item 可有穩定 `id` 與 `lemma`；同一 lemma 不可重複成多筆講解，變化形由 marker surface text 保留
- `usages`：特殊用法的 first-class content，包含 anchor id、source word、熟悉意思、文中用法、繁中翻譯與例句
- `vocabGroups` / `phrases` / `usages` / `breakdowns` 必須提供 learner-facing 欄位，舊 draft schema 或 placeholder 解釋不可 promote
- proofread JSON 與 PlaylistVideoData 不存 HTML 字串；Vue 元件負責渲染 marker button 與 anchor

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
