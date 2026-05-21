# chapter-data-architecture Specification

## Purpose

TBD - created by archiving change 'migrate-chapters-to-data-driven'. Update Purpose after archive.

## Requirements

### Requirement: Chapter content data SHALL live in standalone TypeScript modules

Each chapter's content (scenes, vocabulary groups, phrases, sentence breakdowns, header metadata, optional MP3 source) SHALL live in a dedicated TypeScript module under `src/modules/chapters/data/<chapter-id>.ts`. The module SHALL `export default` an object that conforms to the `ChapterData` interface defined in `src/modules/chapters/types.ts`. Chapter view components SHALL NOT contain content data inline.

#### Scenario: Ch1 data module exists and matches contract

- **WHEN** the module `src/modules/chapters/data/ch1.ts` is imported
- **THEN** its default export is an object that satisfies the `ChapterData` type
- **AND** the object contains `scenes`, `vocabGroups`, `phrases`, `breakdowns`, plus header metadata fields

#### Scenario: View components do not embed content data

- **WHEN** any file under `src/modules/chapters/` (excluding `data/**`) is inspected
- **THEN** it does NOT declare a `const scenes`, `const vocabGroups`, `const phrases`, or `const breakdowns` array literal
- **AND** all chapter content reaches the view through props or dynamic import of a data module

##### Example: ch1 data module minimum content

| Field         | Minimum size         |
| ------------- | -------------------- |
| `scenes`      | 15 entries           |
| `vocabGroups` | 6 entries            |
| `phrases`     | 12 entries           |
| `breakdowns`  | 29 entries           |


<!-- @trace
source: migrate-chapters-to-data-driven
updated: 2026-05-22
code:
  - src/modules/chapters/data/ch3.ts
  - _private/discuss.txt
  - _private/ch1-new york travel.html
  - _private/propose.md
  - src/modules/chapters/types.ts
  - _private/done/claudeCli.md
  - src/shared/components/SectionQuickNav.vue
  - src/modules/chapters/ChapterView.vue
  - _private/done/claude-intro.html
  - _private/done/spectraYaml.md
  - _private/index.html
  - _private/done/筆記.html
  - _private/ch2-data-draft.ts
  - src/modules/chapters/data/ch1.ts
  - src/shared/config/chapters.ts
  - src/modules/chapters/data/ch2.ts
tests:
  - src/__tests__/ChapterView.test.ts
  - src/__tests__/SectionQuickNav.test.ts
  - tests/e2e/ch2.smoke.spec.ts
  - src/__tests__/ChapterViewDynamic.test.ts
  - tests/e2e/app-shell.smoke.spec.ts
  - tests/e2e/ch3.smoke.spec.ts
-->

---
### Requirement: A generic ChapterView SHALL render any chapter from its data module

The project SHALL provide a generic `src/modules/chapters/ChapterView.vue` component that accepts a `id: string` prop (the chapter identifier). On mount, the component SHALL find the corresponding entry in the chapters config, invoke its `dataLoader()` function, await the returned `ChapterData`, and render the chapter using the same layout shape as the previous Ch1-specific view (header, MP3 player when `mp3Src` present, section quick-nav, 4 main sections with stable anchor ids, BackToWordFab, BackToTopFab). No chapter-specific view component (e.g. `Ch1View.vue`) SHALL remain after this change.

#### Scenario: Mounting ChapterView with id="ch1" renders the same content as before migration

- **WHEN** `ChapterView` is mounted with `props.id = 'ch1'`
- **THEN** after the dataLoader resolves, the DOM contains exactly 15 scene blocks, 6 vocabulary group headers, 12 phrase cards, and at least 29 sentence breakdown cards
- **AND** the four section anchor ids `ch1-section-bilingual`, `ch1-section-vocabulary`, `ch1-section-phrases`, `ch1-section-breakdown` exist

#### Scenario: Section anchor ids are derived from the chapter id, not hardcoded to "ch1"

- **WHEN** `ChapterView` is mounted with `props.id = 'chX'` (any chapter id)
- **THEN** the four section anchor ids are `chX-section-bilingual`, `chX-section-vocabulary`, `chX-section-phrases`, `chX-section-breakdown`

