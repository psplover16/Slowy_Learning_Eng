# article-list Specification

## Purpose

TBD - created by archiving change 'build-slowy-learning-eng-pwa'. Update Purpose after archive.

## Requirements

### Requirement: Home view displays a list of available articles

The home route (`/`) SHALL display a vertically scrollable list where each item represents one article chapter. Each item SHALL show the chapter title and subtitle.

#### Scenario: List renders all chapters

- **WHEN** the user visits `/`
- **THEN** one list item appears for each defined chapter (initially: Ch1 "我的紐約之旅")


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
### Requirement: Each list item has a completion toggle icon

Each list item SHALL display a completion icon at the trailing (right) edge. The icon represents whether the user has marked that chapter as studied.

#### Scenario: Default state is uncompleted

- **WHEN** the user visits `/` for the first time (no stored completion data)
- **THEN** all items show an outline (empty) circle icon

#### Scenario: Tapping the icon toggles completion

- **WHEN** the user taps the completion icon of an uncompleted item
- **THEN** the icon changes to a solid (filled) circle, and the completion state is persisted to `slowy:completion` in localStorage

- **WHEN** the user taps the completion icon of a completed item
- **THEN** the icon reverts to an outline circle, and the state is updated in localStorage

#### Scenario: Completion state persists across sessions

- **WHEN** the user marks a chapter as completed and then closes and reopens the app
- **THEN** the same chapter still shows the solid circle icon

##### Example: Persistence

- **GIVEN** `localStorage["slowy:completion"]` = `{"ch1": true}`
- **WHEN** the home view mounts
- **THEN** Ch1 list item shows solid circle icon; all other items show outline icon


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
### Requirement: Tapping the article title navigates to its content page

#### Scenario: Title tap navigates to chapter route

- **WHEN** the user taps the title area (not the icon) of a list item
- **THEN** the app navigates to that chapter's route (e.g., `/ch1`)

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