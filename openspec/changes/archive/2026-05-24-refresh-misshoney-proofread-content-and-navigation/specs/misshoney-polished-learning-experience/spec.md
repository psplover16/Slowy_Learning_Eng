## ADDED Requirements

### Requirement: Playlist video page supports precise English marker navigation

A ready MissHoney video page SHALL render clickable markers only in the English text for words, phrases, and special usages. Clicking a marker SHALL scroll to the exact matching learning item, center that item in the viewport, and apply a temporary highlight to the item.

#### Scenario: Word marker scrolls to matching word item

- **WHEN** the user clicks the English marker for `apple` in A1 ch1
- **THEN** the page scrolls smoothly to the learning item whose anchor id is `word-apple`
- **AND** the `apple` learning item is centered in the viewport as closely as the browser allows
- **AND** the `apple` learning item receives a temporary highlight state

#### Scenario: Phrase marker scrolls to matching phrase item

- **WHEN** the user clicks the English marker for `take on`
- **THEN** the page scrolls smoothly to the learning item whose anchor id is `phrase-take-on`
- **AND** the phrase learning item receives a temporary highlight state

#### Scenario: Usage marker scrolls to matching special usage item

- **WHEN** the user clicks the English marker for `run` used as `run a business`
- **THEN** the page scrolls smoothly to the learning item whose anchor id identifies that special usage
- **AND** the special usage learning item receives a temporary highlight state

### Requirement: Learning item returns to the source marker instance

After the user navigates from an English marker to a learning item, the learning item SHALL provide a return action that scrolls back to the exact marker instance that initiated the jump.

#### Scenario: Return action restores the clicked marker instance

- **GIVEN** the word `apple` appears more than once in the English text
- **AND** the user clicks the second `apple` marker
- **WHEN** the user activates the return action on the `apple` learning item
- **THEN** the page scrolls smoothly back to the second `apple` marker instance
- **AND** the returned marker is centered in the viewport as closely as the browser allows

### Requirement: Special usages render as an independent section

A ready MissHoney video page SHALL render special usages as an independent learning section separate from vocabulary, phrases, and grammar.

#### Scenario: Special usage section appears when usages exist

- **WHEN** a ready video JSON contains one or more special usage entries
- **THEN** the video page renders a section for special usages
- **AND** the quick navigation includes an entry for the special usage section
- **AND** usage markers in the English text target items inside that section

#### Scenario: Special usage section is omitted when empty

- **WHEN** a ready video JSON contains no special usage entries
- **THEN** the video page does not render an empty special usage section
- **AND** the quick navigation does not include a special usage entry

### Requirement: Grammar navigation is section-based, not inline-marker-based

MissHoney video pages SHALL NOT create inline English grammar markers. Grammar and sentence breakdown content SHALL be reachable through quick navigation or section controls only.

#### Scenario: English inline markers exclude grammar targets

- **WHEN** the video page renders English text with word, phrase, usage, and grammar learning data
- **THEN** inline clickable markers are rendered only for word, phrase, and usage token types
- **AND** grammar entries do not create clickable inline markers in the English text

#### Scenario: Quick navigation reaches grammar section

- **WHEN** a ready video JSON contains grammar or sentence breakdown entries
- **THEN** the quick navigation includes a grammar or sentence breakdown entry
- **AND** activating that entry scrolls smoothly to the grammar section
