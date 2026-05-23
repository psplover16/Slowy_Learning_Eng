## ADDED Requirements

### Requirement: Video completion state toggle

The `useMissHoneyCompletion` composable tracks which videos the user has marked as complete.

#### Scenario: user marks a video complete

- **WHEN** the user clicks the completion circle on a video card or video sub-page and the video was not previously marked complete
- **THEN** the circle fills (visual state: complete) and `{ videoId: true }` is written to `localStorage` under the key `slowy:miss-honey-completion`

#### Scenario: user un-marks a video

- **WHEN** the user clicks the completion circle again on a video that was already marked complete
- **THEN** the circle empties (visual state: incomplete) and the entry is set to `false` in `localStorage`

### Requirement: Completion state persists across reloads

#### Scenario: page reload retains completion state

- **WHEN** a user marks a video complete and then reloads the page
- **THEN** the completion circle for that video remains filled, read from `slowy:miss-honey-completion` in `localStorage`

### Requirement: Storage key isolation

MissHoney completion state uses a separate localStorage key from chapter completion state.

#### Scenario: MissHoney and chapter completion do not share storage

- **WHEN** the user completes a MissHoney video
- **THEN** the entry is written to `slowy:miss-honey-completion`; the `slowy:completion` key (used by chapters) is not modified

### Requirement: Graceful failure on localStorage error

#### Scenario: localStorage is unavailable

- **WHEN** `localStorage.getItem('slowy:miss-honey-completion')` throws or returns invalid JSON
- **THEN** `useMissHoneyCompletion` returns an empty completion map and does not crash

##### Example: storage data format

- **GIVEN** three videos with ids `aBcDe12345`, `fGhIj67890`, `kLmNo11111`
- **WHEN** the user has completed the first and third videos
- **THEN** `localStorage.getItem('slowy:miss-honey-completion')` returns `{"aBcDe12345":true,"fGhIj67890":false,"kLmNo11111":true}`
