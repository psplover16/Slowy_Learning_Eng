## ADDED Requirements

### Requirement: Ready video JSON supports structured inline text

Every refreshed ready MissHoney video JSON SHALL store English reading content as structured inline tokens rather than HTML strings, so the UI can render accessible marker controls and precise anchors.

#### Scenario: English segment contains structured tokens

- **WHEN** a refreshed ready video JSON represents the sentence `I eat an apple every day.` with `apple` as a word marker
- **THEN** the segment contains token objects for plain text and the `apple` marker
- **AND** the marker token includes `type`, `text`, `targetId`, and `instanceId`
- **AND** the JSON does not store HTML markup for that marker

##### Example: Word token shape

```json
{
  "englishTokens": [
    { "type": "text", "text": "I eat an " },
    { "type": "word", "text": "apple", "targetId": "word-apple", "instanceId": "marker-a1-ch1-001" },
    { "type": "text", "text": " every day." }
  ],
  "translation": "我每天吃一顆蘋果。"
}
```

### Requirement: Marker targets resolve to learning entries

Every word, phrase, and usage marker token in a refreshed ready video JSON SHALL resolve to exactly one learning entry in the same video JSON.

#### Scenario: Marker target exists

- **WHEN** the validator reads a refreshed ready video JSON
- **THEN** every token with type `word` has a `targetId` that matches one vocabulary item anchor id
- **AND** every token with type `phrase` has a `targetId` that matches one phrase item anchor id
- **AND** every token with type `usage` has a `targetId` that matches one special usage item anchor id

#### Scenario: Marker target is missing

- **WHEN** a token target id does not match any learning entry anchor id
- **THEN** content validation fails
- **AND** the failure output identifies the level, slug, token text, and missing target id

### Requirement: Special usage entries are first-class video content

A refreshed ready MissHoney video JSON SHALL contain special usage entries as first-class content separate from vocabulary, phrases, and grammar.

#### Scenario: Special usage entry contains required fields

- **WHEN** the validator reads a special usage entry
- **THEN** the entry contains an anchor id, source word, familiar meaning, usage explanation, Traditional Chinese translation, and at least one source example
- **AND** the entry is available to the video page as a separate special usage section

### Requirement: Vocabulary entries merge inflected forms by lemma

Refreshed vocabulary content SHALL merge repeated inflected forms under a single lemma entry while preserving the original surface form in each English marker token.

#### Scenario: Inflected forms share a lemma entry

- **GIVEN** a transcript contains `run` and `running` as markers for the same vocabulary lemma
- **WHEN** the proofread result is normalized into video JSON
- **THEN** the vocabulary list contains one lemma entry for `run`
- **AND** the English token for `running` preserves text `running`
- **AND** both marker tokens target the same lemma entry when they represent the same meaning
