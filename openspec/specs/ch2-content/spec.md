# ch2-content Specification

## Purpose

TBD - created by archiving change 'add-ch2-dynamic-nav'. Update Purpose after archive.

## Requirements

### Requirement: Ch2 chapter page is accessible at /ch2

The system SHALL register Ch2 in the chapter registry so Vue Router auto-generates a route at `/ch2` that renders `ChapterView` with `id="ch2"`.

#### Scenario: User navigates to Ch2

- **WHEN** the user navigates to `/ch2`
- **THEN** `ChapterView` renders with the Ch2 data and displays the title "How Languages Are Really Learned"

#### Scenario: Ch2 route appears in chapter registry

- **WHEN** the app initialises
- **THEN** the chapter registry contains an entry with `id: 'ch2'` and `path: '/ch2'`


<!-- @trace
source: add-ch2-bilingual-text
updated: 2026-05-22
code:
  - src/shared/config/chapters.ts
  - _private/done/筆記.html
  - _private/ch2-data-draft.ts
  - _private/done/spectraYaml.md
  - _private/ch1-new york travel.html
  - _private/index.html
  - src/modules/chapters/data/ch3.ts
  - src/modules/chapters/ChapterView.vue
  - _private/propose.md
  - _private/done/claudeCli.md
  - src/modules/chapters/data/ch2.ts
  - src/modules/chapters/types.ts
  - _private/discuss.txt
  - src/shared/components/SectionQuickNav.vue
  - src/modules/chapters/data/ch1.ts
  - _private/done/claude-intro.html
tests:
  - src/__tests__/ChapterView.test.ts
  - tests/e2e/ch3.smoke.spec.ts
  - src/__tests__/SectionQuickNav.test.ts
  - tests/e2e/ch2.smoke.spec.ts
  - src/__tests__/ChapterViewDynamic.test.ts
  - tests/e2e/app-shell.smoke.spec.ts
-->

---
### Requirement: Ch2 vocabulary section is present

Ch2 SHALL include at least one vocabulary group with word entries.

#### Scenario: Vocabulary section renders
- **WHEN** the user visits `/ch2`
- **THEN** the vocabulary section is visible and contains grouped word entries with English term, part-of-speech, and Chinese meaning


<!-- @trace
source: add-ch2-dynamic-nav
updated: 2026-05-22
code:
  - src/modules/chapters/data/ch3.ts
  - _private/discuss.txt
  - _private/propose.md
  - src/modules/chapters/ChapterView.vue
  - _private/done/spectraYaml.md
  - _private/index.html
  - src/modules/chapters/types.ts
  - _private/done/claudeCli.md
  - src/shared/components/SectionQuickNav.vue
  - src/modules/chapters/data/ch2.ts
  - src/shared/config/chapters.ts
  - _private/ch2-data-draft.ts
  - _private/done/claude-intro.html
  - _private/done/筆記.html
  - _private/ch1-new york travel.html
  - src/modules/chapters/data/ch1.ts
tests:
  - src/__tests__/SectionQuickNav.test.ts
  - tests/e2e/app-shell.smoke.spec.ts
  - tests/e2e/ch3.smoke.spec.ts
  - src/__tests__/ChapterViewDynamic.test.ts
  - src/__tests__/ChapterView.test.ts
  - tests/e2e/ch2.smoke.spec.ts
-->

---
### Requirement: Ch2 phrases section is present

Ch2 SHALL include at least one phrase card entry.

#### Scenario: Phrases section renders
- **WHEN** the user visits `/ch2`
- **THEN** the phrases section is visible with at least one `PhraseCard` rendered


<!-- @trace
source: add-ch2-dynamic-nav
updated: 2026-05-22
code:
  - src/modules/chapters/data/ch3.ts
  - _private/discuss.txt
  - _private/propose.md
  - src/modules/chapters/ChapterView.vue
  - _private/done/spectraYaml.md
  - _private/index.html
  - src/modules/chapters/types.ts
  - _private/done/claudeCli.md
  - src/shared/components/SectionQuickNav.vue
  - src/modules/chapters/data/ch2.ts
  - src/shared/config/chapters.ts
  - _private/ch2-data-draft.ts
  - _private/done/claude-intro.html
  - _private/done/筆記.html
  - _private/ch1-new york travel.html
  - src/modules/chapters/data/ch1.ts
tests:
  - src/__tests__/SectionQuickNav.test.ts
  - tests/e2e/app-shell.smoke.spec.ts
  - tests/e2e/ch3.smoke.spec.ts
  - src/__tests__/ChapterViewDynamic.test.ts
  - src/__tests__/ChapterView.test.ts
  - tests/e2e/ch2.smoke.spec.ts
-->

---
### Requirement: Ch2 sentence breakdowns section is present

Ch2 SHALL include at least one sentence breakdown entry.

#### Scenario: Breakdowns section renders
- **WHEN** the user visits `/ch2`
- **THEN** the sentence breakdown section is visible with at least one `SentenceBreakdown` rendered


