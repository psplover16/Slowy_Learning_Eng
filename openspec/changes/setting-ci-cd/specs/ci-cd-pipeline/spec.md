# ci-cd-pipeline Specification

## ADDED Requirements

### Requirement: CI workflow validation
The system SHALL provide a GitHub Actions workflow named `CI` defined at `.github/workflows/ci.yml` that validates the project on every pull request and on every push except pushes to the `gh-pages` branch.

#### Scenario: Pull request validation
- **WHEN** a pull request targets any branch
- **THEN** the `CI` workflow SHALL run on `ubuntu-latest` with Node.js 22 and npm dependency cache enabled

#### Scenario: Push validation excludes deployment branch
- **WHEN** a push targets a branch other than `gh-pages`
- **THEN** the `CI` workflow SHALL run validation jobs

#### Scenario: Deployment branch push is ignored
- **WHEN** a push targets `gh-pages`
- **THEN** the `CI` workflow SHALL NOT run

#### Scenario: Validation step order
- **WHEN** the `CI` workflow runs
- **THEN** it SHALL execute the following steps in order: checkout the repository, set up Node.js 22 with npm cache, run `npm ci`, run `npm run lint`, run `npm run typecheck`, run `npm run test:unit`, run `npm run build`, run `npx playwright install chromium`, run `npm run test:e2e`

#### Scenario: Permissions are read-only
- **WHEN** the `CI` workflow runs
- **THEN** it SHALL declare `permissions.contents: read` so validation jobs cannot mutate repository state

---

### Requirement: CI diagnostics artifact upload
The system SHALL preserve Playwright diagnostics when e2e validation fails in CI, so failure causes can be inspected after the workflow run.

#### Scenario: E2E failure uploads diagnostics
- **WHEN** the `CI` workflow e2e step fails
- **THEN** the workflow SHALL upload `playwright-report/` and `test-results/` directories as a single artifact named `playwright-diagnostics`
- **AND** missing directories SHALL be tolerated (the upload step SHALL use `if-no-files-found: ignore`)

#### Scenario: E2E success skips diagnostics upload
- **WHEN** the `CI` workflow e2e step succeeds
- **THEN** the workflow SHALL complete without producing a diagnostics artifact

---

### Requirement: CD workflow deployment targets
The system SHALL provide a GitHub Actions workflow named `CD` defined at `.github/workflows/cd.yml` that deploys `dev` to staging and `main` to production through the `gh-pages` branch.

#### Scenario: Dev deploys to staging
- **WHEN** a push targets the `dev` branch
- **THEN** the `CD` workflow SHALL set `PUBLISH_TARGET=staging`, `VITE_APP_BASE_PATH=/Slowy_Learning_Eng/staging/`, and `VITE_APP_START_URL=/Slowy_Learning_Eng/staging/`
- **AND** SHALL build the site and publish `dist/` to `gh-pages/staging/`

#### Scenario: Main deploys to production
- **WHEN** a push targets the `main` branch
- **THEN** the `CD` workflow SHALL set `PUBLISH_TARGET=production`, `VITE_APP_BASE_PATH=/Slowy_Learning_Eng/`, and `VITE_APP_START_URL=/Slowy_Learning_Eng/`
- **AND** SHALL build the site and publish `dist/` to the `gh-pages` root

#### Scenario: Non deployment branch is ignored
- **WHEN** a push targets any branch other than `dev` or `main`
- **THEN** the `CD` workflow SHALL NOT deploy

#### Scenario: Deployment permissions and concurrency
- **WHEN** the `CD` workflow runs
- **THEN** it SHALL declare `permissions.contents: write`
- **AND** SHALL define a concurrency group `${{ github.workflow }}-${{ github.ref }}` with `cancel-in-progress: true` to prevent overlapping deployments for the same workflow and ref

