# ch3-content Specification (Delta)

## MODIFIED Requirements

### Requirement: Ch3 has a full-text bilingual article with 10 scenes

Ch3 SHALL have a `scenes` array containing exactly 5 bilingual scene objects. Each scene SHALL have an `id` (scene-01 through scene-05), a bilingual title (`titleZh`, `titleEn`), an array of `sentences` each with `en` and `tc` fields, and a `tags` array. The chapter header SHALL display `headerTitleEn` "Talking About Your Future Plans Naturally" and `headerTitleZh` "用自然的未來式談你的計畫". The 5 scenes SHALL cover: (01) Talking About Plans with Going To, (02) Using Present Continuous for Future, (03) Talking About Hopes and Goals, (04) Your Future in Real Life, (05) Feeling Confident About the Future. Vocabulary words matching tags entries SHALL be wrapped with hl() per the hl() specification in design.md.

#### Scenario: User navigates to Ch3

- **WHEN** the user navigates to `/ch3`
- **THEN** ChapterView renders with the new ch3 data
- **THEN** the page header displays "Talking About Your Future Plans Naturally" as the English title
- **THEN** exactly 5 scene blocks are present

### Requirement: Ch3 quick-nav shows 3 buttons

Ch3 quick-nav SHALL show exactly 2 buttons (全文 and 單字) because `scenes` and `vocabGroups` are non-empty, while `phrases` and `breakdowns` are empty arrays.

#### Scenario: Quick-nav shows 全文 and 單字

- **WHEN** the user visits `/ch3`
- **THEN** the quick-nav bar shows exactly 2 buttons in order: 全文, 單字
- **THEN** no 片語 button is present

### Requirement: Ch3 has vocabulary groups and a phrase card

Ch3 SHALL have a `vocabGroups` array with exactly 2 groups: "補充詞彙・學習心態" (3 items: possibility, pace, train) and "補充詞彙・個人特質" (3 items: creative, opinionated, insightful). The `phrases` array SHALL be empty. The `breakdowns` array SHALL be empty.

#### Scenario: Vocabulary section is rendered

- **WHEN** the user visits `/ch3`
- **THEN** the vocabulary section contains exactly 2 groups
- **THEN** no phrases section is rendered

### Requirement: Ch3 displays source attribution

Ch3 SHALL include a `sourceSrc` field set to `https://www.youtube.com/watch?v=FDToep-SPWE` so the header renders an attribution link to the source video.

#### Scenario: Source link is present in header

- **WHEN** the user visits `/ch3`
- **THEN** the chapter header contains a link to the YouTube source video for FDToep-SPWE
