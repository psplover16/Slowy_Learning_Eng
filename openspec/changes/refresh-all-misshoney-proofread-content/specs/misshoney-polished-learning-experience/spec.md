## ADDED Requirements

### Requirement: Refreshed playlist video pages support A/B/C marker navigation

Every refreshed MissHoney playlist video detail page SHALL render English inline markers for vocabulary, phrases, and special usages as interactive targets. The page MUST scroll smoothly to the matching learning entry, center the target entry, and apply a temporary highlight.

#### Scenario: Vocabulary marker navigates to vocabulary entry

- **WHEN** a learner clicks an English word marker rendered from a word token
- **THEN** the page smooth scrolls to the matching vocabulary entry
- **AND** the vocabulary entry is positioned near the center of the viewport
- **AND** the entry receives a temporary highlight

#### Scenario: Phrase marker navigates to phrase entry

- **WHEN** a learner clicks an English phrase marker rendered from a phrase token
- **THEN** the page smooth scrolls to the matching phrase entry
- **AND** the phrase entry receives a temporary highlight

#### Scenario: Special usage marker navigates to usage entry

- **WHEN** a learner clicks an English special usage marker rendered from a usage token
- **THEN** the page smooth scrolls to the matching special usage entry
- **AND** the special usage entry receives a temporary highlight

### Requirement: Learning entries return to the clicked marker instance

Every marker-triggered learning entry SHALL provide a return action that scrolls back to the exact English marker instance that the learner clicked most recently. Repeated occurrences of the same word, phrase, or usage MUST NOT always return to the first occurrence.

#### Scenario: Repeated marker returns to second occurrence

- **WHEN** the word apple appears as two separate marker instances
- **AND** the learner clicks the second apple marker
- **AND** the learner then uses the return action from the apple vocabulary entry
- **THEN** the page scrolls back to the second apple marker instance

### Requirement: Grammar navigation remains section-based

Refreshed MissHoney video pages SHALL NOT render grammar or sentence pattern analysis as English inline markers. Grammar and sentence pattern sections SHALL remain reachable through quick navigation or section controls.

#### Scenario: Grammar is reachable through section navigation

- **WHEN** a refreshed video contains grammar entries
- **THEN** the page renders a grammar or sentence pattern section
- **AND** quick navigation or section controls can scroll to that section
- **AND** the English full text contains no grammar marker token

### Requirement: Refreshed pages preserve existing route behavior

The marker navigation refresh MUST NOT break existing MissHoney level pages, completion controls, ready video loading, or the existing /ch1 through /ch4 learning routes.

#### Scenario: Existing chapter pages remain usable

- **WHEN** the learner opens existing routes /ch1, /ch2, /ch3, or /ch4 after the refresh
- **THEN** those routes load without runtime errors
- **AND** their existing navigation behavior remains available

#### Scenario: MissHoney level pages still list videos

- **WHEN** the learner opens /a1, /a2, /b1, or /b2
- **THEN** the level page still renders the playlist entries
- **AND** ready video entries navigate to their detail pages
