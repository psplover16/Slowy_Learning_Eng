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

Ch2 SHALL have a `scenes` array containing exactly 10 bilingual scene objects. Each scene SHALL have an `id` (scene-01 through scene-10), a bilingual title (`titleZh`, `titleEn`), an array of `sentences` each with `en` and `tc` fields, and a `tags` array. Key vocabulary terms in English sentences SHALL use `hl()` to create underlined links to their corresponding vocab/phrases card ids. The article SHALL preserve the main transcript content instead of a shortened summary. The 10 scenes SHALL cover the content groups listed for Ch2 in `_private/propose.md`: listening as the beginning of language learning, grammar/vocabulary memorization as common but incomplete starting questions, the baby language-learning analogy, exposure without full understanding, calm slow listening, music/familiarity, listening preparing speaking, memory built through listening, repetition before perfection, child-like repetition, shadowing rhythm practice, simple repeated language, slow confident speaking, understanding before fluency, and passive exposure.

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

#### Scenario: Ch2 transcript coverage is complete enough for learning

- **WHEN** the Ch2 `scenes` text is inspected
- **THEN** the English text SHALL include coverage of listening-first learning, repeated exposure, repetition before perfection, shadowing practice, understanding before fluency, and passive learning
- **THEN** the English text SHALL NOT collapse those content groups into a short summary

##### Example: required Ch2 topic coverage

| Topic group | Required coverage signal |
| --- | --- |
| listening-first learning | English learning begins through listening, not only grammar rules or vocabulary lists |
| vocabulary memorization question | The opening text preserves the learner question about how many words to memorize |
| repeated exposure | the brain learns from exposure even without full understanding |
| repetition before perfection | real speaking comes from repetition instead of waiting for perfect speech |
| driving action analogy | the text preserves the idea that at first you think about every action, then repetition makes the action automatic |
| confidence during understanding stage | the text preserves that confidence can still be absent while the brain is working, and that rushing before understanding creates fear and confusion |
| shadowing practice | the learner listens and repeats immediately while copying rhythm |
| understanding before fluency | understanding grows before easy speaking appears |
| passive learning | repeated relaxed listening creates familiarity, comfort, and confidence |

#### Scenario: Ch2 subtitle artifacts are conservatively corrected

- **WHEN** the Ch2 English text is inspected
- **THEN** obvious subtitle artifacts SHALL be corrected without adding unrelated new arguments
- **THEN** the text SHALL NOT contain raw broken fragments from the source proposal such as `fram repeating more`, `habits are built t proof repetition`, `The I push themselves`, or `H sounds anymore`

#### Scenario: Ch2 transcript signals are not omitted

- **WHEN** the Ch2 `scenes` text is inspected
- **THEN** the English text SHALL preserve representative transcript signals from `_private/discuss.txt` beyond topic summaries
- **THEN** those signals SHALL include the opening memorization question, the listening-to-speaking bridge, child repetition freedom, the driving action analogy, the confidence-during-understanding-stage signal, repeat-short/easy/often guidance, slow-speaking control, passive learning, active study limits, and the final preparation/trust guidance
- **THEN** repeated transcript wording such as `They ask` SHALL be preserved when it is part of the original teaching rhythm

#### Scenario: Ch2 source transcript is normalized before omission checks

- **WHEN** Ch2 content coverage is checked against `_private/discuss.txt`
- **THEN** the source transcript SHALL have subtitle line breaks removed and consecutive whitespace collapsed before omission-prone signals are checked
- **AND** the normalized Ch2 article text SHALL contain the opening question signals, the driving action analogy, and the confidence-during-understanding-stage signal found in the normalized source transcript

#### Scenario: Ch2 source transcript sentences are fully covered

- **WHEN** Ch2 content coverage is checked against `_private/discuss.txt`
- **THEN** every source transcript sentence with at least four words SHALL be represented in the normalized Ch2 article text after applying explicit subtitle correction mappings
- **AND** the explicit correction mappings SHALL only cover mechanical subtitle artifacts, grammar fixes, spelling fixes, capitalization fixes, and punctuation or sentence-boundary fixes

<!-- @trace
source: correct-ch2-ch3-subtitle-content
updated: 2026-05-23
code:
  - _private/propose.md
  - src/modules/chapters/data/ch3.ts
  - src/modules/chapters/utils/highlight.ts
  - src/shared/components/NavBar.vue
  - src/shared/config/chapters.ts
  - src/modules/chapters/data/ch4.ts
  - src/modules/grammar/views/GrammarView.vue
  - _private/discuss.txt
tests:
  - src/__tests__/chapterDataModule.test.ts
  - src/__tests__/GrammarView.test.ts
  - src/__tests__/ChapterView.test.ts
  - tests/e2e/ch3.smoke.spec.ts
  - tests/e2e/app-shell.smoke.spec.ts
-->