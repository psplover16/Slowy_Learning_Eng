## ADDED Requirements

### Requirement: Ch2 chapter page is accessible at /ch2

The system SHALL register Ch2 in the chapter registry so Vue Router auto-generates a route at `/ch2` that renders `ChapterView` with `id="ch2"`.

#### Scenario: User navigates to Ch2
- **WHEN** the user navigates to `/ch2`
- **THEN** `ChapterView` renders with the Ch2 data and displays the title "How Languages Are Really Learned"

#### Scenario: Ch2 route appears in chapter registry
- **WHEN** the app initialises
- **THEN** the chapter registry contains an entry with `id: 'ch2'` and `path: '/ch2'`

### Requirement: Ch2 has no full-text article

Ch2 SHALL have an empty `scenes` array. The bilingual full-text section and its navigation button SHALL NOT appear on the Ch2 page.

#### Scenario: Full-text section is absent
- **WHEN** the user visits `/ch2`
- **THEN** no "中英對照全文" section block is rendered and no "全文" button appears in the quick-nav bar

### Requirement: Ch2 vocabulary section is present

Ch2 SHALL include at least one vocabulary group with word entries.

#### Scenario: Vocabulary section renders
- **WHEN** the user visits `/ch2`
- **THEN** the vocabulary section is visible and contains grouped word entries with English term, part-of-speech, and Chinese meaning

### Requirement: Ch2 phrases section is present

Ch2 SHALL include at least one phrase card entry.

#### Scenario: Phrases section renders
- **WHEN** the user visits `/ch2`
- **THEN** the phrases section is visible with at least one `PhraseCard` rendered

### Requirement: Ch2 sentence breakdowns section is present

Ch2 SHALL include at least one sentence breakdown entry.

#### Scenario: Breakdowns section renders
- **WHEN** the user visits `/ch2`
- **THEN** the sentence breakdown section is visible with at least one `SentenceBreakdown` rendered

### Requirement: Ch2 header level and topic tags are empty

Ch2 `headerLevelTag` and `headerTopicTag` SHALL be empty strings. No level or topic badge elements SHALL render in the Ch2 header.

#### Scenario: No badge rendered for empty tag
- **WHEN** the user visits `/ch2`
- **THEN** the header area shows no coloured badge for level or topic
