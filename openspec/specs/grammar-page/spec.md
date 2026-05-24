# grammar-page Specification

## Purpose

TBD - created by archiving change 'reorder-grammar-by-pedagogy'. Update Purpose after archive.

## Requirements

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


<!-- @trace
source: reorder-grammar-by-pedagogy
updated: 2026-05-20
code:
  - _private/筆記.md
  - src/modules/grammar/views/GrammarView.vue
tests:
  - src/__tests__/GrammarView.test.ts
-->

---
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


<!-- @trace
source: reorder-grammar-by-pedagogy
updated: 2026-05-20
code:
  - _private/筆記.md
  - src/modules/grammar/views/GrammarView.vue
tests:
  - src/__tests__/GrammarView.test.ts
-->

---
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

<!-- @trace
source: reorder-grammar-by-pedagogy
updated: 2026-05-20
code:
  - _private/筆記.md
  - src/modules/grammar/views/GrammarView.vue
tests:
  - src/__tests__/GrammarView.test.ts
-->

---
### Requirement: Grammar page displays multi-container layout

The grammar route (`/grammar`) SHALL render a vertically scrollable list of grammar topic containers. Each container covers one grammar point and is visually distinct (card style with border).

#### Scenario: Grammar page renders at least the initial two topics

- **WHEN** the user visits `/grammar`
- **THEN** two grammar cards are visible: "英語常見詞性介紹" and "like 的全用法"


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
### Requirement: Each grammar container includes structured content

Each grammar card SHALL contain the following sections where applicable:

- Part-of-speech / category badge
- Usage explanation in Traditional Chinese
- Formula block (displayed with teal background, Newsreader font)
- Example sentences (English + Chinese translation, italic)
- Usage comparison table (when multiple forms exist)
- Notes / common confusions section

#### Scenario: like card content completeness

- **WHEN** the user views the "like 的全用法" container
- **THEN** the card covers all three uses: verb (喜歡), preposition (像), and conjunction (`feel like` + clause)
- **THEN** each use includes at least one English example sentence and its Chinese translation

#### Scenario: Parts of speech card content completeness

- **WHEN** the user views the "英語常見詞性介紹" container
- **THEN** the card covers noun (n.), verb (v.), adjective (adj.), adverb (adv.), preposition (prep.), conjunction (conj.), and pronoun (pron.)
- **THEN** each part of speech includes its Chinese name, a brief usage explanation, and at least one example


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
### Requirement: Grammar page does NOT include article-specific sentence breakdowns

Article-level grammar notes (e.g., participial phrases from Ch1, causative verbs) SHALL remain in the article content page, not in the grammar route.

#### Scenario: Grammar page scope boundary

- **WHEN** the user visits `/grammar`
- **THEN** no Ch1-specific sentence breakdown cards (e.g., "The first thing we did was head to bed") appear on this page

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
### Requirement: G19 grammar card for three natural future forms is present in Section 3

The grammar page SHALL include a GrammarCard with badge="G19" and title="三種自然未來式：going to / 現在進行式 / will" in Section 3 (動詞時態), positioned after the G07 card. The card SHALL display a comparison table with 3 rows (be going to, Present Continuous for future, will) and a futureFormsTable data array with 3 entries in the script.

#### Scenario: G19 card is visible on grammar page

- **WHEN** the user navigates to `/grammar`
- **THEN** Section 3 contains a card with badge "G19"
- **THEN** the card title reads "三種自然未來式：going to / 現在進行式 / will"
- **THEN** the comparison table shows exactly 3 rows
- **THEN** G01 through G18 cards are unmodified and visible

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
### Requirement: MissHoney grammar supplements are conservative

The grammar page SHALL accept MissHoney proofread grammar supplements only when the grammar topic clearly matches an existing grammar card. Unmatched or uncertain grammar points SHALL remain inside the source video page's grammar section.

#### Scenario: Clear grammar match supplements existing card

- **WHEN** A1 ch1 proofread output contains a grammar point that clearly matches an existing grammar card topic
- **THEN** the grammar page keeps the existing card
- **AND** the matched card receives a supplemental example or explanation from the MissHoney source
- **AND** no duplicate grammar card is created for the same topic

##### Example: Relative clause supplement

- **GIVEN** the grammar page already has a `Relative Clause` card
- **WHEN** MissHoney proofread output contains a `which` relative clause example
- **THEN** the `Relative Clause` card can include the `which` example as a supplement
- **AND** the grammar page does not create another `Relative Clause` card

#### Scenario: Uncertain grammar classification stays video-local

- **WHEN** A1 ch1 proofread output contains a grammar point that does not clearly match an existing grammar card topic
- **THEN** the grammar point remains in the A1 ch1 video grammar section
- **AND** the grammar page does not receive a new card or group for that uncertain point


