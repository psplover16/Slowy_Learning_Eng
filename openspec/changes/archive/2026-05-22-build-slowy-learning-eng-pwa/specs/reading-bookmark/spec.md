## ADDED Requirements

### Requirement: Each content page paragraph title is tappable and acts as a bookmark

Every scene block title on a content page SHALL be interactive. Tapping it saves that paragraph's id as the reading bookmark for that chapter in localStorage.

#### Scenario: Tapping a paragraph title saves the bookmark

- **WHEN** the user taps the title of scene block "04" on `/ch1`
- **THEN** `localStorage["slowy:bookmark"]` is updated to `{"ch1": "scene-04"}`

### Requirement: Only one bookmark per chapter route is active at a time

Saving a new bookmark for a chapter SHALL overwrite the previous bookmark for that chapter.

#### Scenario: Overwrite previous bookmark

- **GIVEN** `localStorage["slowy:bookmark"]` = `{"ch1": "scene-02"}`
- **WHEN** the user taps the title of scene block "07"
- **THEN** `localStorage["slowy:bookmark"]` becomes `{"ch1": "scene-07"}`
- **THEN** scene-02 is no longer marked or highlighted as a bookmark

### Requirement: Entering a content page auto-scrolls to the saved bookmark

#### Scenario: Auto-scroll on mount when bookmark exists

- **WHEN** the user navigates to `/ch1` and `localStorage["slowy:bookmark"]["ch1"]` is set to a paragraph id
- **THEN** the page smoothly scrolls to that paragraph on mount (`scrollIntoView({ behavior: 'smooth' })`)

#### Scenario: No bookmark saved

- **WHEN** the user visits `/ch1` for the first time (no stored bookmark)
- **THEN** the page renders at the top without any scroll

#### Scenario: Bookmark stored from previous session

- **GIVEN** `localStorage["slowy:bookmark"]` = `{"ch1": "scene-05"}`
- **WHEN** the user navigates to `/ch1`
- **THEN** the viewport scrolls to the element with id="scene-05"

### Requirement: Bookmark state does not affect other chapters

#### Scenario: Ch1 bookmark does not trigger scroll on Ch2

- **GIVEN** `localStorage["slowy:bookmark"]` = `{"ch1": "scene-03"}`
- **WHEN** the user visits a future `/ch2` route
- **THEN** Ch2 has no auto-scroll (its bookmark key is absent)
- **THEN** Ch1 bookmark is unchanged
