## ADDED Requirements

### Requirement: Ch3 chapter page is accessible at /ch3

The system SHALL register Ch3 in the chapter registry so Vue Router auto-generates a route at `/ch3` that renders `ChapterView` with `id="ch3"`.

#### Scenario: User navigates to Ch3

- **WHEN** the user navigates to `/ch3`
- **THEN** `ChapterView` renders with the Ch3 data and displays the chapter title

#### Scenario: Ch3 route appears in chapter registry

- **WHEN** the app initialises
- **THEN** the chapter registry contains an entry with `id: 'ch3'` and `path: '/ch3'`

### Requirement: Ch3 has a full-text bilingual article with 10 scenes

Ch3 SHALL have a `scenes` array containing exactly 10 bilingual scene objects. Each scene SHALL have an `id` (scene-01 through scene-10), a bilingual title (`titleZh`, `titleEn`), an array of `sentences` each with `en` and `tc` fields, and a `tags` array. The 10 scenes SHALL cover four thematic sections from the podcast transcript: traditional study limitations (scenes 01–03), slow listening and shadowing technique (scenes 04–06), overcoming hesitation (scenes 07–08), and consistency practice (scenes 09–10).

#### Scenario: Full-text section is rendered

- **WHEN** the user visits `/ch3`
- **THEN** the `#ch3-section-bilingual` section is visible
- **THEN** the section heading contains "中英對照全文"
- **THEN** 10 scene blocks with `data-testid` matching `scene-01` through `scene-10` are present

### Requirement: Ch3 quick-nav shows 3 buttons

Ch3 SHALL render exactly 3 quick-nav buttons because `scenes`, `vocabGroups`, and `phrases` are all non-empty, while `breakdowns` is an empty array (no sentence breakdown section in this change).

#### Scenario: Quick-nav shows 全文, 單字, 片語

- **WHEN** the user visits `/ch3`
- **THEN** the quick-nav bar shows exactly 3 buttons in order: 全文, 單字, 片語

### Requirement: Ch3 has vocabulary groups and a phrase card

Ch3 SHALL have a `vocabGroups` array with exactly 4 groups containing a combined total of 23 vocabulary items, and a `phrases` array with exactly 1 phrase card (`speak/think out loud`). The `breakdowns` array SHALL be empty.

#### Scenario: Vocabulary and phrase sections are rendered

- **WHEN** the user visits `/ch3`
- **THEN** the `#ch3-section-vocabulary` section is visible
- **THEN** the vocabulary section contains exactly 4 groups
- **THEN** the `#ch3-section-phrases` section is visible with 1 phrase card

### Requirement: Ch3 displays source attribution

Ch3 SHALL include a `sourceSrc` field pointing to the YouTube source URL so the header renders an attribution link.

#### Scenario: Source link is present in header

- **WHEN** the user visits `/ch3`
- **THEN** the chapter header contains a link that navigates to the YouTube source video