#### Scenario: Unknown chapter id surfaces a not-found message instead of crashing

- **WHEN** `ChapterView` is mounted with an id that has no entry in chapters config
- **THEN** the component renders a single human-readable error message (e.g. "找不到此章節")
- **AND** no exception propagates to the console


<!-- @trace
source: migrate-chapters-to-data-driven
updated: 2026-05-22
code:
  - src/modules/chapters/data/ch3.ts
  - _private/discuss.txt
  - _private/ch1-new york travel.html
  - _private/propose.md
  - src/modules/chapters/types.ts
  - _private/done/claudeCli.md
  - src/shared/components/SectionQuickNav.vue
  - src/modules/chapters/ChapterView.vue
  - _private/done/claude-intro.html
  - _private/done/spectraYaml.md
  - _private/index.html
  - _private/done/筆記.html
  - _private/ch2-data-draft.ts
  - src/modules/chapters/data/ch1.ts
  - src/shared/config/chapters.ts
  - src/modules/chapters/data/ch2.ts
tests:
  - src/__tests__/ChapterView.test.ts
  - src/__tests__/SectionQuickNav.test.ts
  - tests/e2e/ch2.smoke.spec.ts
  - src/__tests__/ChapterViewDynamic.test.ts
  - tests/e2e/app-shell.smoke.spec.ts
  - tests/e2e/ch3.smoke.spec.ts
-->

---
### Requirement: chapters config SHALL declare a per-chapter dataLoader

The `ChapterEntry` interface in `src/shared/config/chapters.ts` SHALL include a `dataLoader: () => Promise<{ default: ChapterData }>` field. Each entry SHALL define its own dataLoader as a dynamic `import()` of the chapter's data module, enabling Vite to code-split the chapter content into its own chunk.

#### Scenario: ChapterEntry has dataLoader field

- **WHEN** the `chapters` array is inspected
- **THEN** every entry has a `dataLoader` field of type `() => Promise<{ default: ChapterData }>`

#### Scenario: dataLoader resolves to the matching data module

- **WHEN** the ch1 entry's `dataLoader()` is invoked
- **THEN** the returned promise resolves to the module at `src/modules/chapters/data/ch1.ts`
- **AND** the resolved `default` export satisfies the `ChapterData` type

##### Example: ch1 entry shape

```ts
{
  id: 'ch1',
  path: '/ch1',
  shortLabel: 'Ch1',
  titleZh: '我的紐約之旅',
  titleEn: 'My Trip to New York City · Slow English Podcast B1',
  dataLoader: () => import('../../modules/chapters/data/ch1'),
}
```


<!-- @trace
source: migrate-chapters-to-data-driven
updated: 2026-05-22
code:
  - src/modules/chapters/data/ch3.ts
  - _private/discuss.txt
  - _private/ch1-new york travel.html
  - _private/propose.md
  - src/modules/chapters/types.ts
  - _private/done/claudeCli.md
  - src/shared/components/SectionQuickNav.vue
  - src/modules/chapters/ChapterView.vue
  - _private/done/claude-intro.html
  - _private/done/spectraYaml.md
  - _private/index.html
  - _private/done/筆記.html
  - _private/ch2-data-draft.ts
  - src/modules/chapters/data/ch1.ts
  - src/shared/config/chapters.ts
  - src/modules/chapters/data/ch2.ts
tests:
  - src/__tests__/ChapterView.test.ts
  - src/__tests__/SectionQuickNav.test.ts
  - tests/e2e/ch2.smoke.spec.ts
  - src/__tests__/ChapterViewDynamic.test.ts
  - tests/e2e/app-shell.smoke.spec.ts
  - tests/e2e/ch3.smoke.spec.ts
-->

---
### Requirement: Vue Router SHALL register chapter routes from the chapters config

`src/app/router/index.ts` SHALL build chapter routes by iterating over the `chapters` config (one route per entry). Each generated route SHALL use `path: chapter.path`, `name: chapter.id`, the generic ChapterView as the lazy-loaded component, and inject the chapter id into the component via the `props` route option. No chapter id, path, or title SHALL be hardcoded in `router/index.ts` itself.

#### Scenario: chapter routes come from the chapters config

