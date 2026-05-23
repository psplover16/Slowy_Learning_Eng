## ADDED Requirements

### Requirement: Import tool fetches playlists and captions automatically

The project SHALL provide a script-driven MissHoney import workflow. The user SHALL NOT be required to manually copy playlist URLs beyond the configured sources file, manually collect video IDs, or manually copy subtitles.

#### Scenario: source playlists are configured once

- **GIVEN** `scripts/misshoney/sources.json` exists
- **THEN** it contains exactly four entries in this order: A1, A2, B1, B2
- **THEN** each entry contains `level`, `title`, and `playlistUrl`

#### Scenario: import command does not require manual subtitle fetching

- **WHEN** the user runs `npm run misshoney:import`
- **THEN** the importer reads the configured playlist URLs
- **THEN** the importer attempts to fetch public playlist metadata and English captions or auto-captions automatically
- **THEN** the command output does not ask the user to manually paste subtitles

#### Scenario: import command covers every configured level

- **WHEN** the user runs `npm run misshoney:import`
- **THEN** the importer processes A1, A2, B1, and B2 in the configured order
- **THEN** the command reports per-level counts for imported transcripts and skipped videos

### Requirement: Import output is generated under `_private/misshoney`

Raw imported data SHALL be written under `_private/misshoney` only. The importer SHALL NOT write or overwrite curated app content under `src/modules/playlists/data/videos/**`.

#### Scenario: generated files are separated from curated app data

- **WHEN** the importer succeeds for level `a1`
- **THEN** it writes playlist inventory to `_private/misshoney/inventory/a1.json`
- **THEN** it writes transcript files to `_private/misshoney/transcripts/a1/<slug>.json`
- **THEN** it writes skipped report entries to `_private/misshoney/skipped/a1.json`
- **THEN** it writes per-level counts to `_private/misshoney/import-summary.json`
- **THEN** no file under `src/modules/playlists/data/videos/` is created, changed, or deleted by the importer

#### Scenario: existing raw outputs can be checked without fetching YouTube

- **WHEN** the user runs `npm run misshoney:import -- --check-existing`
- **THEN** the importer reads existing files under `_private/misshoney/inventory`, `_private/misshoney/transcripts`, and `_private/misshoney/skipped`
- **THEN** the command exits with code 0 only when every non-skipped inventory item has one matching transcript file
- **THEN** the command does not call YouTube

#### Scenario: importer can be re-run without overwriting curated content

- **GIVEN** `src/modules/playlists/data/videos/a1/ch1-what-is-your-name.json` exists
- **WHEN** the user re-runs `npm run misshoney:import`
- **THEN** that curated JSON file remains unchanged

### Requirement: Import tool handles unavailable captions and videos safely

The importer SHALL treat unavailable videos and captions as reportable states, not as manual work for the user.

#### Scenario: video has no public English captions

- **WHEN** a playlist video has no public English captions or auto-captions
- **THEN** the importer records the video in `_private/misshoney/skipped/<level>.json`
- **THEN** the skipped reason is `no-english-captions`

#### Scenario: video is private, member-only, unavailable, or geo-restricted

- **WHEN** a playlist video cannot be fetched publicly
- **THEN** the importer records the video in `_private/misshoney/skipped/<level>.json`
- **THEN** the skipped reason is one of `member-only`, `private`, `unavailable`, or `geo-restricted`
- **THEN** the importer continues processing the remaining videos

### Requirement: Import helper functions are testable without network access

Network calls SHALL be isolated in the CLI wrapper. Playlist ordering, slug creation, skipped reason mapping, transcript normalization, and output planning SHALL be implemented as pure helper functions that can be unit-tested without YouTube access.

#### Scenario: skipped videos do not consume display order

- **GIVEN** raw playlist items with original indexes 1, 2, 3, 4 where index 2 is skipped
- **WHEN** the importer normalizes the playlist in reverse original-index order
- **THEN** the non-skipped video at original index 4 receives `displayOrder: 1`
- **THEN** the non-skipped video at original index 3 receives `displayOrder: 2`
- **THEN** the non-skipped video at original index 1 receives `displayOrder: 3`
- **THEN** the skipped video receives no display order and no slug

#### Scenario: slug is generated from display order and English title

- **GIVEN** a learnable video with `displayOrder: 1` and title `What Is Your Name?`
- **WHEN** the importer derives the slug
- **THEN** the slug is `ch1-what-is-your-name`
