## ADDED Requirements

### Requirement: Home view displays a separated MissHoney navigation section

The home route (`/`) SHALL display a MissHoney section below the existing article chapter list. The section SHALL contain one navigation card for each configured MissHoney level and SHALL preserve the existing article chapter list behavior.

#### Scenario: MissHoney section renders after articles

- **WHEN** the user visits `/`
- **THEN** the article chapter list renders first
- **AND** the MissHoney heading renders below the article chapter list
- **AND** four MissHoney navigation cards render for A1, A2, B1, and B2

#### Scenario: MissHoney cards have stable vertical spacing

- **WHEN** the home route renders the MissHoney section
- **THEN** the A1, A2, B1, and B2 cards are separated by the same vertical gap pattern used by the article list
- **AND** the cards do not visually touch each other on mobile or desktop viewports

#### Scenario: MissHoney navigation cards omit completion controls

- **WHEN** the home route renders MissHoney level cards
- **THEN** the cards show title and subtitle text
- **AND** the cards do not render chapter completion toggle controls
- **AND** tapping a MissHoney card navigates to the matching level route

##### Example: Level navigation

| Card label | Expected route |
| ---------- | -------------- |
| A1 | `/a1` |
| A2 | `/a2` |
| B1 | `/b1` |
| B2 | `/b2` |

### Requirement: Article chapter list remains unchanged by MissHoney section

The existing article chapter list SHALL keep its completion controls, stored completion behavior, title and subtitle rendering, and navigation targets after the MissHoney section is added or restyled.

#### Scenario: Chapter completion still works

- **WHEN** the user toggles the completion control for chapter `ch1` on the home route
- **THEN** the chapter completion icon changes state
- **AND** the state is persisted to `slowy:completion`
- **AND** MissHoney completion storage is not modified
