# misshoney-playlist-routes Specification (Delta)

## ADDED Requirements

### Requirement: Four CEFR-level playlist entry routes are accessible

The application SHALL provide four playlist entry routes: `/a1`, `/a2`, `/b1`, `/b2`, each rendering a `PlaylistView` component that displays the corresponding MissHoney playlist.

#### Scenario: User navigates to a playlist entry route

- **GIVEN** the user navigates to `/a1`
- **THEN** the page renders without error
- **THEN** the page title displays "A1 Beginner English"
- **THEN** a list of learnable video cards is visible in reverse order (highest original index first)
- **THEN** skipped videos are not shown as clickable cards

### Requirement: Video sub-page routes are accessible for learnable videos

The application SHALL provide video sub-page routes of the form `/:level/:videoSlug` (e.g., `/a1/ch1-what-is-your-name`), each rendering a `PlaylistVideoView` component. The slug format is `ch[reverseIndex]-[english-title-kebab]` where reverseIndex counts only learnable videos (skipped videos do not occupy a ch number).

#### Scenario: User navigates to a ready video sub-page

- **GIVEN** a video with status `ready` exists at slug `ch1-what-is-your-name` in the A1 playlist
- **WHEN** the user navigates to `/a1/ch1-what-is-your-name`
- **THEN** the page renders the full learning content (bilingual text, vocabulary, phrases)

#### Scenario: User navigates to a pendingTranscript video sub-page

- **GIVEN** a video with status `pendingTranscript` exists at slug `ch2-hello-and-goodbye`
- **WHEN** the user navigates to `/a1/ch2-hello-and-goodbye`
- **THEN** the page displays "內容整理中" placeholder message
- **THEN** no learning content is shown

#### Scenario: User navigates to a non-existent video slug

- **WHEN** the user navigates to `/a1/ch99-nonexistent`
- **THEN** the page displays "找不到此影片" error message

### Requirement: Difficulty display order is fixed from easy to hard

The four levels SHALL always appear in the order A1 → A2 → B1 → B2 in all UI surfaces (playlist entry cards, NavBar dropdown).

#### Scenario: difficulty levels appear in ascending order on all UI surfaces

- **WHEN** the NavBar MissHoney dropdown is open
- **THEN** the items appear in the order A1, A2, B1, B2 (top to bottom)

- **WHEN** the homepage MissHoney section is rendered
- **THEN** the four navigation cards appear in the order A1, A2, B1, B2 (left to right or top to bottom)