- **WHEN** `router.getRoutes()` is inspected
- **THEN** for every entry in `chapters`, there is exactly one route whose `path` equals `entry.path` and whose `name` equals `entry.id`

#### Scenario: Chapter route resolves to ChapterView with injected id

- **WHEN** the user visits `/ch1`
- **THEN** the route matches a record whose component is `ChapterView`
- **AND** the component receives `id="ch1"` as a prop

#### Scenario: router/index.ts is config-driven

- **WHEN** `src/app/router/index.ts` is inspected
- **THEN** the file does NOT contain literal chapter ids (e.g. the string `'ch1'`) or chapter paths (e.g. the string `'/ch1'`)
- **AND** all chapter-related routes are produced by mapping over the imported `chapters` array


<!-- @trace
source: migrate-chapters-to-data-driven
updated: 2026-05-22
code:
  - src/modules/chapters/data/ch3.ts
  - _private/discuss.txt
  - _private/ch1-new york travel.html
  - _private/propose.md
  - src/modules/chapters/types.ts
  - _private/done/claudeCli.md
  - src/shared/components/SectionQuickNav.vue
  - src/modules/chapters/ChapterView.vue
  - _private/done/claude-intro.html
  - _private/done/spectraYaml.md
  - _private/index.html
  - _private/done/筆記.html
  - _private/ch2-data-draft.ts
  - src/modules/chapters/data/ch1.ts
  - src/shared/config/chapters.ts
  - src/modules/chapters/data/ch2.ts
tests:
  - src/__tests__/ChapterView.test.ts
  - src/__tests__/SectionQuickNav.test.ts
  - tests/e2e/ch2.smoke.spec.ts
  - src/__tests__/ChapterViewDynamic.test.ts
  - tests/e2e/app-shell.smoke.spec.ts
  - tests/e2e/ch3.smoke.spec.ts
-->

---
### Requirement: Highlight helper SHALL be a shared utility module

The `hl(text, targetId)` helper that wraps a word in an underline span with `data-target` (used to make article words clickable for the vocab backlink feature) SHALL live in `src/modules/chapters/utils/highlight.ts` as a pure exported function. It SHALL NOT be redeclared inside chapter data modules or view components.

#### Scenario: hl helper exists and produces consistent output

- **WHEN** the module `src/modules/chapters/utils/highlight.ts` is imported
- **THEN** it exports a function `hl(text: string, targetId: string): string`
- **AND** `hl('head to', 'vocab-head-to')` returns a string that contains `data-target="vocab-head-to"` and the text `head to`

##### Example: hl output structure

- **GIVEN** `text = "head to"` and `targetId = "vocab-head-to"`
- **WHEN** `hl(text, targetId)` is called
- **THEN** the returned string is `<span data-target="vocab-head-to" class="underline decoration-terracotta underline-offset-2 cursor-pointer hover:text-terracotta transition-colors">head to</span>`


<!-- @trace
source: migrate-chapters-to-data-driven
updated: 2026-05-22
code:
  - src/modules/chapters/data/ch3.ts
  - _private/discuss.txt
  - _private/ch1-new york travel.html
  - _private/propose.md
  - src/modules/chapters/types.ts
  - _private/done/claudeCli.md
  - src/shared/components/SectionQuickNav.vue
  - src/modules/chapters/ChapterView.vue
  - _private/done/claude-intro.html
  - _private/done/spectraYaml.md
  - _private/index.html
  - _private/done/筆記.html
  - _private/ch2-data-draft.ts
  - src/modules/chapters/data/ch1.ts
  - src/shared/config/chapters.ts
  - src/modules/chapters/data/ch2.ts
tests:
  - src/__tests__/ChapterView.test.ts
  - src/__tests__/SectionQuickNav.test.ts
  - tests/e2e/ch2.smoke.spec.ts
  - src/__tests__/ChapterViewDynamic.test.ts
  - tests/e2e/app-shell.smoke.spec.ts
  - tests/e2e/ch3.smoke.spec.ts
-->

---
### Requirement: Shared chapter UI components SHALL live under src/modules/chapters/components/

The chapter-presentation components `SceneBlock`, `WordTag`, `PhraseCard`, `SentenceBreakdown` SHALL live in `src/modules/chapters/components/` (not in `src/modules/ch1/components/`) since they are designed to be reusable across all chapters. The directory `src/modules/ch1/` SHALL be removed entirely after migration.

