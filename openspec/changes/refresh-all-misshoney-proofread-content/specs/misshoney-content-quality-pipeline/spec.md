## ADDED Requirements

### Requirement: Full local subtitle rollout pipeline

The MissHoney content quality pipeline SHALL process all available local original subtitles for A1, A2, B1, and B2 in that exact order. The pipeline MUST use _private/tmp/originalContent/<level>/ as the source directory and MUST NOT stop after the first A1 video unless a system-wide blocker prevents later files from being processed.

#### Scenario: Pipeline processes every level in order

- **WHEN** the full refresh pipeline starts
- **THEN** it processes all source files under _private/tmp/originalContent/a1 before a2
- **AND** it processes all source files under _private/tmp/originalContent/a2 before b1
- **AND** it processes all source files under _private/tmp/originalContent/b1 before b2
- **AND** it writes proofread outputs under _private/tmp/step1/<level>/ for each processed source file

#### Scenario: First A1 video is not a stopping point

- **WHEN** the first A1 source file finishes successfully
- **THEN** the pipeline immediately continues with the remaining A1 source files
- **AND** it does not require an additional human confirmation before processing later levels

### Requirement: Local subtitle extraction before proofread

The pipeline SHALL treat Markdown source files as subtitle text and SHALL parse JSON source files to extract the real transcript text before proofread. The pipeline MUST NOT send JSON metadata, unrelated fields, or raw JSON syntax to english_proofreader as subtitle content.

#### Scenario: Markdown source is used directly

- **WHEN** the source file is _private/tmp/originalContent/a1/example.md
- **THEN** the file body is sent as the subtitle text for that video

#### Scenario: JSON source is parsed structurally

- **WHEN** the source file is _private/tmp/originalContent/a1/example.json
- **THEN** the pipeline extracts the transcript or text content from the JSON structure
- **AND** it sends only the extracted subtitle text to english_proofreader

#### Scenario: Unknown JSON schema is reported

- **WHEN** a JSON source file has no recognizable transcript or text field
- **THEN** the video is added to the repair list with its level, slug, and source path
- **AND** the pipeline does not promote raw JSON as proofread content

### Requirement: One proofreader lifecycle per subtitle

The pipeline MUST use a fresh english_proofreader subagent for each subtitle file. Each english_proofreader subagent SHALL process exactly one subtitle, write exactly one step1 output, report completion, and close before the next subtitle starts.

#### Scenario: New proofreader is used for each source file

- **WHEN** two source files exist for the same level
- **THEN** the first file is processed by one english_proofreader instance
- **AND** that instance is closed after the first step1 output is written
- **AND** the second file is processed by a new english_proofreader instance

#### Scenario: Multi-file proofreader reuse is rejected

- **WHEN** an implementation attempts to send multiple subtitle files to the same english_proofreader instance
- **THEN** the pipeline contract is violated
- **AND** the task remains incomplete until each file has an independent proofreader lifecycle

### Requirement: Proofread output validation and final report

The pipeline SHALL validate every _private/tmp/step1/**/*.md file before app write-back. Validation MUST check file existence, non-empty content, a machine-readable JSON code block, required JSON fields, non-empty correctedText, translation, and segments, and absence of skip phrases such as same-as-above or omitted-for-length equivalents.

#### Scenario: Valid proofread output passes validation

- **WHEN** a step1 file contains parseable JSON with correctedText, translation, segments, words, phrases, usages, and grammar
- **AND** correctedText, translation, and segments are not empty
- **THEN** the file is eligible for app write-back

#### Scenario: Invalid proofread output enters repair list

- **WHEN** a step1 file has missing JSON, invalid JSON, missing required fields, empty core content, or skip phrases
- **THEN** the corresponding level and slug are recorded in the repair list
- **AND** the pipeline does not silently treat that file as successful

#### Scenario: Final verification report is produced

- **WHEN** A1, A2, B1, and B2 processing and grammar synchronization are complete
- **THEN** the pipeline produces a final verification report containing source count, step1 count, JSON success count, repair list, app write-back count, grammar additions, grammar supplements, UI smoke list, lint result, test result, build result, and unresolved risks