#### Scenario: Worktree initialization for first deploy
- **WHEN** the `CD` workflow runs and no remote `gh-pages` branch exists
- **THEN** it SHALL create a detached worktree at `.deploy-pages`, run `git checkout --orphan gh-pages` inside it, and remove all entries except `.git`

#### Scenario: Worktree initialization for subsequent deploys
- **WHEN** the `CD` workflow runs and a remote `gh-pages` branch exists
- **THEN** it SHALL fetch `gh-pages` and add a worktree at `.deploy-pages` tracking it

---

### Requirement: GitHub Pages base path alignment
The system SHALL use one build-time base path source for Vite static asset paths, PWA manifest start URL, PWA manifest icon URLs, the Service Worker `navigateFallback`, and Vue Router history configuration. The single source SHALL be the normalized form of the `VITE_APP_BASE_PATH` environment variable.

#### Scenario: Production base path
- **WHEN** the `CD` workflow builds for the `production` target
- **THEN** the effective base path SHALL be `/Slowy_Learning_Eng/`

#### Scenario: Staging base path
- **WHEN** the `CD` workflow builds for the `staging` target
- **THEN** the effective base path SHALL be `/Slowy_Learning_Eng/staging/`

#### Scenario: All consumers use the same base path
- **WHEN** the application is built for any deployment target
- **THEN** Vite `base`, Vue Router `createWebHistory(import.meta.env.BASE_URL)`, PWA manifest `start_url`, PWA manifest icon `src` values, and Service Worker `navigateFallback` SHALL all derive from the same normalized base path string

##### Example: target to base path mapping

| Deployment target | Source branch | Effective base path |
| ----------------- | ------------- | ------------------- |
| staging           | dev           | `/Slowy_Learning_Eng/staging/` |
| production        | main          | `/Slowy_Learning_Eng/` |
| local dev         | any           | `/` (default) |

---

### Requirement: Build-time base path normalization function
The Vite configuration SHALL contain a pure normalization function that converts an arbitrary `VITE_APP_BASE_PATH` input into a canonical form. The function SHALL be deterministic, side-effect-free, and individually unit-testable.

The function contract:
- **Input**: a string, `undefined`, or `null`
- **Output**: a string that always starts with `/` and ends with `/`

Normalization rules:
- An input that is `undefined`, `null`, an empty string, or contains only whitespace SHALL produce `/`
- An input equal to `/` SHALL produce `/`
- For any other input, the function SHALL trim whitespace, prepend `/` if absent, and append `/` if absent
- The function SHALL NOT collapse interior duplicate slashes (e.g. `//foo//`); such inputs are caller errors and SHALL pass through with only the leading/trailing slash guarantee enforced

#### Scenario: Function is invoked once per build
- **WHEN** the Vite config is loaded for a build
- **THEN** the normalization function is called exactly once with the `VITE_APP_BASE_PATH` value
- **AND** the returned value is reused for all base path consumers (Vite `base`, PWA manifest, Service Worker, etc.)

#### Scenario: Function is exported for unit testing
- **WHEN** unit tests import the normalization function from the Vite config module
- **THEN** the function is exported as a named export so tests can invoke it directly without running a full Vite build

##### Example: normalization input/output table

| Input | Output |
| ----- | ------ |
| `undefined` | `/` |
| `null` | `/` |
| `""` | `/` |
| `"   "` | `/` |
| `"/"` | `/` |
| `"Slowy_Learning_Eng"` | `/Slowy_Learning_Eng/` |
| `"/Slowy_Learning_Eng"` | `/Slowy_Learning_Eng/` |
| `"Slowy_Learning_Eng/"` | `/Slowy_Learning_Eng/` |
| `"/Slowy_Learning_Eng/"` | `/Slowy_Learning_Eng/` |
| `"/Slowy_Learning_Eng/staging/"` | `/Slowy_Learning_Eng/staging/` |
| `"Slowy_Learning_Eng/staging"` | `/Slowy_Learning_Eng/staging/` |

