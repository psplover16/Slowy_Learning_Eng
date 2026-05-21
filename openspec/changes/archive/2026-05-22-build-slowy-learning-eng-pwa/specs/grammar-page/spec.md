## ADDED Requirements

### Requirement: Grammar page displays multi-container layout

The grammar route (`/grammar`) SHALL render a vertically scrollable list of grammar topic containers. Each container covers one grammar point and is visually distinct (card style with border).

#### Scenario: Grammar page renders at least the initial two topics

- **WHEN** the user visits `/grammar`
- **THEN** two grammar cards are visible: "英語常見詞性介紹" and "like 的全用法"

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

### Requirement: Grammar page does NOT include article-specific sentence breakdowns

Article-level grammar notes (e.g., participial phrases from Ch1, causative verbs) SHALL remain in the article content page, not in the grammar route.

#### Scenario: Grammar page scope boundary

- **WHEN** the user visits `/grammar`
- **THEN** no Ch1-specific sentence breakdown cards (e.g., "The first thing we did was head to bed") appear on this page
