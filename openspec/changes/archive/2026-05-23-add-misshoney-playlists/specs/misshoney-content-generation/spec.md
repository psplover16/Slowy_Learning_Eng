## ADDED Requirements

### Requirement: Content scaffolding creates authoring scaffolds for every imported transcript

The project SHALL provide a repeatable scaffold workflow that converts each imported transcript into authoring material. The scaffold command SHALL NOT create final bilingual learning content and SHALL NOT change app content.

#### Scenario: level content scaffolding creates one scaffold per transcript

- **GIVEN** `_private/misshoney/transcripts/a1/` contains transcript files for `ch1-nice-to-meet-you.json` and `ch2-how-are-you.json`
- **WHEN** the user runs `npm run misshoney:scaffold-content -- --level a1`
- **THEN** `_private/misshoney/content-scaffolds/a1/ch1-nice-to-meet-you.json` exists
- **THEN** `_private/misshoney/content-scaffolds/a1/ch2-how-are-you.json` exists
- **THEN** each scaffold contains matching `videoId`, `slug`, `level`, `title`, `youtubeUrl`, normalized transcript text, source cue references, and suggested scene boundaries
- **THEN** no file under `src/modules/playlists/data/videos/` is created, changed, or deleted by the scaffold command

### Requirement: Content authoring fills PlaylistVideoData drafts from scaffolds

The implementation workflow SHALL treat bilingual translation, vocabulary selection, and phrase explanation as an authoring step performed by the apply agent or a human reviewer. The app SHALL NOT depend on runtime AI calls for this content.

#### Scenario: apply agent authors complete content from scaffold

- **GIVEN** `_private/misshoney/content-scaffolds/a1/ch1-nice-to-meet-you.json` exists
- **WHEN** the apply agent authors `_private/misshoney/generated-content/a1/ch1-nice-to-meet-you.json`
- **THEN** the generated file is valid `PlaylistVideoData`
- **THEN** each scene sentence has non-empty English text derived from the source transcript and non-empty Traditional Chinese translation
- **THEN** `vocabGroups` contains beginner-relevant words or phrases from the source transcript
- **THEN** `phrases` contains phrase explanations and bilingual examples grounded in the source transcript
- **THEN** no app runtime code calls YouTube, OpenAI, or another external service to create the content

### Requirement: Content validation blocks incomplete learning content

The project SHALL validate generated or promoted `PlaylistVideoData` files before they are treated as ready app content.

#### Scenario: validator accepts complete content

- **GIVEN** `_private/misshoney/generated-content/a1/ch1-nice-to-meet-you.json` contains at least one scene sentence pair with non-empty `en` and `tc`, at least one vocab item with `word`, `pos`, and `meaning`, and at least one phrase with one example pair
- **WHEN** the user runs `npm run misshoney:validate-content -- --level a1`
- **THEN** the command exits with code 0
- **THEN** the report lists `ch1-nice-to-meet-you` as valid

#### Scenario: validator rejects missing bilingual content

- **GIVEN** `_private/misshoney/generated-content/a1/ch1-nice-to-meet-you.json` has a scene sentence with an empty `tc` field
- **WHEN** the user runs `npm run misshoney:validate-content -- --level a1`
- **THEN** the command exits with a non-zero code
- **THEN** the report identifies the slug `ch1-nice-to-meet-you` and the missing `tc` field

### Requirement: Content promotion wires complete videos into app routes

The project SHALL promote only validated content into app data. Promoted videos SHALL become `ready` entries with `contentLoader` in the matching level metadata file.

#### Scenario: promoted level content becomes route-loadable

- **GIVEN** `npm run misshoney:validate-content -- --level a1` exits with code 0
- **WHEN** the user runs `npm run misshoney:promote-content -- --level a1`
- **THEN** every JSON file under `_private/misshoney/generated-content/a1/` is copied to `src/modules/playlists/data/videos/a1/`
- **THEN** `src/modules/playlists/data/a1.ts` contains one `ready` video entry for each promoted JSON file
- **THEN** each promoted video entry has a non-null `contentLoader`
- **THEN** each promoted video resolves at `/a1/<slug>`

#### Scenario: skipped videos are not promoted

- **GIVEN** `_private/misshoney/skipped/a1.json` contains a video with reason `no-english-captions`
- **WHEN** the user runs `npm run misshoney:promote-content -- --level a1`
- **THEN** no JSON content file is created for that skipped video
- **THEN** the video appears in `skippedVideos`
- **THEN** the video does not appear in the routable `videos` array

### Requirement: Complete content coverage is verifiable across all levels

The project SHALL provide a full coverage check for A1, A2, B1, and B2. The check SHALL fail if any imported transcript lacks generated content or any generated content is not promoted to app data.

#### Scenario: all-level validation reports complete coverage

- **WHEN** the user runs `npm run misshoney:validate-content -- --all`
- **THEN** the command checks A1, A2, B1, and B2
- **THEN** the command reports counts for transcripts, content scaffolds, generated content files, promoted app content files, and skipped videos for each level
- **THEN** the command exits with code 0 only when every imported transcript has a content scaffold, every content scaffold has generated content, and every generated content file is promoted