---

### Requirement: Protected GitHub Pages publishing
The system SHALL publish build output through a Node.js script at `scripts/publishPages.mjs` that safely synchronizes production and staging content inside a `gh-pages` worktree.

The script SHALL accept three named CLI arguments:
- `--worktree <path>`: the local path of the `gh-pages` worktree
- `--dist <path>`: the local path of the build output directory
- `--target <production|staging>`: the publish target name; any other value SHALL cause the script to exit with a non-zero exit code

The script SHALL preserve the following entries at the `gh-pages` worktree root for all targets: `.git`, `.nojekyll`, `CNAME`, `staging`. Note that `CNAME` is preserved defensively — this project does not currently use a custom domain, but the preservation rule allows a future custom domain to remain stable across deploys.

The script SHALL skip files with extensions `.gz` and `.br` when copying from `dist/` to the worktree (these pre-compressed artifacts are not needed on GitHub Pages, which performs its own compression).

The script SHALL write an empty `.nojekyll` file at the worktree root after publishing so GitHub Pages serves files starting with `_` correctly.

The script SHALL exit with a non-zero exit code without modifying the worktree when `dist/` is missing or contains zero entries.

For the `staging` target, if a stale `index.html` exists at the worktree root and its contents include the literal substring `/src/` (indicating a dev-mode file accidentally pushed previously), the script SHALL remove that stale `index.html` before publishing the staging subdirectory.

#### Scenario: Publish production root
- **WHEN** the script receives `--target production`
- **THEN** it SHALL remove all entries at the worktree root except `.git`, `.nojekyll`, `CNAME`, `staging`
- **AND** it SHALL copy `dist/` contents (excluding `.gz`/`.br`) into the worktree root

#### Scenario: Publish staging subdirectory
- **WHEN** the script receives `--target staging`
- **THEN** it SHALL empty the `<worktree>/staging/` directory
- **AND** it SHALL copy `dist/` contents (excluding `.gz`/`.br`) into `<worktree>/staging/`
- **AND** it SHALL NOT remove production files at the worktree root (except entries not in the allow-list, including a stale unsafe `index.html`)

#### Scenario: Empty or missing dist fails before mutating worktree
- **WHEN** the script receives an empty or missing `--dist` directory
- **THEN** it SHALL throw an error and exit with a non-zero exit code before any worktree modification

#### Scenario: Unsupported target fails fast
- **WHEN** the script receives `--target` with a value other than `production` or `staging`
- **THEN** it SHALL throw an error before any worktree modification

#### Scenario: No content change avoids empty commit
- **WHEN** the publish operation produces no `git diff --cached` output
- **THEN** the `CD` workflow SHALL exit successfully without creating an empty commit

#### Scenario: Pre-compressed artifacts are skipped during copy
- **WHEN** the script copies `dist/` contents
- **THEN** files ending in `.gz` or `.br` SHALL NOT be copied into the worktree

##### Example: preservation behavior at gh-pages root

| Entry at worktree root | Target = production | Target = staging |
| ---------------------- | ------------------- | ---------------- |
| `.git` | preserved | preserved |
| `.nojekyll` | preserved (rewritten) | preserved (rewritten) |
| `CNAME` | preserved | preserved |
| `staging/` | preserved | rewritten |
| `index.html` (clean) | removed then rewritten from dist | preserved |
| `index.html` (contains `/src/`) | removed then rewritten from dist | removed |
| `assets/` (old) | removed then rewritten from dist | preserved |
| arbitrary file `legacy.txt` | removed | removed |

---

### Requirement: E2E testing infrastructure
The system SHALL provide a Playwright configuration at `playwright.config.ts` that starts a local HTTP server before tests run and shuts it down after. The configuration SHALL bind the server to host `127.0.0.1` and port `4173`. The port SHALL be overridable via the `PLAYWRIGHT_PORT` environment variable.

