# ch4-content Specification

## Purpose

TBD - created by archiving change 'add-ch3-future-tense'. Update Purpose after archive.

## Requirements

### Requirement: Ch4 chapter page is accessible at /ch4

The application SHALL render a chapter page at the /ch4 route. The chapter data SHALL be identical to the content previously at /ch3 (傳統學習法為何無法帶來流暢), with all scenes, tags, and vocabGroups preserved unchanged.

#### Scenario: User navigates to Ch4

- **WHEN** the user navigates to `/ch4`
- **THEN** ChapterView renders with ch4 data loaded
- **THEN** the page header title reads "Why Traditional Study Can't Create Fluency" / "傳統學習法為何無法帶來流暢"
- **THEN** all original scenes and vocabulary are visible


<!-- @trace
source: add-ch3-future-tense
updated: 2026-05-23
code:
  - _private/propose.md
  - src/modules/grammar/views/GrammarView.vue
  - src/shared/components/NavBar.vue
  - src/modules/chapters/data/ch3.ts
  - _private/discuss.txt
  - src/shared/config/chapters.ts
  - src/modules/chapters/data/ch4.ts
  - src/modules/chapters/utils/highlight.ts
tests:
  - tests/e2e/app-shell.smoke.spec.ts
  - src/__tests__/GrammarView.test.ts
  - tests/e2e/ch3.smoke.spec.ts
  - src/__tests__/ChapterView.test.ts
  - src/__tests__/chapterDataModule.test.ts
-->

---
### Requirement: Ch4 appears in chapter navigation after Ch3

The chapters array in `src/shared/config/chapters.ts` SHALL include a ch4 entry with id='ch4', path='/ch4', shortLabel='Ch4', positioned after the ch3 entry.

#### Scenario: Ch4 appears as fourth item in navigation

- **WHEN** the app initialises
- **THEN** the chapter registry contains entries in order: ch1, ch2, ch3, ch4
- **THEN** ch4 entry has path '/ch4' and dataLoader pointing to ch4 data file

<!-- @trace
source: add-ch3-future-tense
updated: 2026-05-23
code:
  - _private/propose.md
  - src/modules/grammar/views/GrammarView.vue
  - src/shared/components/NavBar.vue
  - src/modules/chapters/data/ch3.ts
  - _private/discuss.txt
  - src/shared/config/chapters.ts
  - src/modules/chapters/data/ch4.ts
  - src/modules/chapters/utils/highlight.ts
tests:
  - tests/e2e/app-shell.smoke.spec.ts
  - src/__tests__/GrammarView.test.ts
  - tests/e2e/ch3.smoke.spec.ts
  - src/__tests__/ChapterView.test.ts
  - src/__tests__/chapterDataModule.test.ts
-->