#### Scenario: Shared components exist in chapters module

- **WHEN** the directory `src/modules/chapters/components/` is inspected
- **THEN** it contains `SceneBlock.vue`, `WordTag.vue`, `PhraseCard.vue`, and `SentenceBreakdown.vue`

#### Scenario: ch1-specific module is removed

- **WHEN** the path `src/modules/ch1` is checked
- **THEN** the directory does NOT exist


<!-- @trace
source: migrate-chapters-to-data-driven
updated: 2026-05-22
code:
  - src/modules/chapters/data/ch3.ts
  - _private/discuss.txt
  - _private/ch1-new york travel.html
  - _private/propose.md
  - src/modules/chapters/types.ts
  - _private/done/claudeCli.md
  - src/shared/components/SectionQuickNav.vue
  - src/modules/chapters/ChapterView.vue
  - _private/done/claude-intro.html
  - _private/done/spectraYaml.md
  - _private/index.html
  - _private/done/筆記.html
  - _private/ch2-data-draft.ts
  - src/modules/chapters/data/ch1.ts
  - src/shared/config/chapters.ts
  - src/modules/chapters/data/ch2.ts
tests:
  - src/__tests__/ChapterView.test.ts
  - src/__tests__/SectionQuickNav.test.ts
  - tests/e2e/ch2.smoke.spec.ts
  - src/__tests__/ChapterViewDynamic.test.ts
  - tests/e2e/app-shell.smoke.spec.ts
  - tests/e2e/ch3.smoke.spec.ts
-->

---
### Requirement: All previously verified Ch1 behaviors SHALL remain intact

The migration SHALL preserve every observable behavior of the Ch1 page documented by the prior Ch1View test suite — scene count, header content, anchor ids, WordTag count, sentence breakdown count, quick-nav integration, BackToTopFab integration, reading bookmark on mount, underlined-word backlink interaction — without regression.

#### Scenario: Ch1 scene count preserved

- **WHEN** the user visits `/ch1`
- **THEN** the DOM contains exactly 15 elements matching `[data-testid^="scene-"]`

#### Scenario: Ch1 anchor ids preserved

- **WHEN** the user visits `/ch1`
- **THEN** elements with ids `vocab-layover`, `vocab-to-have-had`, `vocab-used-to`, `vocab-bring-back` exist in the DOM (the same anchor ids the prior change captured)

#### Scenario: Ch1 quick-nav integration preserved

- **WHEN** the user visits `/ch1`
- **THEN** an element with `data-testid="ch1-quick-nav"` renders below the header
- **AND** it contains 4 buttons whose `data-testid` values are `quick-nav-ch1-section-bilingual`, `quick-nav-ch1-section-vocabulary`, `quick-nav-ch1-section-phrases`, `quick-nav-ch1-section-breakdown`

#### Scenario: Ch1 BackToTopFab integration preserved

- **WHEN** the user visits `/ch1`
- **THEN** the ChapterView mounts a `BackToTopFab` component whose anchor element is the quick-nav root

<!-- @trace
source: migrate-chapters-to-data-driven
updated: 2026-05-22
code:
  - src/modules/chapters/data/ch3.ts
  - _private/discuss.txt
  - _private/ch1-new york travel.html
  - _private/propose.md
  - src/modules/chapters/types.ts
  - _private/done/claudeCli.md
  - src/shared/components/SectionQuickNav.vue
  - src/modules/chapters/ChapterView.vue
  - _private/done/claude-intro.html
  - _private/done/spectraYaml.md
  - _private/index.html
  - _private/done/筆記.html
  - _private/ch2-data-draft.ts
  - src/modules/chapters/data/ch1.ts
  - src/shared/config/chapters.ts
  - src/modules/chapters/data/ch2.ts
tests:
  - src/__tests__/ChapterView.test.ts
  - src/__tests__/SectionQuickNav.test.ts
  - tests/e2e/ch2.smoke.spec.ts
  - src/__tests__/ChapterViewDynamic.test.ts
  - tests/e2e/app-shell.smoke.spec.ts
  - tests/e2e/ch3.smoke.spec.ts
-->