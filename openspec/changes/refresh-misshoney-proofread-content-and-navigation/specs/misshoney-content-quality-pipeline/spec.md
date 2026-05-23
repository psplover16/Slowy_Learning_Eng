## ADDED Requirements

### Requirement: Single-video transcript extraction command

The MissHoney content pipeline SHALL provide a command that extracts the public English transcript for one selected playlist video and writes the transcript text to a caller-provided output path.

#### Scenario: Extract A1 ch1 transcript to tmp file

- **WHEN** the command is run with level `a1`, slug `ch1-slow-english-for-beginners-a1-listening-practice`, and output `_private/tmp.txt`
- **THEN** the command resolves the video metadata for that slug
- **AND** the command fetches the public English transcript for the video's YouTube URL
- **AND** the command overwrites `_private/tmp.txt` with transcript text
- **AND** the command exits with code 0

#### Scenario: Transcript extraction reports unavailable captions

- **WHEN** the command is run for a video with no public English transcript
- **THEN** the command exits with a non-zero code
- **AND** the command output identifies the level, slug, YouTube URL, and reason `no-public-english-transcript`
- **AND** the command does not mark the video as proofread or ready

### Requirement: Proofread result JSON is the parser contract

The MissHoney proofread parser SHALL read a machine-readable JSON code block from `proofread_result.md` and SHALL reject proofread results that do not contain the required JSON shape.

#### Scenario: Parser accepts required proofread JSON shape

- **WHEN** `proofread_result.md` contains a JSON code block with `correctedText`, `translation`, `segments`, `words`, `phrases`, `usages`, and `grammar`
- **THEN** the parser returns a normalized proofread draft
- **AND** missing optional arrays are normalized to empty arrays only when the JSON contains the required top-level keys
- **AND** the parser preserves the main subtitle content from `correctedText` and `segments`

##### Example: Minimum accepted JSON

```json
{
  "correctedText": "I eat an **apple** every day.",
  "translation": "我每天吃一顆蘋果。",
  "segments": [{ "english": "I eat an **apple** every day.", "translation": "我每天吃一顆蘋果。" }],
  "words": [{ "lemma": "apple", "surface": "apple", "partOfSpeech": "noun", "kk": "[ˈæpəl]", "meaning": "蘋果", "examples": ["I eat an apple every day."] }],
  "phrases": [],
  "usages": [],
  "grammar": []
}
```

#### Scenario: Parser rejects missing or unsafe proofread JSON

- **WHEN** `proofread_result.md` has no JSON code block, invalid JSON, missing required top-level keys, or HTML strings inside learning content fields
- **THEN** the parser fails validation
- **AND** the failure output identifies the missing or unsafe field
- **AND** no app video JSON is overwritten

### Requirement: A1 ch1 vertical slice is a real proofread run

The first implementation pass SHALL run the complete proofread pipeline for A1 ch1 using the actual transcript extraction command and `english_proofreader` output; fixture-only proofread data SHALL NOT satisfy the vertical slice.

#### Scenario: A1 ch1 is promoted from real proofread output

- **WHEN** A1 ch1 is refreshed during the first apply pass
- **THEN** `_private/tmp.txt` is produced by the single-video transcript command
- **AND** `_private/proofread_result.md` is produced by `english_proofreader`
- **AND** the parser reads the JSON code block from `_private/proofread_result.md`
- **AND** A1 ch1 ready JSON is updated from the parsed proofread result
- **AND** `npm run misshoney:validate-content -- --level a1` passes

### Requirement: Later playlist refresh tasks remain planned but unexecuted in the first pass

The change tasks SHALL describe the A1 remainder, A2, B1, and B2 refresh workflow, but the first apply pass SHALL only complete foundation work and A1 ch1.

#### Scenario: First apply pass leaves later batches pending

- **WHEN** the first apply pass finishes
- **THEN** tasks for A1 ch2 and later videos remain unchecked or explicitly paused
- **AND** tasks for A2, B1, and B2 remain unchecked or explicitly paused
- **AND** A1 ch1 and foundation tasks are the only content refresh tasks marked complete
