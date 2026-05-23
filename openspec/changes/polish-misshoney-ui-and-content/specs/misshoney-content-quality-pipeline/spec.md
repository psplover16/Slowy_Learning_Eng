## ADDED Requirements

### Requirement: Playlist content uses the polished learning schema

Every promoted MissHoney ready video JSON SHALL use a polished learning schema that contains header metadata, scenes, vocabulary groups, phrases, and sentence breakdowns. Promotion SHALL NOT accept a ready video JSON that only contains the previous draft schema.

#### Scenario: Promoted content contains required top-level sections

- **WHEN** the content validator reads a ready MissHoney video JSON
- **THEN** the JSON contains `videoId`, `slug`, `level`, `title`, `youtubeUrl`, `header`, `scenes`, `vocabGroups`, `phrases`, and `breakdowns`
- **AND** `scenes`, `vocabGroups`, `phrases`, and `breakdowns` are arrays

#### Scenario: Old draft schema is rejected

- **WHEN** the content validator reads a ready MissHoney video JSON with scenes, vocabGroups, and phrases but no header and no breakdowns
- **THEN** validation fails for that file
- **AND** the failure output identifies the level, slug, and missing fields

### Requirement: Transcript cues are rebuilt into natural bilingual sentences

MissHoney generated content SHALL transform raw caption cues into natural English sentences or natural short speech units before writing scene sentences. Traditional Chinese translations SHALL be natural Traditional Chinese learning text, not raw word-for-word machine output.

#### Scenario: Cue fragments are rejected

- **WHEN** a generated scene sentence begins with a lowercase continuation, ends mid-phrase, contains duplicated cue boundary words, or has no sentence boundary across multiple cues
- **THEN** validation fails for that sentence
- **AND** the failure output identifies the scene id and sentence index

##### Example: Cue fragment rejection

| English sentence | Expected validation |
| ---------------- | ------------------- |
| `Who want to learn Listening to English today's podcast is about my daily routine my daily.` | fail: cue fragment or unpolished sentence |
| `Today I want to talk about my daily routine.` | pass |
| `Your favorite dinner at 1100 p.m. I go to sleep I love sleeping I love feeling.` | fail: merged unrelated cue fragments |

#### Scenario: Translation quality gate rejects empty or copied text

- **WHEN** a generated sentence has an empty Traditional Chinese translation, a translation identical to the English text, or a translation that contains unresolved replacement markers
- **THEN** validation fails for that sentence
- **AND** promotion is blocked

### Requirement: Vocabulary, phrases, and sentence breakdowns are instructional

Promoted MissHoney content SHALL include instructional vocabulary, phrase, and sentence breakdown entries that are useful to an English learner. Each ready video SHALL contain at least one non-empty vocabulary group, one phrase entry, and one sentence breakdown entry.

#### Scenario: Vocabulary item contains learner-facing fields

- **WHEN** a vocabulary item is validated
- **THEN** it contains English text, KK phonetics, part of speech, and Traditional Chinese meaning
- **AND** the meaning is not empty

#### Scenario: Phrase entry contains bilingual examples

- **WHEN** a phrase entry is validated
- **THEN** it contains a phrase, Traditional Chinese meaning, and at least one example with English and Traditional Chinese text

#### Scenario: Sentence breakdown contains teachable points

- **WHEN** a sentence breakdown entry is validated
- **THEN** it contains the source sentence, Traditional Chinese translation, and at least one point with label, text, and learner-facing note

### Requirement: Scaffold output guides human or AI-assisted authoring

The MissHoney scaffold command SHALL produce authoring source files that preserve transcript evidence and include a concrete authoring checklist for polished content creation.

#### Scenario: Scaffold contains source transcript and checklist

- **WHEN** the operator runs the scaffold command for a level with transcripts
- **THEN** every generated scaffold file contains video metadata, normalized transcript text, original cue references, suggested scene boundaries, and an authoring checklist
- **AND** the scaffold does not overwrite promoted app content

### Requirement: Promotion is gated by validation

The MissHoney promotion command SHALL write app content only from generated content that passes the polished content validator. Failed validation SHALL stop promotion before app data is modified.

#### Scenario: Failed validation blocks promotion

- **WHEN** one generated content file for level A1 fails polished validation
- **THEN** the promotion command exits with a non-zero status
- **AND** app data files for that level remain unchanged
- **AND** the output names the failing slug and validation reason

### Requirement: Existing MissHoney generated content is treated as draft until revalidated

The previously generated A1, A2, B1, and B2 content SHALL NOT be treated as production-ready unless it is rewritten or corrected to satisfy the polished learning schema and quality gates.

#### Scenario: Full validation requires all ready videos to use polished content

- **WHEN** the operator runs validation for all MissHoney levels
- **THEN** every ready video in A1, A2, B1, and B2 passes the polished schema and content quality checks
- **AND** any file that still contains draft cue-fragment prose fails validation
