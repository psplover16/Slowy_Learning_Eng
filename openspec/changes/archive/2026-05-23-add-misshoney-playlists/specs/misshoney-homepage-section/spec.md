## ADDED Requirements

### Requirement: MissHoney section on homepage

The homepage displays a MissHoney section below the existing article list (ch1–ch4), containing four navigation cards for A1, A2, B1, and B2.

#### Scenario: MissHoney section is visible on homepage

- **WHEN** the user visits the homepage (`/`)
- **THEN** below the existing ch1–ch4 article list, a section titled "MissHoney" (or equivalent heading) is visible with four cards labelled A1, A2, B1, B2 in that order

#### Scenario: clicking a difficulty card navigates to the playlist

- **WHEN** the user clicks the "A1" card in the MissHoney section
- **THEN** the app navigates to `/a1`

- **WHEN** the user clicks the "B2" card in the MissHoney section
- **THEN** the app navigates to `/b2`

### Requirement: MissHoney homepage cards do not show completion circles

The MissHoney navigation cards are for routing only; they do not show completion state.

#### Scenario: no completion circles on MissHoney homepage cards

- **WHEN** the MissHoney section is rendered
- **THEN** none of the four A1/A2/B1/B2 cards display a completion circle or any completion indicator

- **WHEN** the existing ch1–ch4 article list is rendered
- **THEN** each card still displays its completion circle as before (existing behaviour unchanged)

### Requirement: Existing article list is unaffected

#### Scenario: ch1–ch4 cards appear above MissHoney section

- **WHEN** the homepage is rendered
- **THEN** the ch1–ch4 cards appear in their existing order above the MissHoney section; their content, styling, and completion indicators are unchanged
