## ADDED Requirements

### Requirement: Ch1 content page renders the full bilingual article

The `/ch1` route SHALL display the complete bilingual text of "My Trip to New York City" (Slow English Podcast, B1), divided into named scene blocks. The visual design SHALL follow the design language of `_private/ch1-new york travel.html` (paper color palette, Fraunces / Newsreader / Noto Sans TC fonts).

#### Scenario: Article renders all scene blocks

- **WHEN** the user visits `/ch1`
- **THEN** all scene blocks from the original HTML appear in order, each with a scene number, title (Chinese + English), and sentence-by-sentence bilingual content

### Requirement: English and Chinese text are displayed on separate lines (mobile-first)

Within article sentences and vocabulary items, English text and Chinese text SHALL each occupy their own line. They SHALL NOT be placed side by side on the same line.

#### Scenario: Mobile line break

- **WHEN** a sentence block renders on a screen narrower than 640 px
- **THEN** the English sentence appears on one line and the Chinese translation appears on the next line, with a left border accent

### Requirement: Vocabulary items include KK phonetics, part of speech, and meaning

All vocabulary items listed in the proposal SHALL be included. Each word / phrase item SHALL display:

1. English word or phrase (primary, larger text)
2. KK phonetic notation (smaller font size, below English)
3. Part of speech (abbreviated, e.g., adj., v., n., phr.)
4. Chinese meaning or annotation

#### Scenario: KK phonetics size

- **WHEN** a vocabulary item is rendered
- **THEN** the KK phonetic text is visually smaller than the English word (e.g., `text-sm` vs default)

#### Scenario: All 60+ vocabulary items are present

- **WHEN** the user scrolls through the Ch1 vocabulary sections
- **THEN** every item from the proposal vocabulary list (from "from the moment" through "to board") appears with KK phonetics, part of speech, and Chinese meaning

### Requirement: Vocabulary items needing detailed explanation display an underline

Words or phrases that have a corresponding detailed explanation card (PhraseCard or SentenceBreakdown) SHALL be displayed with an underline style in the article text, signaling to the user that additional detail is available below.

#### Scenario: Underlined word presence

- **WHEN** a word appears in article text AND has a corresponding explanation card below
- **THEN** that word is styled with an underline (bottom border or text-decoration)

##### Example:

- Word "layover" appears in article text AND `#vocab-layover` card exists on the page → "layover" is rendered as `<span class="underline" data-target="vocab-layover">layover</span>`
- Word "the" appears in article text AND has NO corresponding explanation card → "the" is rendered as plain text with no underline

### Requirement: Sentence breakdown cards cover all required phrases

All sentence / phrase items listed in the proposal "4.2 句型 / 用法解析" table SHALL each have a corresponding explanation card on the Ch1 page. Each card SHALL include:

- The original English sentence or phrase
- Chinese translation
- Structural breakdown with labeled components

#### Scenario: to have had explanation card

- **WHEN** the user scrolls to the relevant section of Ch1
- **THEN** a card explaining "to have had" (不定詞完成式) appears with usage context, formula, and at least two example sentences

#### Scenario: Participial phrase card

- **WHEN** the user views the explanation for "getting you to pay attention..."
- **THEN** a card covering participial phrases (分詞片語) appears, including: types, usage, present vs. past participle distinction

### Requirement: Explanation card anchor ids follow a consistent naming scheme

Every PhraseCard and SentenceBreakdown that is a scroll target for an underlined word SHALL have an HTML element id following the pattern `vocab-{slug}` where `{slug}` is a lowercase kebab-case identifier derived from the English word or phrase.

#### Scenario: Anchor id format

- **GIVEN** an explanation card for the word "layover"
- **THEN** its root element has id="vocab-layover"

- **GIVEN** an explanation card for "to have had"
- **THEN** its root element has id="vocab-to-have-had"