<!-- @trace
source: refresh-misshoney-proofread-content-and-navigation
updated: 2026-05-24
code:
  - _private/misshoney/proofread-results/a2/ch1-slow-english-stories-level-a2-listening-a-weird-phone-call.md
  - _private/misshoney/proofread-results/b2/ch7-learn-english-with-slow-interviews-comprehensible-input-b1-interview-practice.md
  - _private/tmp/originalContent/a1/ch16-beginner-english-speaking-practice-real-life-role-play-a1.json
  - _private/tmp/originalContent/a2/ch16-slow-english-podcast-my-day-a2-listening-practice.json
  - _private/tmp/originalContent/b2/ch16-learn-english-with-my-morning-routine-natural-speaking-practice.json
  - _private/tmp/originalContent/b1/ch19-how-to-speak-english-real-life-role-play-b1b2.json
  - _private/tmp/originalContent/a2/ch22-learn-english-at-home-slow-english.json
  - src/modules/playlists/data/videos/a1/ch10-learn-english-with-slow-interviews-comprehensible-input-a1-sleep-routines.json
  - _private/tmp/originalContent/a2/ch12-grocery-store-essentials-for-a1-a2-beginners.json
  - _private/tmp/originalContent/b1/ch11-slow-english-podcast-for-high-beginners-a2-b1-my-trip-to-the-usa-comprehensible-input.json
  - src/modules/playlists/data/videos/a2/ch27-pronunciation-practice-50-english-words-to-sound-natural.json
  - _private/tmp/originalContent/a1/ch2-beginner-english-slow-listening-practice-talking-about-me.json
  - _private/misshoney/proofread-results/a1/ch4-practice-slow-english-for-a1-beginners-talk-about-family.md
  - _private/misshoney/proofread-results/a2/ch23-how-to-actually-learn-english-10-tips-that-really-work.md
  - _private/misshoney/proofread-results/b2/ch15-learn-english-by-making-mistakes-slow-english-podcast.md
  - _private/misshoney/proofread-results/a1/ch10-learn-english-with-slow-interviews-comprehensible-input-a1-sleep-routines.md
  - _private/tmp/originalContent/a1/ch14-how-to-introduce-yourself-in-english-for-beginners.json
  - _private/tmp/originalContent/a2/ch28-learn-in-on-at-naturally-english-listening-practice.json
  - _private/misshoney/proofread-results/a1/ch2-beginner-english-slow-listening-practice-talking-about-me.md
  - src/modules/playlists/data/b2.ts
  - src/modules/playlists/data/videos/b2/ch4-slow-english-for-c1-advanced-dreams.json
  - _private/misshoney/proofread-results/a2/ch2-slow-english-for-a2-high-beginners-how-colors-make-me-feel.md
  - _private/misshoney/proofread-results/b2/ch17-how-she-became-fluent-in-english-intermediate-listening-practice.md
  - _private/筆記.md
  - src/modules/playlists/data/a1.ts
  - _private/misshoney/proofread-results/a2/ch12-grocery-store-essentials-for-a1-a2-beginners.md
  - _private/misshoney/proofread-results/b1/ch13-slow-english-podcast-my-trip-to-puerto-escondido-level-a2.md
  - _private/misshoney/proofread-results/a1/ch14-how-to-introduce-yourself-in-english-for-beginners.md
  - _private/tmp/originalContent/a2/ch21-slow-english-reading-learn-english-with-childrens-books-comprehensible-input.json
  - _private/tmp/originalContent/b2/ch6-slow-english-podcast-my-bus-stories.json
  - src/modules/playlists/data/videos/a1/ch16-beginner-english-speaking-practice-real-life-role-play-a1.json
  - src/modules/playlists/data/videos/b1/ch15-english-sleep-learning-shadowing-positive-affirmations.json
  - src/modules/playlists/data/videos/a2/ch24-sleep-and-learn-english-shadow-positive-affirmations.json
  - src/modules/playlists/data/videos/b1/ch18-english-kitchen-vocabulary-comprehensible-input.json
  - _private/tmp/originalContent/b2/ch9-intermediate-slow-english-podcast-my-trip-to-the-elephant-sanctuarycomprehensible-input.json
  - _private/tmp/originalContent/a2/ch17-asmr-learn-english-while-sleeping-with-relaxing-sounds-slow-english-podcast.json
  - _private/misshoney/proofread-results/b1/ch14-real-english-conversation-life-in-the-usa-vs-life-in-mexico-b1.md
  - scripts/misshoney/proofread-core.d.mts
  - _private/tmp/originalContent/b1/ch14-real-english-conversation-life-in-the-usa-vs-life-in-mexico-b1.json
  - _private/tmp/originalContent/a1/ch12-a-day-in-my-life-slow-english-podcast-a1-present-simple.json
  - _private/misshoney/proofread-results/b2/ch10-real-english-to-speak-when-you-travel-advanced-slow-english-podcast.md
  - _private/tmp/originalContent/b2/ch5-interview-about-childhood-memories-faster-english-podcast-for-intermediate-listening-practice.json
  - src/modules/playlists/data/videos/a2/ch25-learn-english-travel-vlog-for-beginners.json
  - _private/misshoney/proofread-results/a2/ch4-slow-english-podcast-for-a2-b1-intemediate-levels-planning-my-first-trip.md
  - src/modules/playlists/data/videos/a2/ch21-slow-english-reading-learn-english-with-childrens-books-comprehensible-input.json
  - src/modules/playlists/data/videos/a2/ch5-84-english-phrases-for-beginners-speak-like-a-native.json
  - _private/misshoney/proofread-results/a2/ch16-slow-english-podcast-my-day-a2-listening-practice.md
  - _private/misshoney/proofread-results/a2/ch21-slow-english-reading-learn-english-with-childrens-books-comprehensible-input.md
  - _private/misshoney/proofread-results/a1/ch7-slow-english-podcast-for-beginners-talking-about-goals.md
  - _private/misshoney/proofread-results/a2/ch14-learn-english-with-slow-conversations-comprehensible-input-a1-weekend-routines.md
  - _private/misshoney/proofread-results/a2/ch24-sleep-and-learn-english-shadow-positive-affirmations.md
  - _private/tmp/originalContent/b1/ch10-learn-english-with-slow-interviews-comprehensible-input-b1-interview-practice.json
  - _private/tmp/originalContent/b2/ch2-slow-english-for-intermediate-b2-with-subtitles-in-spanish-talking-about-languages.json
  - _private/misshoney/proofread-results/b1/ch10-learn-english-with-slow-interviews-comprehensible-input-b1-interview-practice.md
  - _private/misshoney/proofread-results/b1/ch12-slow-english-podcast-my-trip-to-new-york-city-level-b1.md
  - _private/tmp/originalContent/b2/ch7-learn-english-with-slow-interviews-comprehensible-input-b1-interview-practice.json
  - _private/tmp/originalContent/a1/ch9-a1-beginner-slow-english-podcast-sleep-rest-vocabulary.json
  - scripts/misshoney/proofread-core.mjs
  - _private/tmp/originalContent/a2/ch7-speak-like-a-native-common-abbreviations-slow-english-podcast-for-a2-beginners.json
  - src/modules/playlists/data/videos/b1/ch4-slow-english-podcast-for-a2-b1-intemediate-levels-planning-my-first-trip.json
  - src/modules/playlists/data/videos/a2/ch18-slow-english-podcast-a-day-in-my-life-a2-english-listening-practice.json
  - src/modules/playlists/data/videos/b2/ch3-slow-english-for-intermediate-b2-with-subtitles-in-portuguese-talking-about-languages.json
  - PROJECT_ARCHITECTURE.md
  - _private/misshoney/proofread-results/a1/ch9-a1-beginner-slow-english-podcast-sleep-rest-vocabulary.md
  - src/modules/playlists/data/a2.ts
  - src/modules/playlists/data/videos/a2/ch29-what-you-taught-me-about-hope-slow-english-listening.json
  - src/modules/playlists/data/videos/b1/ch7-interview-about-childhood-memories-faster-english-podcast-for-intermediate-listening-practice.json
  - src/modules/playlists/data/videos/a2/ch12-grocery-store-essentials-for-a1-a2-beginners.json
  - _private/misshoney/proofread-results/b2/ch8-slow-english-podcast-why-am-i-learning-chinese-b2.md
  - src/modules/playlists/data/videos/b1/ch1-slow-english-listening-intermediate-practice-talking-about-my-hobbies.json
  - _private/misshoney/proofread-results/b1/ch15-english-sleep-learning-shadowing-positive-affirmations.md
  - src/modules/playlists/data/videos/b2/ch16-learn-english-with-my-morning-routine-natural-speaking-practice.json
  - _private/tmp/originalContent/b1/ch13-slow-english-podcast-my-trip-to-puerto-escondido-level-a2.json
  - _private/tmp/originalContent/a1/ch13-slow-english-podcast-the-giving-tree-for-beginners-a1a2.json
  - _private/misshoney/proofread-results/b1/ch16-slow-english-podcast-my-trip-to-mexico-city.md
  - _private/tmp/originalContent/b2/ch17-how-she-became-fluent-in-english-intermediate-listening-practice.json
  - _private/misshoney/proofread-results/a2/ch7-speak-like-a-native-common-abbreviations-slow-english-podcast-for-a2-beginners.md
  - _private/tmp/originalContent/b1/ch17-slow-english-practice-airport-essentials-for-traveling.json
  - _private/tmp/originalContent/a2/ch5-84-english-phrases-for-beginners-speak-like-a-native.json
  - _private/tmp/originalContent/b2/ch4-slow-english-for-c1-advanced-dreams.json
  - _private/misshoney/proofread-results/a2/ch3-slow-english-podcast-bus-stories-for-beginners.md
  - src/modules/playlists/data/videos/b1/ch10-learn-english-with-slow-interviews-comprehensible-input-b1-interview-practice.json
  - _private/misshoney/proofread-results/a1/ch6-slow-english-podcast-for-beginners-talking-about-friends.md
  - _private/tmp/originalContent/a2/ch14-learn-english-with-slow-conversations-comprehensible-input-a1-weekend-routines.json
  - _private/tmp/originalContent/b1/ch1-slow-english-listening-intermediate-practice-talking-about-my-hobbies.json
  - _private/tmp/originalContent/a2/ch11-the-scariest-beach-day-slow-english-podcast-for-a1-a2-beginners-comprehensible-input.json
  - _private/tmp/originalContent/a2/ch24-sleep-and-learn-english-shadow-positive-affirmations.json
  - _private/tmp/originalContent/b1/ch16-slow-english-podcast-my-trip-to-mexico-city.json
  - _private/tmp/originalContent/a2/ch10-powerful-daily-affirmations-learn-english-and-practice-gratitude-comprehensible-input.json
  - _private/misshoney/proofread-results/a2/ch27-pronunciation-practice-50-english-words-to-sound-natural.md
  - _private/misshoney/proofread-results/a2/ch15-daily-english-affirmations-for-speaking-confidence-fluency-i-am-a-fluent-english-speaker.md
  - _private/misshoney/proofread-results/b1/ch4-slow-english-podcast-for-a2-b1-intemediate-levels-planning-my-first-trip.md
  - _private/tmp/originalContent/a2/ch26-100-essential-english-words-for-daily-life-slow-english-vocabulary.json
  - _private/tmp/originalContent/b1/ch5-job-interview-essentials-slow-english-podcast-for-intermediate-b1.json
  - _private/tmp/originalContent/a1/ch1-slow-english-for-beginners-a1-listening-practice.json
  - src/shared/components/BackToTopFab.vue
  - _private/tmp/originalContent/a1/ch10-learn-english-with-slow-interviews-comprehensible-input-a1-sleep-routines.json
  - _private/tmp/originalContent/b1/ch9-speak-like-a-native-common-english-idioms-slow-english-podcast-for-a2-b1-beginners.json
  - _private/misshoney/proofread-results/a2/ch8-a1-beginner-slow-english-podcast-sleep-rest-vocabulary.md
  - _private/tmp/originalContent/a2/ch27-pronunciation-practice-50-english-words-to-sound-natural.json
  - _private/tmp/originalContent/b1/ch15-english-sleep-learning-shadowing-positive-affirmations.json
  - _private/discuss.txt
  - _private/tmp/originalContent/a2/ch6-essential-airport-vocabulary-slow-english-podcast-for-a2-beginners.json
  - src/modules/playlists/data/videos/a1/ch12-a-day-in-my-life-slow-english-podcast-a1-present-simple.json
  - _private/misshoney/proofread-results/b1/ch1-slow-english-listening-intermediate-practice-talking-about-my-hobbies.md
  - _private/tmp/originalContent/b1/ch18-english-kitchen-vocabulary-comprehensible-input.json
  - _private/misshoney/proofread-results/b2/ch11-slow-english-podcast-my-stressful-trip-to-chinacomprehensible-input.md
  - src/modules/playlists/data/videos/b1/ch11-slow-english-podcast-for-high-beginners-a2-b1-my-trip-to-the-usa-comprehensible-input.json
  - src/modules/playlists/data/videos/b1/ch9-speak-like-a-native-common-english-idioms-slow-english-podcast-for-a2-b1-beginners.json
  - _private/tmp/originalContent/b1/ch12-slow-english-podcast-my-trip-to-new-york-city-level-b1.json
  - _private/misshoney/proofread-results/a1/ch11-slow-english-reading-rainbow-fish-for-beginners-a1a2.md
  - _private/misshoney/proofread-results/a2/ch20-intermediate-slow-english-podcast-my-trip-to-the-elephant-sanctuarycomprehensible-input.md
  - _private/misshoney/proofread-results/a2/ch10-powerful-daily-affirmations-learn-english-and-practice-gratitude-comprehensible-input.md
  - _private/tmp/originalContent/a1/ch6-slow-english-podcast-for-beginners-talking-about-friends.json
  - src/modules/playlists/data/videos/a2/ch6-essential-airport-vocabulary-slow-english-podcast-for-a2-beginners.json
  - _private/tmp/originalContent/a2/ch25-learn-english-travel-vlog-for-beginners.json
  - _private/tmp/originalContent/a2/ch8-a1-beginner-slow-english-podcast-sleep-rest-vocabulary.json
  - _private/misshoney/proofread-results/a2/ch25-learn-english-travel-vlog-for-beginners.md
  - _private/tmp/originalContent/a2/ch1-slow-english-stories-level-a2-listening-a-weird-phone-call.json
  - src/modules/playlists/components/PlaylistPhraseCard.vue
  - src/modules/playlists/data/videos/a2/ch14-learn-english-with-slow-conversations-comprehensible-input-a1-weekend-routines.json
  - src/modules/playlists/data/videos/a2/ch20-intermediate-slow-english-podcast-my-trip-to-the-elephant-sanctuarycomprehensible-input.json
  - src/modules/playlists/data/videos/b2/ch15-learn-english-by-making-mistakes-slow-english-podcast.json
  - _private/tmp/originalContent/a2/ch23-how-to-actually-learn-english-10-tips-that-really-work.json
  - _private/tmp/originalContent/a2/ch3-slow-english-podcast-bus-stories-for-beginners.json
  - _private/misshoney/proofread-results/b1/ch11-slow-english-podcast-for-high-beginners-a2-b1-my-trip-to-the-usa-comprehensible-input.md
  - package.json
  - src/modules/playlists/data/videos/a2/ch9-learn-english-with-slow-interviews-comprehensible-input-a1-sleep-routines.json
  - src/modules/playlists/data/videos/b2/ch11-slow-english-podcast-my-stressful-trip-to-chinacomprehensible-input.json
  - src/shared/components/BackToWordFab.vue
  - _private/tmp/originalContent/a2/ch20-intermediate-slow-english-podcast-my-trip-to-the-elephant-sanctuarycomprehensible-input.json
  - _private/tmp/originalContent/a1/ch8-slow-english-podcast-chat-with-me-about-foods.json
  - _private/tmp/originalContent/b2/ch8-slow-english-podcast-why-am-i-learning-chinese-b2.json
  - _private/tmp/originalContent/a1/ch15-absolute-beginner-slow-english-what-is-my-favorite-holiday.json
  - src/modules/playlists/data/videos/b1/ch3-slow-english-podcast-bus-stories-for-beginners.json
  - src/modules/playlists/data/videos/a2/ch3-slow-english-podcast-bus-stories-for-beginners.json
  - _private/misshoney/proofread-results/b1/ch8-learn-slow-english-asmr-intermediate-b1-talking-about-sounds-and-noises-comprehensible-input.md
  - .codex/agents/grammar_organizer.toml
  - src/modules/playlists/data/videos/a2/ch17-asmr-learn-english-while-sleeping-with-relaxing-sounds-slow-english-podcast.json
  - src/modules/playlists/data/videos/b2/ch10-real-english-to-speak-when-you-travel-advanced-slow-english-podcast.json
  - _private/misshoney/proofread-results/b2/ch16-learn-english-with-my-morning-routine-natural-speaking-practice.md
  - _private/misshoney/proofread-results/b1/ch6-my-trip-to-brazil-slow-english-podcast-for-high-beginners-a2-b1-comprehensible-input.md
  - src/style.css
  - src/modules/playlists/data/videos/a2/ch19-english-sleep-learning-shadowing-positive-affirmations.json
  - src/modules/playlists/data/videos/b1/ch2-slow-english-practice-for-b1-intermediate-talking-about-airports.json
  - _private/misshoney/proofread-results/b1/ch9-speak-like-a-native-common-english-idioms-slow-english-podcast-for-a2-b1-beginners.md
  - _private/misshoney/proofread-results/a1/ch13-slow-english-podcast-the-giving-tree-for-beginners-a1a2.md
  - _private/tmp/originalContent/a2/ch19-english-sleep-learning-shadowing-positive-affirmations.json
  - _private/tmp/originalContent/a2/ch29-what-you-taught-me-about-hope-slow-english-listening.json
  - _private/misshoney/proofread-results/b1/ch5-job-interview-essentials-slow-english-podcast-for-intermediate-b1.md
  - src/modules/playlists/data/videos/a1/ch18-english-listening-practice-for-beginners-my-weekend-a1-a2.json
  - _private/tmp/originalContent/a1/ch4-practice-slow-english-for-a1-beginners-talk-about-family.json
  - _private/misshoney/proofread-results/b1/ch3-slow-english-podcast-bus-stories-for-beginners.md
  - _private/misshoney/proofread-results/b2/ch13-travel-with-english-slow-english-podcast.md
  - _private/tmp/originalContent/b1/ch6-my-trip-to-brazil-slow-english-podcast-for-high-beginners-a2-b1-comprehensible-input.json
  - _private/misshoney/proofread-results/a1/ch16-beginner-english-speaking-practice-real-life-role-play-a1.md
  - src/modules/playlists/data/videos/a1/ch17-slow-english-conversations-a1-comprehensible-input.json
  - _private/misshoney/proofread-results/a1/ch3-slow-english-listening-for-beginners-talking-about-languages.md
  - _private/misshoney/proofread-results/a1/ch15-absolute-beginner-slow-english-what-is-my-favorite-holiday.md
  - src/modules/playlists/data/videos/a2/ch22-learn-english-at-home-slow-english.json
  - src/modules/playlists/data/videos/a1/ch13-slow-english-podcast-the-giving-tree-for-beginners-a1a2.json
  - _private/misshoney/proofread-results/a2/ch18-slow-english-podcast-a-day-in-my-life-a2-english-listening-practice.md
  - src/modules/playlists/data/videos/b2/ch9-intermediate-slow-english-podcast-my-trip-to-the-elephant-sanctuarycomprehensible-input.json
  - src/modules/playlists/data/videos/a1/ch14-how-to-introduce-yourself-in-english-for-beginners.json
  - _private/misshoney/proofread-results/a2/ch22-learn-english-at-home-slow-english.md
  - src/modules/playlists/data/videos/a1/ch6-slow-english-podcast-for-beginners-talking-about-friends.json
  - src/modules/playlists/types.ts
  - src/modules/playlists/components/PlaylistUsageCard.vue
  - src/modules/playlists/data/videos/a2/ch28-learn-in-on-at-naturally-english-listening-practice.json
  - _private/misshoney/proofread-results/a2/ch26-100-essential-english-words-for-daily-life-slow-english-vocabulary.md
  - _private/misshoney/proofread-results/a1/ch8-slow-english-podcast-chat-with-me-about-foods.md
  - _private/tmp/originalContent/b1/ch21-slow-english-listening-practice-makeup-routine.json
  - _private/tmp/originalContent/b2/ch11-slow-english-podcast-my-stressful-trip-to-chinacomprehensible-input.json
  - _private/misshoney/proofread-results/b1/ch2-slow-english-practice-for-b1-intermediate-talking-about-airports.md
  - scripts/misshoney/fetch-transcript.mjs
  - src/modules/playlists/data/videos/b1/ch16-slow-english-podcast-my-trip-to-mexico-city.json
  - src/modules/playlists/data/videos/a1/ch7-slow-english-podcast-for-beginners-talking-about-goals.json
  - _private/misshoney/proofread-results/a1/ch17-slow-english-conversations-a1-comprehensible-input.md
  - _private/tmp/originalContent/a2/ch18-slow-english-podcast-a-day-in-my-life-a2-english-listening-practice.json
  - src/modules/playlists/data/videos/a1/ch15-absolute-beginner-slow-english-what-is-my-favorite-holiday.json
  - src/modules/playlists/data/videos/a2/ch7-speak-like-a-native-common-abbreviations-slow-english-podcast-for-a2-beginners.json
  - src/modules/playlists/data/videos/b1/ch17-slow-english-practice-airport-essentials-for-traveling.json
  - src/modules/playlists/data/videos/b2/ch7-learn-english-with-slow-interviews-comprehensible-input-b1-interview-practice.json
  - _private/misshoney/proofread-results/a1/ch18-english-listening-practice-for-beginners-my-weekend-a1-a2.md
  - src/modules/playlists/data/videos/a2/ch16-slow-english-podcast-my-day-a2-listening-practice.json
  - src/modules/playlists/data/videos/b2/ch2-slow-english-for-intermediate-b2-with-subtitles-in-spanish-talking-about-languages.json
  - _private/misshoney/proofread-results/a2/ch29-what-you-taught-me-about-hope-slow-english-listening.md
  - src/modules/playlists/data/videos/a1/ch11-slow-english-reading-rainbow-fish-for-beginners-a1a2.json
  - _private/misshoney/proofread-results/b1/ch18-english-kitchen-vocabulary-comprehensible-input.md
  - _private/tmp/originalContent/a1/ch3-slow-english-listening-for-beginners-talking-about-languages.json
  - src/modules/playlists/composables/usePlaylistReadingSections.ts
  - src/modules/playlists/data/videos/a2/ch8-a1-beginner-slow-english-podcast-sleep-rest-vocabulary.json
  - src/modules/playlists/data/videos/a2/ch23-how-to-actually-learn-english-10-tips-that-really-work.json
  - src/modules/playlists/data/videos/b2/ch1-slow-english-listening-for-upper-intermediate-talking-about-comfort-foods.json
  - _private/misshoney/proofread-results/a2/ch6-essential-airport-vocabulary-slow-english-podcast-for-a2-beginners.md
  - _private/tmp/originalContent/b2/ch15-learn-english-by-making-mistakes-slow-english-podcast.json
  - _private/tmp/originalContent/b2/ch1-slow-english-listening-for-upper-intermediate-talking-about-comfort-foods.json
  - _private/misshoney/proofread-results/a2/ch13-my-weird-trip-in-puerto-escondido-storytime-slow-english-for-intermediate-listeners.md
  - _private/tmp.txt
  - src/modules/playlists/data/videos/a2/ch15-daily-english-affirmations-for-speaking-confidence-fluency-i-am-a-fluent-english-speaker.json
  - src/modules/playlists/data/videos/b2/ch17-how-she-became-fluent-in-english-intermediate-listening-practice.json
  - _private/tmp/originalContent/b2/ch14-learn-english-in-nyc-slow-english-vlog.json
  - src/modules/playlists/components/PlaylistWordTag.vue
  - scripts/misshoney/content-core.mjs
  - _private/misshoney/proofread-results/a2/ch9-learn-english-with-slow-interviews-comprehensible-input-a1-sleep-routines.md
  - src/modules/playlists/data/b1.ts
  - src/modules/playlists/data/videos/a1/ch4-practice-slow-english-for-a1-beginners-talk-about-family.json
  - _private/tmp/grammar.md
  - src/modules/playlists/data/videos/b2/ch8-slow-english-podcast-why-am-i-learning-chinese-b2.json
  - _private/misshoney/proofread-results/b2/ch12-slow-english-podcast-advanced-listening-practice-natural-conversation-comprehensible-input.md
  - src/modules/playlists/PlaylistVideoView.vue
  - _private/misshoney/proofread-results/a2/ch5-84-english-phrases-for-beginners-speak-like-a-native.md
  - _private/tmp/originalContent/b1/ch4-slow-english-podcast-for-a2-b1-intemediate-levels-planning-my-first-trip.json
  - _private/tmp/originalContent/b2/ch10-real-english-to-speak-when-you-travel-advanced-slow-english-podcast.json
  - src/modules/playlists/data/videos/a2/ch10-powerful-daily-affirmations-learn-english-and-practice-gratitude-comprehensible-input.json
  - _private/misshoney/proofread-results/b1/ch20-100-essential-english-words-for-daily-life-slow-english-vocabulary.md
  - .codex/agents/english_proofreader.toml
  - _private/misshoney/proofread-results/a2/ch28-learn-in-on-at-naturally-english-listening-practice.md
  - _private/misshoney/proofread-results/b2/ch3-slow-english-for-intermediate-b2-with-subtitles-in-portuguese-talking-about-languages.md
  - _private/misshoney/proofread-results/a1/ch5-practice-slow-english-podcast-talking-about-weather.md
  - _private/tmp/originalContent/a1/ch5-practice-slow-english-podcast-talking-about-weather.json
  - src/modules/playlists/data/videos/b1/ch6-my-trip-to-brazil-slow-english-podcast-for-high-beginners-a2-b1-comprehensible-input.json
  - src/modules/playlists/data/videos/a2/ch13-my-weird-trip-in-puerto-escondido-storytime-slow-english-for-intermediate-listeners.json
  - src/modules/playlists/data/videos/b1/ch21-slow-english-listening-practice-makeup-routine.json
  - src/modules/playlists/data/videos/a2/ch4-slow-english-podcast-for-a2-b1-intemediate-levels-planning-my-first-trip.json
  - _private/misshoney/proofread-results/b1/ch7-interview-about-childhood-memories-faster-english-podcast-for-intermediate-listening-practice.md
  - src/modules/playlists/data/videos/a2/ch26-100-essential-english-words-for-daily-life-slow-english-vocabulary.json
  - src/modules/playlists/data/videos/b1/ch5-job-interview-essentials-slow-english-podcast-for-intermediate-b1.json
  - src/modules/playlists/data/videos/a1/ch3-slow-english-listening-for-beginners-talking-about-languages.json
  - src/modules/playlists/data/videos/b1/ch20-100-essential-english-words-for-daily-life-slow-english-vocabulary.json
  - _private/misshoney/proofread-results/b2/ch5-interview-about-childhood-memories-faster-english-podcast-for-intermediate-listening-practice.md
  - _private/tmp/originalContent/b2/ch13-travel-with-english-slow-english-podcast.json
  - src/modules/playlists/data/videos/a2/ch1-slow-english-stories-level-a2-listening-a-weird-phone-call.json
  - scripts/misshoney/parse-proofread-result.mjs
  - _private/misshoney/proofread-results/a2/ch17-asmr-learn-english-while-sleeping-with-relaxing-sounds-slow-english-podcast.md
  - _private/propose.md
  - _private/tmp/originalContent/a1/ch18-english-listening-practice-for-beginners-my-weekend-a1-a2.json
  - src/modules/playlists/data/videos/b1/ch19-how-to-speak-english-real-life-role-play-b1b2.json
  - scripts/misshoney/author-polished-content.mjs
  - _private/tmp/originalContent/a1/ch17-slow-english-conversations-a1-comprehensible-input.json
  - src/modules/playlists/data/videos/a1/ch2-beginner-english-slow-listening-practice-talking-about-me.json
  - src/modules/playlists/data/videos/b2/ch5-interview-about-childhood-memories-faster-english-podcast-for-intermediate-listening-practice.json
  - _private/misshoney/proofread-results/b2/ch1-slow-english-listening-for-upper-intermediate-talking-about-comfort-foods.md
  - _private/tmp/originalContent/b1/ch3-slow-english-podcast-bus-stories-for-beginners.json
  - src/modules/playlists/data/videos/a2/ch2-slow-english-for-a2-high-beginners-how-colors-make-me-feel.json
  - src/modules/playlists/data/videos/b2/ch13-travel-with-english-slow-english-podcast.json
  - src/modules/playlists/data/videos/b1/ch8-learn-slow-english-asmr-intermediate-b1-talking-about-sounds-and-noises-comprehensible-input.json
  - _private/misshoney/proofread-results/a1/ch12-a-day-in-my-life-slow-english-podcast-a1-present-simple.md
  - _private/tmp/originalContent/a2/ch15-daily-english-affirmations-for-speaking-confidence-fluency-i-am-a-fluent-english-speaker.json
  - _private/misshoney/proofread-results/b2/ch6-slow-english-podcast-my-bus-stories.md
  - _private/tmp/originalContent/b1/ch20-100-essential-english-words-for-daily-life-slow-english-vocabulary.json
  - _private/misshoney/proofread-results/b1/ch17-slow-english-practice-airport-essentials-for-traveling.md
  - scripts/misshoney/content-core.d.mts
  - _private/tmp/originalContent/b2/ch12-slow-english-podcast-advanced-listening-practice-natural-conversation-comprehensible-input.json
  - _private/tmp/originalContent/b2/ch3-slow-english-for-intermediate-b2-with-subtitles-in-portuguese-talking-about-languages.json
  - _private/tmp/originalContent/a2/ch4-slow-english-podcast-for-a2-b1-intemediate-levels-planning-my-first-trip.json
  - src/modules/playlists/data/videos/a1/ch1-slow-english-for-beginners-a1-listening-practice.json
  - _private/tmp/originalContent/b1/ch8-learn-slow-english-asmr-intermediate-b1-talking-about-sounds-and-noises-comprehensible-input.json
  - src/modules/playlists/data/videos/a2/ch11-the-scariest-beach-day-slow-english-podcast-for-a1-a2-beginners-comprehensible-input.json
  - _private/tmp/originalContent/a1/ch7-slow-english-podcast-for-beginners-talking-about-goals.json
  - src/modules/playlists/data/videos/b2/ch14-learn-english-in-nyc-slow-english-vlog.json
  - src/modules/grammar/views/GrammarView.vue
  - _private/tmp/originalContent/a2/ch9-learn-english-with-slow-interviews-comprehensible-input-a1-sleep-routines.json
  - src/modules/playlists/data/videos/a1/ch9-a1-beginner-slow-english-podcast-sleep-rest-vocabulary.json
  - src/modules/playlists/data/videos/b1/ch13-slow-english-podcast-my-trip-to-puerto-escondido-level-a2.json
  - _private/misshoney/proofread-results/b1/ch19-how-to-speak-english-real-life-role-play-b1b2.md
  - _private/tmp/originalContent/a2/ch2-slow-english-for-a2-high-beginners-how-colors-make-me-feel.json
  - src/modules/playlists/data/videos/b1/ch14-real-english-conversation-life-in-the-usa-vs-life-in-mexico-b1.json
  - _private/misshoney/proofread-results/b1/ch21-slow-english-listening-practice-makeup-routine.md
  - _private/misshoney/proofread-results/b2/ch14-learn-english-in-nyc-slow-english-vlog.md
  - _private/misshoney/proofread-results/a2/ch19-english-sleep-learning-shadowing-positive-affirmations.md
  - _private/misshoney/proofread-results/b2/ch2-slow-english-for-intermediate-b2-with-subtitles-in-spanish-talking-about-languages.md
  - _private/misshoney/proofread-results/a2/ch11-the-scariest-beach-day-slow-english-podcast-for-a1-a2-beginners-comprehensible-input.md
  - _private/tmp/originalContent/a1/ch11-slow-english-reading-rainbow-fish-for-beginners-a1a2.json
  - src/modules/playlists/data/videos/a1/ch5-practice-slow-english-podcast-talking-about-weather.json
  - _private/misshoney/proofread-results/b2/ch9-intermediate-slow-english-podcast-my-trip-to-the-elephant-sanctuarycomprehensible-input.md
  - _private/misshoney/proofread-results/b2/ch4-slow-english-for-c1-advanced-dreams.md
  - src/modules/playlists/data/videos/a1/ch8-slow-english-podcast-chat-with-me-about-foods.json
  - src/modules/playlists/data/videos/b2/ch12-slow-english-podcast-advanced-listening-practice-natural-conversation-comprehensible-input.json
  - src/modules/playlists/data/videos/b2/ch6-slow-english-podcast-my-bus-stories.json
  - _private/tmp/originalContent/a2/ch13-my-weird-trip-in-puerto-escondido-storytime-slow-english-for-intermediate-listeners.json
  - _private/tmp/originalContent/b1/ch7-interview-about-childhood-memories-faster-english-podcast-for-intermediate-listening-practice.json
  - _private/tmp/originalContent/b1/ch2-slow-english-practice-for-b1-intermediate-talking-about-airports.json
  - src/modules/playlists/data/videos/b1/ch12-slow-english-podcast-my-trip-to-new-york-city-level-b1.json
