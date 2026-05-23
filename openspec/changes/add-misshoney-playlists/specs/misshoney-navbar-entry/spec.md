## ADDED Requirements

### Requirement: MissHoney dropdown button in NavBar

The NavBar displays a "MissHoney ▾" button positioned next to the existing "內容" button.

#### Scenario: MissHoney button is visible

- **WHEN** the user views any page
- **THEN** the NavBar shows a "MissHoney ▾" button that is styled identically to the "內容" button (same padding, font, hover behaviour)

#### Scenario: button is active when a MissHoney route is current

- **WHEN** the current route is `/a1`, `/a2`, `/b1`, `/b2`, or any of their sub-pages
- **THEN** the MissHoney button shows the active style (terracotta background, white text)

- **WHEN** the current route is not a MissHoney route
- **THEN** the MissHoney button shows the inactive style (paper background, ink text)

### Requirement: MissHoney dropdown menu contains A1–B2 items

#### Scenario: dropdown opens on click

- **WHEN** the user clicks "MissHoney ▾"
- **THEN** a dropdown menu appears with four items: A1, A2, B1, B2 in that order

#### Scenario: clicking a difficulty item navigates and closes

- **WHEN** the user clicks "A1" in the open dropdown
- **THEN** the app navigates to `/a1` and the dropdown closes

- **WHEN** the user clicks "A2" in the open dropdown
- **THEN** the app navigates to `/a2` and the dropdown closes

#### Scenario: dropdown closes on outside click or Escape

- **WHEN** the dropdown is open and the user clicks outside it
- **THEN** the dropdown closes

- **WHEN** the dropdown is open and the user presses Escape
- **THEN** the dropdown closes

### Requirement: Dropdown overflow prevention

The dropdown menu must not overflow the visible viewport.

#### Scenario: dropdown stays within viewport

- **WHEN** the MissHoney dropdown is open
- **THEN** the dropdown width is `w-max` (content-sized) with `max-w-[calc(100vw-11rem)]`, anchored at `left-0` relative to the MissHoney button, so it does not extend beyond the right edge of the viewport
