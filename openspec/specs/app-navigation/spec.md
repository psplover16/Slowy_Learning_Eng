# app-navigation Specification

## Purpose

TBD - created by archiving change 'build-slowy-learning-eng-pwa'. Update Purpose after archive.

## Requirements

### Requirement: Three-route SPA with sticky navigation bar

The application SHALL provide three client-side routes: home (`/`), grammar (`/grammar`), and article content (e.g., `/ch1`). A navigation bar fixed at the top of the viewport SHALL always be visible and allow switching between home and grammar routes.

#### Scenario: Navigation bar renders on all routes

- **WHEN** the user visits any route (`/`, `/grammar`, `/ch1`)
- **THEN** the navigation bar is visible at the top of the viewport with buttons "首頁" and "文法"

#### Scenario: Active route button is highlighted

- **WHEN** the current route is `/`
- **THEN** the "首頁" button uses terracotta background with white text; "文法" button uses paper background with ink text

- **WHEN** the current route is `/grammar`
- **THEN** the "文法" button uses terracotta background with white text; "首頁" button uses paper background with ink text

- **WHEN** the current route is `/ch1`
- **THEN** neither "首頁" nor "文法" button is highlighted

#### Scenario: Navigation button click routes correctly

- **WHEN** the user taps "首頁"
- **THEN** the app navigates to `/`

- **WHEN** the user taps "文法"
- **THEN** the app navigates to `/grammar`


<!-- @trace
source: build-slowy-learning-eng-pwa
updated: 2026-05-22
code:
  - _private/done/claudeCli.md
  - src/modules/chapters/types.ts
  - _private/done/筆記.html
  - src/modules/chapters/data/ch1.ts
  - _private/done/spectraYaml.md
  - src/modules/chapters/data/ch2.ts
  - _private/done/claude-intro.html
  - src/modules/chapters/data/ch3.ts
  - _private/ch2-data-draft.ts
  - src/shared/components/SectionQuickNav.vue
  - src/shared/config/chapters.ts
  - _private/ch1-new york travel.html
  - _private/index.html
  - _private/discuss.txt
  - _private/propose.md
  - src/modules/chapters/ChapterView.vue
tests:
  - src/__tests__/SectionQuickNav.test.ts
  - tests/e2e/ch3.smoke.spec.ts
  - src/__tests__/ChapterView.test.ts
  - src/__tests__/ChapterViewDynamic.test.ts
  - tests/e2e/app-shell.smoke.spec.ts
  - tests/e2e/ch2.smoke.spec.ts
-->

---
### Requirement: Navigation bar is sticky and does not scroll away

#### Scenario: NavBar stays fixed during page scroll

- **WHEN** the user scrolls down any page
- **THEN** the navigation bar remains fixed at the top of the viewport (`position: sticky; top: 0`)


<!-- @trace
source: build-slowy-learning-eng-pwa
updated: 2026-05-22
code:
  - _private/done/claudeCli.md
  - src/modules/chapters/types.ts
  - _private/done/筆記.html
  - src/modules/chapters/data/ch1.ts
  - _private/done/spectraYaml.md
  - src/modules/chapters/data/ch2.ts
  - _private/done/claude-intro.html
  - src/modules/chapters/data/ch3.ts
  - _private/ch2-data-draft.ts
  - src/shared/components/SectionQuickNav.vue
  - src/shared/config/chapters.ts
  - _private/ch1-new york travel.html
  - _private/index.html
  - _private/discuss.txt
  - _private/propose.md
  - src/modules/chapters/ChapterView.vue
tests:
  - src/__tests__/SectionQuickNav.test.ts
  - tests/e2e/ch3.smoke.spec.ts
  - src/__tests__/ChapterView.test.ts
  - src/__tests__/ChapterViewDynamic.test.ts
  - tests/e2e/app-shell.smoke.spec.ts
  - tests/e2e/ch2.smoke.spec.ts
-->

---
### Requirement: Navigation bar respects iOS safe area (notch / Dynamic Island)

When the app runs as a standalone PWA on iPhone, the navigation bar SHALL NOT be obscured by the system status bar, notch, or Dynamic Island. The viewport SHALL use `viewport-fit=cover` and the navigation bar top padding SHALL use `env(safe-area-inset-top)`.

#### Scenario: NavBar is fully visible on iPhone with Dynamic Island

- **GIVEN** the app is installed as a standalone PWA on an iPhone with a Dynamic Island or notch
- **WHEN** the user opens the app
- **THEN** the navigation bar content (buttons "首頁" and "文法") is fully visible and not obscured by the system UI
- **AND** the navigation bar top padding adjusts to `env(safe-area-inset-top)` via the `tailwindcss-safe-area` plugin


<!-- @trace
source: build-slowy-learning-eng-pwa
updated: 2026-05-22
code:
  - _private/done/claudeCli.md
  - src/modules/chapters/types.ts
  - _private/done/筆記.html
  - src/modules/chapters/data/ch1.ts
  - _private/done/spectraYaml.md
  - src/modules/chapters/data/ch2.ts
  - _private/done/claude-intro.html
  - src/modules/chapters/data/ch3.ts
  - _private/ch2-data-draft.ts
  - src/shared/components/SectionQuickNav.vue
  - src/shared/config/chapters.ts
  - _private/ch1-new york travel.html
  - _private/index.html
  - _private/discuss.txt
  - _private/propose.md
  - src/modules/chapters/ChapterView.vue
tests:
  - src/__tests__/SectionQuickNav.test.ts
  - tests/e2e/ch3.smoke.spec.ts
  - src/__tests__/ChapterView.test.ts
  - src/__tests__/ChapterViewDynamic.test.ts
  - tests/e2e/app-shell.smoke.spec.ts
  - tests/e2e/ch2.smoke.spec.ts
-->

---
### Requirement: Content pages are linked from the home list only

#### Scenario: NavBar does not contain content page links

- **WHEN** the user wants to access `/ch1`
- **THEN** they must navigate from the home article list; the navigation bar does NOT include a direct link to content pages

<!-- @trace
source: build-slowy-learning-eng-pwa
updated: 2026-05-22
code:
  - _private/done/claudeCli.md
  - src/modules/chapters/types.ts
  - _private/done/筆記.html
  - src/modules/chapters/data/ch1.ts
  - _private/done/spectraYaml.md
  - src/modules/chapters/data/ch2.ts
  - _private/done/claude-intro.html
  - src/modules/chapters/data/ch3.ts
  - _private/ch2-data-draft.ts
  - src/shared/components/SectionQuickNav.vue
  - src/shared/config/chapters.ts
  - _private/ch1-new york travel.html
  - _private/index.html
  - _private/discuss.txt
  - _private/propose.md
  - src/modules/chapters/ChapterView.vue
tests:
  - src/__tests__/SectionQuickNav.test.ts
  - tests/e2e/ch3.smoke.spec.ts
  - src/__tests__/ChapterView.test.ts
  - src/__tests__/ChapterViewDynamic.test.ts
  - tests/e2e/app-shell.smoke.spec.ts
  - tests/e2e/ch2.smoke.spec.ts
-->