tests:
  - src/__tests__/PlaylistVideoView.test.ts
  - src/__tests__/contentCore.test.ts
  - src/__tests__/GrammarView.test.ts
  - src/__tests__/misshoneyProofreadTooling.test.ts
  - tests/e2e/misshoney-polished.smoke.spec.ts
-->

---
### Requirement: MissHoney supplements preserve grammar page organization

MissHoney grammar supplements SHALL NOT change the existing grammar group order, card order, or badge numbering during the A1 ch1 vertical slice.

#### Scenario: Grammar page order remains stable after supplement

- **WHEN** a MissHoney supplement is added to an existing grammar card
- **THEN** the grammar page still renders the same thematic group order
- **AND** the existing card order remains unchanged
- **AND** existing badge identifiers remain consecutive and unchanged

<!-- @trace
source: refresh-misshoney-proofread-content-and-navigation
updated: 2026-05-24
code:
  - _private/misshoney/proofread-results/a2/ch1-slow-english-stories-level-a2-listening-a-weird-phone-call.md
  - _private/misshoney/proofread-results/b2/ch7-learn-english-with-slow-interviews-comprehensible-input-b1-interview-practice.md
  - _private/tmp/originalContent/a1/ch16-beginner-english-speaking-practice-real-life-role-play-a1.json
  - _private/tmp/originalContent/a2/ch16-slow-english-podcast-my-day-a2-listening-practice.json
  - _private/tmp/originalContent/b2/ch16-learn-english-with-my-morning-routine-natural-speaking-practice.json
  - _private/tmp/originalContent/b1/ch19-how-to-speak-english-real-life-role-play-b1b2.json
  - _private/tmp/originalContent/a2/ch22-learn-english-at-home-slow-english.json
  - src/modules/playlists/data/videos/a1/ch10-learn-english-with-slow-interviews-comprehensible-input-a1-sleep-routines.json
  - _private/tmp/originalContent/a2/ch12-grocery-store-essentials-for-a1-a2-beginners.json
  - _private/tmp/originalContent/b1/ch11-slow-english-podcast-for-high-beginners-a2-b1-my-trip-to-the-usa-comprehensible-input.json
  - src/modules/playlists/data/videos/a2/ch27-pronunciation-practice-50-english-words-to-sound-natural.json
  - _private/tmp/originalContent/a1/ch2-beginner-english-slow-listening-practice-talking-about-me.json
  - _private/misshoney/proofread-results/a1/ch4-practice-slow-english-for-a1-beginners-talk-about-family.md
  - _private/misshoney/proofread-results/a2/ch23-how-to-actually-learn-english-10-tips-that-really-work.md
  - _private/misshoney/proofread-results/b2/ch15-learn-english-by-making-mistakes-slow-english-podcast.md
  - _private/misshoney/proofread-results/a1/ch10-learn-english-with-slow-interviews-comprehensible-input-a1-sleep-routines.md
  - _private/tmp/originalContent/a1/ch14-how-to-introduce-yourself-in-english-for-beginners.json
  - _private/tmp/originalContent/a2/ch28-learn-in-on-at-naturally-english-listening-practice.json
  - _private/misshoney/proofread-results/a1/ch2-beginner-english-slow-listening-practice-talking-about-me.md
  - src/modules/playlists/data/b2.ts
  - src/modules/playlists/data/videos/b2/ch4-slow-english-for-c1-advanced-dreams.json
  - _private/misshoney/proofread-results/a2/ch2-slow-english-for-a2-high-beginners-how-colors-make-me-feel.md
  - _private/misshoney/proofread-results/b2/ch17-how-she-became-fluent-in-english-intermediate-listening-practice.md
  - _private/筆記.md
  - src/modules/playlists/data/a1.ts
  - _private/misshoney/proofread-results/a2/ch12-grocery-store-essentials-for-a1-a2-beginners.md
  - _private/misshoney/proofread-results/b1/ch13-slow-english-podcast-my-trip-to-puerto-escondido-level-a2.md
  - _private/misshoney/proofread-results/a1/ch14-how-to-introduce-yourself-in-english-for-beginners.md
  - _private/tmp/originalContent/a2/ch21-slow-english-reading-learn-english-with-childrens-books-comprehensible-input.json
  - _private/tmp/originalContent/b2/ch6-slow-english-podcast-my-bus-stories.json
  - src/modules/playlists/data/videos/a1/ch16-beginner-english-speaking-practice-real-life-role-play-a1.json
  - src/modules/playlists/data/videos/b1/ch15-english-sleep-learning-shadowing-positive-affirmations.json
  - src/modules/playlists/data/videos/a2/ch24-sleep-and-learn-english-shadow-positive-affirmations.json
  - src/modules/playlists/data/videos/b1/ch18-english-kitchen-vocabulary-comprehensible-input.json
  - _private/tmp/originalContent/b2/ch9-intermediate-slow-english-podcast-my-trip-to-the-elephant-sanctuarycomprehensible-input.json
  - _private/tmp/originalContent/a2/ch17-asmr-learn-english-while-sleeping-with-relaxing-sounds-slow-english-podcast.json
  - _private/misshoney/proofread-results/b1/ch14-real-english-conversation-life-in-the-usa-vs-life-in-mexico-b1.md
  - scripts/misshoney/proofread-core.d.mts
  - _private/tmp/originalContent/b1/ch14-real-english-conversation-life-in-the-usa-vs-life-in-mexico-b1.json
  - _private/tmp/originalContent/a1/ch12-a-day-in-my-life-slow-english-podcast-a1-present-simple.json
  - _private/misshoney/proofread-results/b2/ch10-real-english-to-speak-when-you-travel-advanced-slow-english-podcast.md
  - _private/tmp/originalContent/b2/ch5-interview-about-childhood-memories-faster-english-podcast-for-intermediate-listening-practice.json
  - src/modules/playlists/data/videos/a2/ch25-learn-english-travel-vlog-for-beginners.json
  - _private/misshoney/proofread-results/a2/ch4-slow-english-podcast-for-a2-b1-intemediate-levels-planning-my-first-trip.md
  - src/modules/playlists/data/videos/a2/ch21-slow-english-reading-learn-english-with-childrens-books-comprehensible-input.json
  - src/modules/playlists/data/videos/a2/ch5-84-english-phrases-for-beginners-speak-like-a-native.json
  - _private/misshoney/proofread-results/a2/ch16-slow-english-podcast-my-day-a2-listening-practice.md
  - _private/misshoney/proofread-results/a2/ch21-slow-english-reading-learn-english-with-childrens-books-comprehensible-input.md
  - _private/misshoney/proofread-results/a1/ch7-slow-english-podcast-for-beginners-talking-about-goals.md
  - _private/misshoney/proofread-results/a2/ch14-learn-english-with-slow-conversations-comprehensible-input-a1-weekend-routines.md
  - _private/misshoney/proofread-results/a2/ch24-sleep-and-learn-english-shadow-positive-affirmations.md
  - _private/tmp/originalContent/b1/ch10-learn-english-with-slow-interviews-comprehensible-input-b1-interview-practice.json
  - _private/tmp/originalContent/b2/ch2-slow-english-for-intermediate-b2-with-subtitles-in-spanish-talking-about-languages.json
  - _private/misshoney/proofread-results/b1/ch10-learn-english-with-slow-interviews-comprehensible-input-b1-interview-practice.md
  - _private/misshoney/proofread-results/b1/ch12-slow-english-podcast-my-trip-to-new-york-city-level-b1.md
  - _private/tmp/originalContent/b2/ch7-learn-english-with-slow-interviews-comprehensible-input-b1-interview-practice.json
  - _private/tmp/originalContent/a1/ch9-a1-beginner-slow-english-podcast-sleep-rest-vocabulary.json
  - scripts/misshoney/proofread-core.mjs
  - _private/tmp/originalContent/a2/ch7-speak-like-a-native-common-abbreviations-slow-english-podcast-for-a2-beginners.json
  - src/modules/playlists/data/videos/b1/ch4-slow-english-podcast-for-a2-b1-intemediate-levels-planning-my-first-trip.json
  - src/modules/playlists/data/videos/a2/ch18-slow-english-podcast-a-day-in-my-life-a2-english-listening-practice.json
  - src/modules/playlists/data/videos/b2/ch3-slow-english-for-intermediate-b2-with-subtitles-in-portuguese-talking-about-languages.json
  - PROJECT_ARCHITECTURE.md
  - _private/misshoney/proofread-results/a1/ch9-a1-beginner-slow-english-podcast-sleep-rest-vocabulary.md
  - src/modules/playlists/data/a2.ts
  - src/modules/playlists/data/videos/a2/ch29-what-you-taught-me-about-hope-slow-english-listening.json
  - src/modules/playlists/data/videos/b1/ch7-interview-about-childhood-memories-faster-english-podcast-for-intermediate-listening-practice.json
  - src/modules/playlists/data/videos/a2/ch12-grocery-store-essentials-for-a1-a2-beginners.json
  - _private/misshoney/proofread-results/b2/ch8-slow-english-podcast-why-am-i-learning-chinese-b2.md
  - src/modules/playlists/data/videos/b1/ch1-slow-english-listening-intermediate-practice-talking-about-my-hobbies.json
  - _private/misshoney/proofread-results/b1/ch15-english-sleep-learning-shadowing-positive-affirmations.md
  - src/modules/playlists/data/videos/b2/ch16-learn-english-with-my-morning-routine-natural-speaking-practice.json
  - _private/tmp/originalContent/b1/ch13-slow-english-podcast-my-trip-to-puerto-escondido-level-a2.json
  - _private/tmp/originalContent/a1/ch13-slow-english-podcast-the-giving-tree-for-beginners-a1a2.json
  - _private/misshoney/proofread-results/b1/ch16-slow-english-podcast-my-trip-to-mexico-city.md
  - _private/tmp/originalContent/b2/ch17-how-she-became-fluent-in-english-intermediate-listening-practice.json
  - _private/misshoney/proofread-results/a2/ch7-speak-like-a-native-common-abbreviations-slow-english-podcast-for-a2-beginners.md
  - _private/tmp/originalContent/b1/ch17-slow-english-practice-airport-essentials-for-traveling.json
  - _private/tmp/originalContent/a2/ch5-84-english-phrases-for-beginners-speak-like-a-native.json
  - _private/tmp/originalContent/b2/ch4-slow-english-for-c1-advanced-dreams.json
  - _private/misshoney/proofread-results/a2/ch3-slow-english-podcast-bus-stories-for-beginners.md
  - src/modules/playlists/data/videos/b1/ch10-learn-english-with-slow-interviews-comprehensible-input-b1-interview-practice.json
  - _private/misshoney/proofread-results/a1/ch6-slow-english-podcast-for-beginners-talking-about-friends.md
  - _private/tmp/originalContent/a2/ch14-learn-english-with-slow-conversations-comprehensible-input-a1-weekend-routines.json
  - _private/tmp/originalContent/b1/ch1-slow-english-listening-intermediate-practice-talking-about-my-hobbies.json
  - _private/tmp/originalContent/a2/ch11-the-scariest-beach-day-slow-english-podcast-for-a1-a2-beginners-comprehensible-input.json
  - _private/tmp/originalContent/a2/ch24-sleep-and-learn-english-shadow-positive-affirmations.json
  - _private/tmp/originalContent/b1/ch16-slow-english-podcast-my-trip-to-mexico-city.json
  - _private/tmp/originalContent/a2/ch10-powerful-daily-affirmations-learn-english-and-practice-gratitude-comprehensible-input.json
  - _private/misshoney/proofread-results/a2/ch27-pronunciation-practice-50-english-words-to-sound-natural.md
  - _private/misshoney/proofread-results/a2/ch15-daily-english-affirmations-for-speaking-confidence-fluency-i-am-a-fluent-english-speaker.md
  - _private/misshoney/proofread-results/b1/ch4-slow-english-podcast-for-a2-b1-intemediate-levels-planning-my-first-trip.md
  - _private/tmp/originalContent/a2/ch26-100-essential-english-words-for-daily-life-slow-english-vocabulary.json
  - _private/tmp/originalContent/b1/ch5-job-interview-essentials-slow-english-podcast-for-intermediate-b1.json
  - _private/tmp/originalContent/a1/ch1-slow-english-for-beginners-a1-listening-practice.json
  - src/shared/components/BackToTopFab.vue
  - _private/tmp/originalContent/a1/ch10-learn-english-with-slow-interviews-comprehensible-input-a1-sleep-routines.json
  - _private/tmp/originalContent/b1/ch9-speak-like-a-native-common-english-idioms-slow-english-podcast-for-a2-b1-beginners.json
  - _private/misshoney/proofread-results/a2/ch8-a1-beginner-slow-english-podcast-sleep-rest-vocabulary.md
  - _private/tmp/originalContent/a2/ch27-pronunciation-practice-50-english-words-to-sound-natural.json
  - _private/tmp/originalContent/b1/ch15-english-sleep-learning-shadowing-positive-affirmations.json
  - _private/discuss.txt
  - _private/tmp/originalContent/a2/ch6-essential-airport-vocabulary-slow-english-podcast-for-a2-beginners.json
  - src/modules/playlists/data/videos/a1/ch12-a-day-in-my-life-slow-english-podcast-a1-present-simple.json
  - _private/misshoney/proofread-results/b1/ch1-slow-english-listening-intermediate-practice-talking-about-my-hobbies.md
  - _private/tmp/originalContent/b1/ch18-english-kitchen-vocabulary-comprehensible-input.json
  - _private/misshoney/proofread-results/b2/ch11-slow-english-podcast-my-stressful-trip-to-chinacomprehensible-input.md
  - src/modules/playlists/data/videos/b1/ch11-slow-english-podcast-for-high-beginners-a2-b1-my-trip-to-the-usa-comprehensible-input.json
  - src/modules/playlists/data/videos/b1/ch9-speak-like-a-native-common-english-idioms-slow-english-podcast-for-a2-b1-beginners.json
  - _private/tmp/originalContent/b1/ch12-slow-english-podcast-my-trip-to-new-york-city-level-b1.json
  - _private/misshoney/proofread-results/a1/ch11-slow-english-reading-rainbow-fish-for-beginners-a1a2.md
  - _private/misshoney/proofread-results/a2/ch20-intermediate-slow-english-podcast-my-trip-to-the-elephant-sanctuarycomprehensible-input.md
  - _private/misshoney/proofread-results/a2/ch10-powerful-daily-affirmations-learn-english-and-practice-gratitude-comprehensible-input.md
  - _private/tmp/originalContent/a1/ch6-slow-english-podcast-for-beginners-talking-about-friends.json
  - src/modules/playlists/data/videos/a2/ch6-essential-airport-vocabulary-slow-english-podcast-for-a2-beginners.json
  - _private/tmp/originalContent/a2/ch25-learn-english-travel-vlog-for-beginners.json
  - _private/tmp/originalContent/a2/ch8-a1-beginner-slow-english-podcast-sleep-rest-vocabulary.json
  - _private/misshoney/proofread-results/a2/ch25-learn-english-travel-vlog-for-beginners.md
  - _private/tmp/originalContent/a2/ch1-slow-english-stories-level-a2-listening-a-weird-phone-call.json
  - src/modules/playlists/components/PlaylistPhraseCard.vue
  - src/modules/playlists/data/videos/a2/ch14-learn-english-with-slow-conversations-comprehensible-input-a1-weekend-routines.json
  - src/modules/playlists/data/videos/a2/ch20-intermediate-slow-english-podcast-my-trip-to-the-elephant-sanctuarycomprehensible-input.json
  - src/modules/playlists/data/videos/b2/ch15-learn-english-by-making-mistakes-slow-english-podcast.json
  - _private/tmp/originalContent/a2/ch23-how-to-actually-learn-english-10-tips-that-really-work.json
  - _private/tmp/originalContent/a2/ch3-slow-english-podcast-bus-stories-for-beginners.json
  - _private/misshoney/proofread-results/b1/ch11-slow-english-podcast-for-high-beginners-a2-b1-my-trip-to-the-usa-comprehensible-input.md
  - package.json
  - src/modules/playlists/data/videos/a2/ch9-learn-english-with-slow-interviews-comprehensible-input-a1-sleep-routines.json
  - src/modules/playlists/data/videos/b2/ch11-slow-english-podcast-my-stressful-trip-to-chinacomprehensible-input.json
  - src/shared/components/BackToWordFab.vue
  - _private/tmp/originalContent/a2/ch20-intermediate-slow-english-podcast-my-trip-to-the-elephant-sanctuarycomprehensible-input.json
  - _private/tmp/originalContent/a1/ch8-slow-english-podcast-chat-with-me-about-foods.json
  - _private/tmp/originalContent/b2/ch8-slow-english-podcast-why-am-i-learning-chinese-b2.json
  - _private/tmp/originalContent/a1/ch15-absolute-beginner-slow-english-what-is-my-favorite-holiday.json
  - src/modules/playlists/data/videos/b1/ch3-slow-english-podcast-bus-stories-for-beginners.json
  - src/modules/playlists/data/videos/a2/ch3-slow-english-podcast-bus-stories-for-beginners.json
  - _private/misshoney/proofread-results/b1/ch8-learn-slow-english-asmr-intermediate-b1-talking-about-sounds-and-noises-comprehensible-input.md
  - .codex/agents/grammar_organizer.toml
  - src/modules/playlists/data/videos/a2/ch17-asmr-learn-english-while-sleeping-with-relaxing-sounds-slow-english-podcast.json
  - src/modules/playlists/data/videos/b2/ch10-real-english-to-speak-when-you-travel-advanced-slow-english-podcast.json
  - _private/misshoney/proofread-results/b2/ch16-learn-english-with-my-morning-routine-natural-speaking-practice.md
  - _private/misshoney/proofread-results/b1/ch6-my-trip-to-brazil-slow-english-podcast-for-high-beginners-a2-b1-comprehensible-input.md
  - src/style.css
  - src/modules/playlists/data/videos/a2/ch19-english-sleep-learning-shadowing-positive-affirmations.json
  - src/modules/playlists/data/videos/b1/ch2-slow-english-practice-for-b1-intermediate-talking-about-airports.json
  - _private/misshoney/proofread-results/b1/ch9-speak-like-a-native-common-english-idioms-slow-english-podcast-for-a2-b1-beginners.md
  - _private/misshoney/proofread-results/a1/ch13-slow-english-podcast-the-giving-tree-for-beginners-a1a2.md
  - _private/tmp/originalContent/a2/ch19-english-sleep-learning-shadowing-positive-affirmations.json
  - _private/tmp/originalContent/a2/ch29-what-you-taught-me-about-hope-slow-english-listening.json
  - _private/misshoney/proofread-results/b1/ch5-job-interview-essentials-slow-english-podcast-for-intermediate-b1.md
  - src/modules/playlists/data/videos/a1/ch18-english-listening-practice-for-beginners-my-weekend-a1-a2.json
  - _private/tmp/originalContent/a1/ch4-practice-slow-english-for-a1-beginners-talk-about-family.json
  - _private/misshoney/proofread-results/b1/ch3-slow-english-podcast-bus-stories-for-beginners.md
  - _private/misshoney/proofread-results/b2/ch13-travel-with-english-slow-english-podcast.md
  - _private/tmp/originalContent/b1/ch6-my-trip-to-brazil-slow-english-podcast-for-high-beginners-a2-b1-comprehensible-input.json
  - _private/misshoney/proofread-results/a1/ch16-beginner-english-speaking-practice-real-life-role-play-a1.md
  - src/modules/playlists/data/videos/a1/ch17-slow-english-conversations-a1-comprehensible-input.json
  - _private/misshoney/proofread-results/a1/ch3-slow-english-listening-for-beginners-talking-about-languages.md
  - _private/misshoney/proofread-results/a1/ch15-absolute-beginner-slow-english-what-is-my-favorite-holiday.md
  - src/modules/playlists/data/videos/a2/ch22-learn-english-at-home-slow-english.json
  - src/modules/playlists/data/videos/a1/ch13-slow-english-podcast-the-giving-tree-for-beginners-a1a2.json
  - _private/misshoney/proofread-results/a2/ch18-slow-english-podcast-a-day-in-my-life-a2-english-listening-practice.md
  - src/modules/playlists/data/videos/b2/ch9-intermediate-slow-english-podcast-my-trip-to-the-elephant-sanctuarycomprehensible-input.json
  - src/modules/playlists/data/videos/a1/ch14-how-to-introduce-yourself-in-english-for-beginners.json
  - _private/misshoney/proofread-results/a2/ch22-learn-english-at-home-slow-english.md
  - src/modules/playlists/data/videos/a1/ch6-slow-english-podcast-for-beginners-talking-about-friends.json
  - src/modules/playlists/types.ts
  - src/modules/playlists/components/PlaylistUsageCard.vue
  - src/modules/playlists/data/videos/a2/ch28-learn-in-on-at-naturally-english-listening-practice.json
  - _private/misshoney/proofread-results/a2/ch26-100-essential-english-words-for-daily-life-slow-english-vocabulary.md
  - _private/misshoney/proofread-results/a1/ch8-slow-english-podcast-chat-with-me-about-foods.md
  - _private/tmp/originalContent/b1/ch21-slow-english-listening-practice-makeup-routine.json
  - _private/tmp/originalContent/b2/ch11-slow-english-podcast-my-stressful-trip-to-chinacomprehensible-input.json
  - _private/misshoney/proofread-results/b1/ch2-slow-english-practice-for-b1-intermediate-talking-about-airports.md
  - scripts/misshoney/fetch-transcript.mjs
  - src/modules/playlists/data/videos/b1/ch16-slow-english-podcast-my-trip-to-mexico-city.json
  - src/modules/playlists/data/videos/a1/ch7-slow-english-podcast-for-beginners-talking-about-goals.json
  - _private/misshoney/proofread-results/a1/ch17-slow-english-conversations-a1-comprehensible-input.md
  - _private/tmp/originalContent/a2/ch18-slow-english-podcast-a-day-in-my-life-a2-english-listening-practice.json
  - src/modules/playlists/data/videos/a1/ch15-absolute-beginner-slow-english-what-is-my-favorite-holiday.json
  - src/modules/playlists/data/videos/a2/ch7-speak-like-a-native-common-abbreviations-slow-english-podcast-for-a2-beginners.json
  - src/modules/playlists/data/videos/b1/ch17-slow-english-practice-airport-essentials-for-traveling.json
  - src/modules/playlists/data/videos/b2/ch7-learn-english-with-slow-interviews-comprehensible-input-b1-interview-practice.json
  - _private/misshoney/proofread-results/a1/ch18-english-listening-practice-for-beginners-my-weekend-a1-a2.md
  - src/modules/playlists/data/videos/a2/ch16-slow-english-podcast-my-day-a2-listening-practice.json
  - src/modules/playlists/data/videos/b2/ch2-slow-english-for-intermediate-b2-with-subtitles-in-spanish-talking-about-languages.json
  - _private/misshoney/proofread-results/a2/ch29-what-you-taught-me-about-hope-slow-english-listening.md
  - src/modules/playlists/data/videos/a1/ch11-slow-english-reading-rainbow-fish-for-beginners-a1a2.json
  - _private/misshoney/proofread-results/b1/ch18-english-kitchen-vocabulary-comprehensible-input.md
  - _private/tmp/originalContent/a1/ch3-slow-english-listening-for-beginners-talking-about-languages.json
  - src/modules/playlists/composables/usePlaylistReadingSections.ts
  - src/modules/playlists/data/videos/a2/ch8-a1-beginner-slow-english-podcast-sleep-rest-vocabulary.json
  - src/modules/playlists/data/videos/a2/ch23-how-to-actually-learn-english-10-tips-that-really-work.json
  - src/modules/playlists/data/videos/b2/ch1-slow-english-listening-for-upper-intermediate-talking-about-comfort-foods.json
  - _private/misshoney/proofread-results/a2/ch6-essential-airport-vocabulary-slow-english-podcast-for-a2-beginners.md
  - _private/tmp/originalContent/b2/ch15-learn-english-by-making-mistakes-slow-english-podcast.json
  - _private/tmp/originalContent/b2/ch1-slow-english-listening-for-upper-intermediate-talking-about-comfort-foods.json
  - _private/misshoney/proofread-results/a2/ch13-my-weird-trip-in-puerto-escondido-storytime-slow-english-for-intermediate-listeners.md
  - _private/tmp.txt
  - src/modules/playlists/data/videos/a2/ch15-daily-english-affirmations-for-speaking-confidence-fluency-i-am-a-fluent-english-speaker.json
  - src/modules/playlists/data/videos/b2/ch17-how-she-became-fluent-in-english-intermediate-listening-practice.json
  - _private/tmp/originalContent/b2/ch14-learn-english-in-nyc-slow-english-vlog.json
  - src/modules/playlists/components/PlaylistWordTag.vue
  - scripts/misshoney/content-core.mjs
  - _private/misshoney/proofread-results/a2/ch9-learn-english-with-slow-interviews-comprehensible-input-a1-sleep-routines.md
  - src/modules/playlists/data/b1.ts
  - src/modules/playlists/data/videos/a1/ch4-practice-slow-english-for-a1-beginners-talk-about-family.json
  - _private/tmp/grammar.md
  - src/modules/playlists/data/videos/b2/ch8-slow-english-podcast-why-am-i-learning-chinese-b2.json
  - _private/misshoney/proofread-results/b2/ch12-slow-english-podcast-advanced-listening-practice-natural-conversation-comprehensible-input.md
  - src/modules/playlists/PlaylistVideoView.vue
  - _private/misshoney/proofread-results/a2/ch5-84-english-phrases-for-beginners-speak-like-a-native.md
  - _private/tmp/originalContent/b1/ch4-slow-english-podcast-for-a2-b1-intemediate-levels-planning-my-first-trip.json
  - _private/tmp/originalContent/b2/ch10-real-english-to-speak-when-you-travel-advanced-slow-english-podcast.json
  - src/modules/playlists/data/videos/a2/ch10-powerful-daily-affirmations-learn-english-and-practice-gratitude-comprehensible-input.json
  - _private/misshoney/proofread-results/b1/ch20-100-essential-english-words-for-daily-life-slow-english-vocabulary.md
  - .codex/agents/english_proofreader.toml
  - _private/misshoney/proofread-results/a2/ch28-learn-in-on-at-naturally-english-listening-practice.md
  - _private/misshoney/proofread-results/b2/ch3-slow-english-for-intermediate-b2-with-subtitles-in-portuguese-talking-about-languages.md
  - _private/misshoney/proofread-results/a1/ch5-practice-slow-english-podcast-talking-about-weather.md
  - _private/tmp/originalContent/a1/ch5-practice-slow-english-podcast-talking-about-weather.json
  - src/modules/playlists/data/videos/b1/ch6-my-trip-to-brazil-slow-english-podcast-for-high-beginners-a2-b1-comprehensible-input.json
  - src/modules/playlists/data/videos/a2/ch13-my-weird-trip-in-puerto-escondido-storytime-slow-english-for-intermediate-listeners.json
  - src/modules/playlists/data/videos/b1/ch21-slow-english-listening-practice-makeup-routine.json
  - src/modules/playlists/data/videos/a2/ch4-slow-english-podcast-for-a2-b1-intemediate-levels-planning-my-first-trip.json
  - _private/misshoney/proofread-results/b1/ch7-interview-about-childhood-memories-faster-english-podcast-for-intermediate-listening-practice.md
  - src/modules/playlists/data/videos/a2/ch26-100-essential-english-words-for-daily-life-slow-english-vocabulary.json
  - src/modules/playlists/data/videos/b1/ch5-job-interview-essentials-slow-english-podcast-for-intermediate-b1.json
  - src/modules/playlists/data/videos/a1/ch3-slow-english-listening-for-beginners-talking-about-languages.json
  - src/modules/playlists/data/videos/b1/ch20-100-essential-english-words-for-daily-life-slow-english-vocabulary.json
  - _private/misshoney/proofread-results/b2/ch5-interview-about-childhood-memories-faster-english-podcast-for-intermediate-listening-practice.md
  - _private/tmp/originalContent/b2/ch13-travel-with-english-slow-english-podcast.json
  - src/modules/playlists/data/videos/a2/ch1-slow-english-stories-level-a2-listening-a-weird-phone-call.json
  - scripts/misshoney/parse-proofread-result.mjs
  - _private/misshoney/proofread-results/a2/ch17-asmr-learn-english-while-sleeping-with-relaxing-sounds-slow-english-podcast.md
  - _private/propose.md
  - _private/tmp/originalContent/a1/ch18-english-listening-practice-for-beginners-my-weekend-a1-a2.json
  - src/modules/playlists/data/videos/b1/ch19-how-to-speak-english-real-life-role-play-b1b2.json
  - scripts/misshoney/author-polished-content.mjs
  - _private/tmp/originalContent/a1/ch17-slow-english-conversations-a1-comprehensible-input.json
  - src/modules/playlists/data/videos/a1/ch2-beginner-english-slow-listening-practice-talking-about-me.json
  - src/modules/playlists/data/videos/b2/ch5-interview-about-childhood-memories-faster-english-podcast-for-intermediate-listening-practice.json
  - _private/misshoney/proofread-results/b2/ch1-slow-english-listening-for-upper-intermediate-talking-about-comfort-foods.md
  - _private/tmp/originalContent/b1/ch3-slow-english-podcast-bus-stories-for-beginners.json
  - src/modules/playlists/data/videos/a2/ch2-slow-english-for-a2-high-beginners-how-colors-make-me-feel.json
  - src/modules/playlists/data/videos/b2/ch13-travel-with-english-slow-english-podcast.json
  - src/modules/playlists/data/videos/b1/ch8-learn-slow-english-asmr-intermediate-b1-talking-about-sounds-and-noises-comprehensible-input.json
  - _private/misshoney/proofread-results/a1/ch12-a-day-in-my-life-slow-english-podcast-a1-present-simple.md
  - _private/tmp/originalContent/a2/ch15-daily-english-affirmations-for-speaking-confidence-fluency-i-am-a-fluent-english-speaker.json
  - _private/misshoney/proofread-results/b2/ch6-slow-english-podcast-my-bus-stories.md
  - _private/tmp/originalContent/b1/ch20-100-essential-english-words-for-daily-life-slow-english-vocabulary.json
  - _private/misshoney/proofread-results/b1/ch17-slow-english-practice-airport-essentials-for-traveling.md
  - scripts/misshoney/content-core.d.mts
  - _private/tmp/originalContent/b2/ch12-slow-english-podcast-advanced-listening-practice-natural-conversation-comprehensible-input.json
  - _private/tmp/originalContent/b2/ch3-slow-english-for-intermediate-b2-with-subtitles-in-portuguese-talking-about-languages.json
  - _private/tmp/originalContent/a2/ch4-slow-english-podcast-for-a2-b1-intemediate-levels-planning-my-first-trip.json
  - src/modules/playlists/data/videos/a1/ch1-slow-english-for-beginners-a1-listening-practice.json
  - _private/tmp/originalContent/b1/ch8-learn-slow-english-asmr-intermediate-b1-talking-about-sounds-and-noises-comprehensible-input.json
  - src/modules/playlists/data/videos/a2/ch11-the-scariest-beach-day-slow-english-podcast-for-a1-a2-beginners-comprehensible-input.json
  - _private/tmp/originalContent/a1/ch7-slow-english-podcast-for-beginners-talking-about-goals.json
  - src/modules/playlists/data/videos/b2/ch14-learn-english-in-nyc-slow-english-vlog.json
  - src/modules/grammar/views/GrammarView.vue
  - _private/tmp/originalContent/a2/ch9-learn-english-with-slow-interviews-comprehensible-input-a1-sleep-routines.json
  - src/modules/playlists/data/videos/a1/ch9-a1-beginner-slow-english-podcast-sleep-rest-vocabulary.json
  - src/modules/playlists/data/videos/b1/ch13-slow-english-podcast-my-trip-to-puerto-escondido-level-a2.json
  - _private/misshoney/proofread-results/b1/ch19-how-to-speak-english-real-life-role-play-b1b2.md
  - _private/tmp/originalContent/a2/ch2-slow-english-for-a2-high-beginners-how-colors-make-me-feel.json
  - src/modules/playlists/data/videos/b1/ch14-real-english-conversation-life-in-the-usa-vs-life-in-mexico-b1.json
  - _private/misshoney/proofread-results/b1/ch21-slow-english-listening-practice-makeup-routine.md
  - _private/misshoney/proofread-results/b2/ch14-learn-english-in-nyc-slow-english-vlog.md
  - _private/misshoney/proofread-results/a2/ch19-english-sleep-learning-shadowing-positive-affirmations.md
  - _private/misshoney/proofread-results/b2/ch2-slow-english-for-intermediate-b2-with-subtitles-in-spanish-talking-about-languages.md
  - _private/misshoney/proofread-results/a2/ch11-the-scariest-beach-day-slow-english-podcast-for-a1-a2-beginners-comprehensible-input.md
  - _private/tmp/originalContent/a1/ch11-slow-english-reading-rainbow-fish-for-beginners-a1a2.json
  - src/modules/playlists/data/videos/a1/ch5-practice-slow-english-podcast-talking-about-weather.json
  - _private/misshoney/proofread-results/b2/ch9-intermediate-slow-english-podcast-my-trip-to-the-elephant-sanctuarycomprehensible-input.md
  - _private/misshoney/proofread-results/b2/ch4-slow-english-for-c1-advanced-dreams.md
  - src/modules/playlists/data/videos/a1/ch8-slow-english-podcast-chat-with-me-about-foods.json
  - src/modules/playlists/data/videos/b2/ch12-slow-english-podcast-advanced-listening-practice-natural-conversation-comprehensible-input.json
  - src/modules/playlists/data/videos/b2/ch6-slow-english-podcast-my-bus-stories.json
  - _private/tmp/originalContent/a2/ch13-my-weird-trip-in-puerto-escondido-storytime-slow-english-for-intermediate-listeners.json
  - _private/tmp/originalContent/b1/ch7-interview-about-childhood-memories-faster-english-podcast-for-intermediate-listening-practice.json
  - _private/tmp/originalContent/b1/ch2-slow-english-practice-for-b1-intermediate-talking-about-airports.json
  - src/modules/playlists/data/videos/b1/ch12-slow-english-podcast-my-trip-to-new-york-city-level-b1.json
tests:
  - src/__tests__/PlaylistVideoView.test.ts
  - src/__tests__/contentCore.test.ts
  - src/__tests__/GrammarView.test.ts
  - src/__tests__/misshoneyProofreadTooling.test.ts
  - tests/e2e/misshoney-polished.smoke.spec.ts
-->