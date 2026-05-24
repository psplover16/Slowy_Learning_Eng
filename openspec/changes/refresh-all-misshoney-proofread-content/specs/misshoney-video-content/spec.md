## ADDED Requirements

### Requirement: Refreshed video data is sourced from proofread JSON

Every refreshed MissHoney ready video for A1, A2, B1, and B2 SHALL be written from the corresponding validated proofread JSON. The app route data MUST preserve existing metadata such as title, slug, level, videoId, and youtubeUrl while replacing learning content with proofread text, translation, segments, vocabulary, phrases, special usages, and grammar analysis.

#### Scenario: Valid proofread JSON updates a ready video

- **WHEN** _private/tmp/step1/a1/sample-video.md contains valid proofread JSON
- **AND** the app has an existing ready video with level a1 and slug sample-video
- **THEN** the ready video data contains content derived from correctedText, translation, segments, words, phrases, usages, and grammar
- **AND** the existing title, slug, level, videoId, and youtubeUrl remain populated

#### Scenario: Invalid proofread JSON does not overwrite route data

- **WHEN** a proofread output for a ready video fails validation
- **THEN** the existing route data for that video remains unchanged
- **AND** the failure is recorded with level, slug, field, and reason

### Requirement: Proofread sections map to first-class video content

The MissHoney video content schema SHALL represent proofread output as first-class learning sections: bilingual full text segments, vocabulary entries, phrase entries, special usage entries, and grammar or sentence pattern entries. Special usages MUST NOT be merged into vocabulary or phrase sections.

#### Scenario: Proofread arrays create matching learning sections

- **WHEN** proofread JSON contains non-empty words, phrases, usages, and grammar arrays
- **THEN** the refreshed video content exposes vocabulary, phrase, special usage, and grammar sections
- **AND** each section uses stable entry identifiers for route rendering and marker navigation

#### Scenario: Empty optional arrays do not create broken sections

- **WHEN** proofread JSON contains an empty usages array
- **THEN** the refreshed video content does not render an empty special usage section
- **AND** other sections still render normally

### Requirement: Source traceability is retained for refreshed content

Each refreshed video content file SHALL retain enough source traceability to identify the originating level, slug, original subtitle path, and step1 proofread output path. This traceability MUST support later repair without requiring a new full rollout.

#### Scenario: Refreshed content includes processing provenance

- **WHEN** a video is refreshed from _private/tmp/originalContent/b1/example.md and _private/tmp/step1/b1/example.md
- **THEN** the normalized content or verification report records level b1, slug example, source path, and proofread output path

#### Scenario: Repair list references traceable video identifiers

- **WHEN** a video cannot be written back because of invalid proofread JSON
- **THEN** the repair list contains the level, slug, source path, proofread output path, and reason
