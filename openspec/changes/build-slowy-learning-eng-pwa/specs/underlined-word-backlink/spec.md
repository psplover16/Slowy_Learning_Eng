## ADDED Requirements

### Requirement: Tapping an underlined word smoothly scrolls to its explanation card

- **WHEN** the user taps an underlined word or phrase in the article text
- **THEN** the page smoothly scrolls (`scrollIntoView({ behavior: 'smooth' })`) to the explanation card whose id matches the underlined word's `data-target` attribute

#### Scenario: Scroll target resolution

- **GIVEN** an underlined word rendered as `<span class="underline" data-target="vocab-layover">layover</span>`
- **WHEN** the user taps "layover"
- **THEN** the element with id="vocab-layover" is scrolled into view

### Requirement: A floating action button (FAB) appears after tapping an underlined word

After the scroll to the explanation card is triggered, a floating "回到單字" button SHALL appear fixed at the bottom-right corner of the viewport.

#### Scenario: FAB visibility

- **WHEN** no underlined word has been tapped yet
- **THEN** the FAB is not visible

- **WHEN** the user taps an underlined word and the scroll completes
- **THEN** the FAB is visible (`position: fixed; bottom: 1.5rem; right: 1.5rem`)

### Requirement: The FAB returns the viewport to the exact position of the tapped word

The FAB SHALL scroll back to the `window.scrollY` value that was recorded at the moment the underlined word was tapped — NOT to the explanation card, and NOT to the paragraph title.

#### Scenario: Return to source scroll position

- **GIVEN** `window.scrollY` = 840 when the user taps the word "layover"
- **WHEN** the user taps the FAB
- **THEN** `window.scrollTo({ top: 840, behavior: 'smooth' })` is called

### Requirement: Multiple underlined words pointing to the same explanation card each record their own source position

#### Scenario: Two words link to same card, each returns to own position

- **GIVEN** both "scammed" (at scrollY 1200) and "scamming" (at scrollY 1240) link to `vocab-scammed`
- **WHEN** the user taps "scammed" (scrollY 1200), scrolls to the card, then taps the FAB
- **THEN** the viewport returns to scrollY 1200

- **WHEN** the user taps "scamming" (scrollY 1240), scrolls to the card, then taps the FAB
- **THEN** the viewport returns to scrollY 1240

### Requirement: Tapping the FAB hides it

#### Scenario: FAB disappears on tap

- **WHEN** the user taps the FAB
- **THEN** the FAB disappears after the return scroll is triggered

##### Example:

- `sourceScrollY` = 840, FAB is visible → user taps FAB → `window.scrollTo({ top: 840 })` fires → `sourceScrollY` is set to `null` → FAB is no longer rendered (`v-if="sourceScrollY !== null"` evaluates to false)

### Requirement: Tapping a different underlined word while the FAB is visible updates the source position

#### Scenario: Second word tap overrides FAB source position

- **GIVEN** FAB is visible with source scrollY = 840
- **WHEN** the user taps another underlined word at scrollY = 1500
- **THEN** the FAB remains visible and its source scrollY updates to 1500