The configuration SHALL select the server command based on the `CI` environment variable:
- When `CI` is set to any truthy value, the server SHALL be `npm run preview -- --host 127.0.0.1 --port 4173` so e2e tests validate the production build output
- When `CI` is unset or empty, the server SHALL be `npm run dev -- --host 127.0.0.1 --port 4173` so developers get fast feedback during local iteration

The configuration SHALL set `baseURL` to `http://127.0.0.1:4173` so test code can use relative URLs.

The configuration SHALL run only the Chromium browser in this change. Adding additional browsers is out of scope for this change and SHALL be handled by a separate future change.

The configuration SHALL retry failed tests up to 2 times in CI and 0 times locally.

The configuration SHALL place e2e test files under `tests/e2e/`.

The configuration SHALL set `reuseExistingServer: !process.env.CI` so local re-runs reuse a developer's already-running dev server.

#### Scenario: Local e2e uses dev server
- **WHEN** Playwright runs with the `CI` environment variable unset or empty
- **THEN** the configured `webServer.command` SHALL be `npm run dev -- --host 127.0.0.1 --port 4173`

#### Scenario: CI e2e uses preview server
- **WHEN** Playwright runs with the `CI` environment variable set to any truthy value
- **THEN** the configured `webServer.command` SHALL be `npm run preview -- --host 127.0.0.1 --port 4173`

#### Scenario: Port is overridable
- **WHEN** `PLAYWRIGHT_PORT=5000` is set
- **THEN** the configured server SHALL bind to port `5000` and `baseURL` SHALL be `http://127.0.0.1:5000`

#### Scenario: App shell smoke covers main routes
- **WHEN** the initial e2e smoke test runs
- **THEN** it SHALL visit `/`, `/grammar`, and `/ch1` directly (deep-linked, not navigated)
- **AND** for each route the page main content SHALL render without emitting any `console.error` calls

---

### Requirement: ESLint configuration baseline
The project SHALL provide an ESLint flat config at `eslint.config.js` that lints both TypeScript and Vue Single-File Components.

The configuration SHALL combine the following rule sets:
- `@eslint/js` recommended rules (`js.configs.recommended`)
- `@typescript-eslint/eslint-plugin` recommended rules applied to `.ts` and `.tsx` files
- `eslint-plugin-vue` flat recommended rules (`vuePlugin.configs['flat/recommended']`) applied to `.vue` files

The configuration SHALL use `vue-eslint-parser` as the top-level parser for `.vue` files with `@typescript-eslint/parser` as the embedded script parser.

The configuration SHALL ignore the following paths: `dist/**`, `build/**`, `coverage/**`, `node_modules/**`.

The configuration SHALL disable the following Vue rules to align with the project's mobile-first component conventions:
- `vue/multi-word-component-names`
- `vue/html-self-closing`
- `vue/max-attributes-per-line`
- `vue/singleline-html-element-content-newline`
- `vue/attributes-order`

The configuration SHALL disable `no-undef` for TypeScript files (TypeScript itself catches undefined references).

The configuration SHALL apply Node.js globals to files under `scripts/**/*.mjs`.

#### Scenario: Lint command runs without configuration errors
- **WHEN** the user runs `npm run lint`
- **THEN** ESLint loads `eslint.config.js` and analyzes `.ts` and `.vue` files in the project
- **AND** ESLint does NOT report errors caused by missing plugins, missing parsers, or invalid configuration

#### Scenario: Disabled Vue rules do not fire
- **WHEN** ESLint runs against a single-word `.vue` component (e.g. `App.vue`) or a multi-line HTML element without self-closing
- **THEN** none of the 5 disabled `vue/*` rules SHALL produce a warning or error

---

### Requirement: Package script contract
The system SHALL expose package scripts in `package.json` that allow local execution of the same validation phases used by CI.