<!-- @trace
source: add-ch2-dynamic-nav
updated: 2026-05-22
code:
  - src/modules/chapters/data/ch3.ts
  - _private/discuss.txt
  - _private/propose.md
  - src/modules/chapters/ChapterView.vue
  - _private/done/spectraYaml.md
  - _private/index.html
  - src/modules/chapters/types.ts
  - _private/done/claudeCli.md
  - src/shared/components/SectionQuickNav.vue
  - src/modules/chapters/data/ch2.ts
  - src/shared/config/chapters.ts
  - _private/ch2-data-draft.ts
  - _private/done/claude-intro.html
  - _private/done/筆記.html
  - _private/ch1-new york travel.html
  - src/modules/chapters/data/ch1.ts
tests:
  - src/__tests__/SectionQuickNav.test.ts
  - tests/e2e/app-shell.smoke.spec.ts
  - tests/e2e/ch3.smoke.spec.ts
  - src/__tests__/ChapterViewDynamic.test.ts
  - src/__tests__/ChapterView.test.ts
  - tests/e2e/ch2.smoke.spec.ts
-->

---
### Requirement: Ch2 header level and topic tags are empty

Ch2 `headerLevelTag` and `headerTopicTag` SHALL be empty strings. No level or topic badge elements SHALL render in the Ch2 header.

#### Scenario: No badge rendered for empty tag
- **WHEN** the user visits `/ch2`
- **THEN** the header area shows no coloured badge for level or topic

<!-- @trace
source: add-ch2-dynamic-nav
updated: 2026-05-22
code:
  - src/modules/chapters/data/ch3.ts
  - _private/discuss.txt
  - _private/propose.md
  - src/modules/chapters/ChapterView.vue
  - _private/done/spectraYaml.md
  - _private/index.html
  - src/modules/chapters/types.ts
  - _private/done/claudeCli.md
  - src/shared/components/SectionQuickNav.vue
  - src/modules/chapters/data/ch2.ts
  - src/shared/config/chapters.ts
  - _private/ch2-data-draft.ts
  - _private/done/claude-intro.html
  - _private/done/筆記.html
  - _private/ch1-new york travel.html
  - src/modules/chapters/data/ch1.ts
tests:
  - src/__tests__/SectionQuickNav.test.ts
  - tests/e2e/app-shell.smoke.spec.ts
  - tests/e2e/ch3.smoke.spec.ts
  - src/__tests__/ChapterViewDynamic.test.ts
  - src/__tests__/ChapterView.test.ts
  - tests/e2e/ch2.smoke.spec.ts
-->

---
### Requirement: Ch2 has a full-text bilingual article with 10 scenes

Ch2 SHALL have a `scenes` array containing exactly 10 bilingual scene objects. Each scene SHALL have an `id` (scene-01 through scene-10), a bilingual title (`titleZh`, `titleEn`), an array of `sentences` each with `en` and `tc` fields, and a `tags` array. Key vocabulary terms in English sentences SHALL use `hl()` to create underlined links to their corresponding vocab/phrases card ids.

#### Scenario: Full-text section is rendered

- **WHEN** the user visits `/ch2`
- **THEN** the `#ch2-section-bilingual` section is visible
- **THEN** the section heading contains "中英對照全文"
- **THEN** 10 scene blocks with `data-testid` matching `scene-01` through `scene-10` are present

#### Scenario: Quick-nav shows 4 buttons including 全文

- **WHEN** the user visits `/ch2`
- **THEN** the quick-nav bar shows exactly 4 buttons in order: 全文, 單字, 片語, 句型

#### Scenario: Scenes contain bilingual sentences with vocab links

- **WHEN** the user views the full-text section on `/ch2`
- **THEN** each scene block shows at least one English sentence paired with a Chinese translation
- **THEN** at least one underlined `data-target` span links to a vocab or phrases card id (e.g., `vocab-fills-the-gaps`, `vocab-go-silent`)

<!-- @trace
source: add-ch2-bilingual-text
updated: 2026-05-22
code:
  - src/shared/config/chapters.ts
  - _private/done/筆記.html
  - _private/ch2-data-draft.ts
  - _private/done/spectraYaml.md
  - _private/ch1-new york travel.html
  - _private/index.html
  - src/modules/chapters/data/ch3.ts
  - src/modules/chapters/ChapterView.vue
  - _private/propose.md
  - _private/done/claudeCli.md
  - src/modules/chapters/data/ch2.ts
  - src/modules/chapters/types.ts
  - _private/discuss.txt
  - src/shared/components/SectionQuickNav.vue
  - src/modules/chapters/data/ch1.ts
  - _private/done/claude-intro.html
tests:
  - src/__tests__/ChapterView.test.ts
  - tests/e2e/ch3.smoke.spec.ts
  - src/__tests__/SectionQuickNav.test.ts
  - tests/e2e/ch2.smoke.spec.ts
  - src/__tests__/ChapterViewDynamic.test.ts
  - tests/e2e/app-shell.smoke.spec.ts
-->