## ADDED Requirements

### Requirement: Grammar cards SHALL be organized into pedagogical thematic groups

The 18 grammar cards on the `/grammar` route SHALL be partitioned into exactly 7 thematic groups, arranged top-to-bottom in increasing pedagogical complexity. Within each group, cards SHALL appear in the order specified below.

The required group order and member topics are:

1. **Foundation (詞類基礎)**: Parts of Speech
2. **Noun Phrase Family (名詞片語家族)**: Noun Phrase, Relative Clause, Participial Phrase
3. **Verb Tenses (動詞時態)**: used to + V, Present Perfect vs Present Perfect Progressive, Perfect Infinitive (to have + V-pp)
4. **V-ing Patterns (V-ing 後接慣例)**: Preposition + V-ing, while + V-ing
5. **Subordinate Clauses and Time (從屬子句與時間)**: for + duration, if (dual usage), so that
6. **Multi-functional Verbs (多功能動詞)**: Causative Verbs (make/have/get/let), get usage, like usage, prefer
7. **Tone and Comparison (語氣與比較)**: ever, just as...as

#### Scenario: Cards rendered in correct group sequence

- **WHEN** the user visits `/grammar`
- **THEN** the 18 grammar cards appear in the order: Parts of Speech → Noun Phrase → Relative Clause → Participial Phrase → used to + V → Present Perfect vs Progressive → Perfect Infinitive → Preposition + V-ing → while + V-ing → for + duration → if dual usage → so that → Causative Verbs → get usage → like usage → prefer → ever → just as...as

##### Example: First card and last card

- **GIVEN** the `/grammar` page is rendered
- **WHEN** the page is read from top to bottom
- **THEN** the first card is "Parts of Speech" with badge G01
- **AND** the last card is "just as...as" with badge G18

### Requirement: Each thematic group SHALL display a visible section header

A visible section header SHALL appear above the first card of each of the 7 thematic groups. The header SHALL include the group's numeric position (1–7) and its Traditional Chinese name. The header SHALL be visually distinct from grammar cards (different typography, color, or background) so users can perceive group boundaries while scrolling.

#### Scenario: Section headers visible on grammar page

- **WHEN** the user visits `/grammar`
- **THEN** 7 section headers are rendered
- **AND** each header appears immediately above the first card of its group
- **AND** each header includes the group number and Traditional Chinese name

##### Example: Section header content

| Position | Header text |
| -------- | ----------- |
| 1 | 1. 詞類基礎 |
| 2 | 2. 名詞片語家族 |
| 3 | 3. 動詞時態 |
| 4 | 4. V-ing 後接慣例 |
| 5 | 5. 從屬子句與時間 |
| 6 | 6. 多功能動詞 |
| 7 | 7. 語氣與比較 |

### Requirement: Grammar card badges SHALL be numbered consecutively in display order

Each grammar card's badge identifier SHALL follow the pattern `G##` where `##` is a zero-padded two-digit number matching the card's position in the top-to-bottom display order. Badge numbers SHALL be consecutive from G01 through G18 with no gaps and no duplicates.

#### Scenario: Badge numbers match display position

- **WHEN** the user visits `/grammar`
- **THEN** the 1st card has badge "G01", the 2nd "G02", continuing in order to the 18th card with badge "G18"
- **AND** every badge from G01 to G18 appears exactly once

##### Example: Badge-to-topic mapping

| Position | Badge | Topic |
| -------- | ----- | ----- |
| 1 | G01 | Parts of Speech |
| 2 | G02 | Noun Phrase |
| 3 | G03 | Relative Clause |
| 4 | G04 | Participial Phrase |
| 5 | G05 | used to + V |
| 6 | G06 | Present Perfect vs Progressive |
| 7 | G07 | Perfect Infinitive |
| 8 | G08 | Preposition + V-ing |
| 9 | G09 | while + V-ing |
| 10 | G10 | for + duration |
| 11 | G11 | if dual usage |
| 12 | G12 | so that |
| 13 | G13 | Causative Verbs |
| 14 | G14 | get usage |
| 15 | G15 | like usage |
| 16 | G16 | prefer |
| 17 | G17 | ever |
| 18 | G18 | just as...as |
