# grammar-page Specification (Delta)

## ADDED Requirements

### Requirement: G19 grammar card for three natural future forms is present in Section 3

The grammar page SHALL include a GrammarCard with badge="G19" and title="三種自然未來式：going to / 現在進行式 / will" in Section 3 (動詞時態), positioned after the G07 card. The card SHALL display a comparison table with 3 rows (be going to, Present Continuous for future, will) and a futureFormsTable data array with 3 entries in the script.

#### Scenario: G19 card is visible on grammar page

- **WHEN** the user navigates to `/grammar`
- **THEN** Section 3 contains a card with badge "G19"
- **THEN** the card title reads "三種自然未來式：going to / 現在進行式 / will"
- **THEN** the comparison table shows exactly 3 rows
- **THEN** G01 through G18 cards are unmodified and visible
