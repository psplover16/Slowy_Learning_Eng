## ADDED Requirements

### Requirement: Navigation buttons reflect only sections with data

`ChapterView` SHALL compute `quickNavSections` by filtering sections whose backing data array is non-empty. A button for a section whose array is empty SHALL NOT be rendered.

#### Scenario: All four sections present
- **WHEN** a chapter has non-empty `scenes`, `vocabGroups`, `phrases`, and `breakdowns`
- **THEN** four navigation buttons are rendered: 全文, 單字, 片語, 句型

#### Scenario: No full-text article
- **WHEN** a chapter has `scenes: []` and non-empty `vocabGroups`, `phrases`, `breakdowns`
- **THEN** three navigation buttons are rendered: 單字, 片語, 句型; no 全文 button is present

##### Example: Ch2 navigation buttons
- **GIVEN** ch2 data with `scenes=[]`, `vocabGroups=[...]`, `phrases=[...]`, `breakdowns=[...]`
- **WHEN** the user visits `/ch2`
- **THEN** quick-nav bar shows exactly: 單字, 片語, 句型

### Requirement: Section blocks render only when their data is non-empty

Each of the four content sections in `ChapterView` SHALL be guarded by `v-if`. A section whose data array is empty SHALL produce no DOM element.

#### Scenario: Bilingual section hidden when scenes is empty
- **WHEN** `chapterData.scenes.length === 0`
- **THEN** the `<section id="*-section-bilingual">` element is not present in the DOM

#### Scenario: Vocabulary section hidden when vocabGroups is empty
- **WHEN** `chapterData.vocabGroups.length === 0`
- **THEN** the vocabulary section element is not present in the DOM

### Requirement: Section numbers auto-increment from 1 based on visible sections

The decorative section number shown in each section header SHALL be the 1-based index of that section among the visible sections only. Numbers SHALL NOT be hardcoded.

#### Scenario: Full chapter numbering
- **WHEN** all four sections are visible
- **THEN** numbers are: 全文=1, 單字=2, 片語=3, 句型=4

#### Scenario: Numbering without full-text
- **WHEN** `scenes` is empty and the remaining three sections are visible
- **THEN** numbers are: 單字=1, 片語=2, 句型=3

##### Example: numbering variants
| Visible sections | 全文 | 單字 | 片語 | 句型 |
|---|---|---|---|---|
| 全文, 單字, 片語, 句型 | 1 | 2 | 3 | 4 |
| 單字, 片語, 句型 | — | 1 | 2 | 3 |
| 單字, 句型 | — | 1 | — | 2 |

### Requirement: Header tag badges are conditionally rendered

`ChapterView` SHALL render `headerLevelTag` and `headerTopicTag` badge elements only when the value is a non-empty string. An empty string SHALL NOT produce a visible badge DOM element.

#### Scenario: Empty level tag produces no badge
- **WHEN** `chapterData.headerLevelTag === ""`
- **THEN** no level badge element is rendered in the chapter header

#### Scenario: Non-empty level tag renders badge
- **WHEN** `chapterData.headerLevelTag` is a non-empty string
- **THEN** a level badge element is rendered with that text