The following scripts SHALL exist:
- `lint`: invokes ESLint over the project
- `typecheck`: invokes `vue-tsc --noEmit` for type validation
- `test:unit`: invokes Vitest in run mode
- `build`: invokes typecheck followed by `vite build`
- `test:e2e`: invokes Playwright
- `test:ci`: invokes lint, typecheck, test:unit, build, test:e2e in that exact order, chained with `&&`

#### Scenario: Required scripts exist
- **WHEN** `package.json` is inspected
- **THEN** all six scripts listed above SHALL be present under the `scripts` field

#### Scenario: CI script order
- **WHEN** `test:ci` executes
- **THEN** it SHALL run `lint`, `typecheck`, `test:unit`, `build`, `test:e2e` in that order
- **AND** the chain SHALL stop at the first failing step

---

### Requirement: CI/CD documentation
The system SHALL document operational procedures in `README.md` and architecture decisions in `PROJECT_ARCHITECTURE.md`. Both files SHALL be created if absent, or updated in place if present.

#### Scenario: README documents local validation
- **WHEN** the README is rendered
- **THEN** it SHALL list each of the six package scripts (`lint`, `typecheck`, `test:unit`, `build`, `test:e2e`, `test:ci`) with a one-line description of what each runs

#### Scenario: README documents CI and CD operation
- **WHEN** the README is rendered
- **THEN** it SHALL describe: CI trigger conditions (pull_request and non-gh-pages push), CD trigger conditions (dev and main push), the `dev → staging` and `main → production` mapping, the production URL pattern `https://<owner>.github.io/Slowy_Learning_Eng/`, the staging URL pattern `https://<owner>.github.io/Slowy_Learning_Eng/staging/`, the requirement to set GitHub Pages source to the `gh-pages` branch, and the recommendation to configure branch protection for `dev` and `main` requiring CI to pass before merge

#### Scenario: PROJECT_ARCHITECTURE records deployment structure
- **WHEN** `PROJECT_ARCHITECTURE.md` is rendered
- **THEN** it SHALL list the new files added by this change (`.github/workflows/ci.yml`, `.github/workflows/cd.yml`, `scripts/publishPages.mjs`, `eslint.config.js`, `playwright.config.ts`, `tests/e2e/`) with a one-line description of each
- **AND** it SHALL describe the relationship between the build base path, the deployment target, and the published URL

#### Scenario: Completion summary includes verification results
- **WHEN** the change implementation completes
- **THEN** the implementation summary SHALL list modified and created files, CI trigger behavior verified locally, CD branch-to-target mapping, and the output of `npm run test:ci`

---

### Requirement: First-deploy operational prerequisites
The README SHALL include a clearly-titled checklist of one-time operational steps a maintainer completes before the first CD deployment. These steps are outside the scope of code changes (they require GitHub repository settings access or branch creation) but MUST be documented so the deployment pipeline can actually serve content.

The checklist SHALL cover:

1. Creating the `dev` branch from the current default branch and pushing it to the remote (`git checkout -b dev && git push -u origin dev`)
2. Creating the `main` branch from the current default branch and pushing it to the remote (`git checkout -b main && git push -u origin main`)
3. In the GitHub repository's Settings → Pages page, setting the Pages source to the `gh-pages` branch with folder `/` (root)
4. After the first successful CD run on `main`, confirming `https://<owner>.github.io/Slowy_Learning_Eng/` returns HTTP 200
5. After the first successful CD run on `dev`, confirming `https://<owner>.github.io/Slowy_Learning_Eng/staging/` returns HTTP 200
6. (Recommended) In Settings → Branches, adding branch protection rules for `main` and `dev` that require the `CI` workflow to pass before merge

#### Scenario: README contains first-deploy checklist
- **WHEN** the README is rendered
- **THEN** a section whose heading contains "first-deploy", "首次部署", or equivalent SHALL be present
- **AND** the section SHALL enumerate the 6 steps listed above with executable commands or precise UI locations where applicable
