## ADDED Requirements

### Requirement: Playlist level pages use article-list card styling

The MissHoney level routes (`/a1`, `/a2`, `/b1`, `/b2`) SHALL render video entries as vertically spaced cards that match the home article list card structure: primary title, optional subtitle, full-card navigation target, trailing completion toggle, paper background, rounded border, and hover/focus feedback.

#### Scenario: Level page renders article-style video cards

- **WHEN** the user visits `/a1`
- **THEN** every ready or pending video entry is rendered as an article-style card with title, optional subtitle, and a trailing completion toggle
- **AND** the cards are separated by a stable vertical gap

#### Scenario: Completion toggle persists per video

- **WHEN** the user toggles the completion control on a MissHoney video card
- **THEN** the card completion icon changes state
- **AND** the state is persisted under the MissHoney completion storage key for that videoId
- **AND** chapter completion storage is not modified

##### Example: Completion isolation

- **GIVEN** `localStorage["slowy:completion"]` is `{ "ch1": true }`
- **AND** `localStorage["slowy:miss-honey-completion"]` is `{}`
- **WHEN** the user toggles videoId `kVNYOW3eMk4` on `/a1`
- **THEN** `localStorage["slowy:miss-honey-completion"]` contains `{ "kVNYOW3eMk4": true }`
- **AND** `localStorage["slowy:completion"]` remains `{ "ch1": true }`

### Requirement: Playlist video pages render a polished reading layout

A ready MissHoney video route SHALL render a polished reading page that follows the existing chapter reading language: header block, source link, section quick navigation, numbered section headings, bilingual scene blocks, vocabulary, phrases, and sentence breakdowns.

#### Scenario: Ready video page renders all learning sections

- **WHEN** the user visits a ready video route such as `/a1/ch1-slow-english-for-beginners-a1-listening-practice`
- **THEN** the page displays a header with the video title, level tag, topic tag when present, and YouTube source link
- **AND** the page displays quick navigation for every non-empty learning section
- **AND** the page displays bilingual text, vocabulary, phrases, and sentence breakdowns when the content contains those arrays

#### Scenario: Mobile bilingual text uses separate lines

- **WHEN** a bilingual sentence renders on a viewport narrower than 640 px
- **THEN** the English text appears on its own line
- **AND** the Traditional Chinese translation appears on the next line with visual indentation or border treatment

### Requirement: Playlist reading sections are data-driven

MissHoney video pages SHALL render only sections whose backing arrays are non-empty. Visible section numbers SHALL start at 1 and increment according to the rendered section order.

#### Scenario: Empty section is hidden from content and quick nav

- **WHEN** a ready video has non-empty scenes and phrases but empty vocabGroups and breakdowns
- **THEN** the page displays only the bilingual text and phrases sections
- **AND** quick navigation displays only those two sections
- **AND** the visible section numbers are 1 and 2

##### Example: Dynamic section numbering

| scenes | vocabGroups | phrases | breakdowns | Expected quick nav |
| ------ | ----------- | ------- | ---------- | ------------------ |
| 2      | 1           | 1       | 1          | 全文, 單字, 片語, 句型 |
| 2      | 0           | 1       | 0          | 全文, 片語 |
| 0      | 1           | 0       | 1          | 單字, 句型 |

### Requirement: Playlist pages handle unavailable content without console errors

MissHoney playlist and video pages SHALL render safe fallback states for loading, unknown slugs, pending transcripts, malformed optional fields, and localStorage read failures.

#### Scenario: Unknown video slug shows not-found state

- **WHEN** the user visits `/a1/unknown-slug`
- **THEN** the page displays the not-found message
- **AND** no uncaught error is emitted during render

#### Scenario: Pending transcript shows in-progress state

- **WHEN** the user visits a video entry whose status is `pendingTranscript`
- **THEN** the page displays the content-in-progress message
- **AND** the page does not attempt to render learning sections
