## ADDED Requirements

### Requirement: Transcript-backed chapter routes SHALL preserve source repetition while correcting only mechanical subtitle errors

Any chapter route added from subtitle or transcript source text SHALL use the same correction rule as the corrected ch2/ch3 content. The chapter data module SHALL preserve repeated wording, repeated questions, repeated teaching rhythm, and repeated paragraphs from the source transcript. Correction SHALL be limited to grammar, spelling, broken words, capitalization, obvious ASR errors, and punctuation or sentence-boundary fixes. The chapter data SHALL NOT summarize, deduplicate, merge, or delete repeated transcript content solely because it repeats. Reviews and tests SHALL normalize source subtitles by removing line breaks and collapsing consecutive whitespace before checking whether representative transcript signals were omitted. For subtitle-backed chapter content, reviews and tests SHALL also check every source transcript sentence with at least four words against normalized chapter article text after applying explicit subtitle correction mappings. The mappings SHALL be narrow and limited to mechanical subtitle artifacts, grammar fixes, spelling fixes, capitalization fixes, and punctuation or sentence-boundary fixes.

#### Scenario: Future route keeps repeated transcript content after correction

- **WHEN** a future chapter data module is created from subtitle or transcript source text
- **THEN** repeated source wording, repeated questions, teaching rhythm, and repeated paragraphs remain represented in the chapter `scenes`
- **AND** corrections only alter grammar, spelling, broken words, capitalization, obvious ASR errors, and punctuation or sentence boundaries

#### Scenario: Future route review rejects deduplicated transcript content

- **WHEN** a future chapter route review finds that repeated transcript content was merged, summarized, or deleted only because it repeats
- **THEN** the route content MUST be treated as incomplete
- **AND** the missing repeated content MUST be restored before the chapter route is accepted

##### Example: repeated opening questions

- **GIVEN** a source transcript contains one `They ask` grammar question and one `They ask` word-memorization question
- **WHEN** a future chapter route keeps only the grammar question and deletes the word-memorization question because both sentences start with `They ask`
- **THEN** the route content is incomplete and the deleted word-memorization question MUST be restored

#### Scenario: Future route review normalizes source line breaks

- **WHEN** a future chapter route is reviewed against subtitle or transcript source text
- **THEN** the source text SHALL have line breaks removed and consecutive whitespace collapsed before representative transcript signals are checked
- **AND** a signal split across subtitle lines SHALL still be treated as one continuous source signal

##### Example: split driving sentence

- **GIVEN** source subtitle lines contain `You think about every` followed by `action, but after repetition`
- **WHEN** the review normalizes source line breaks
- **THEN** the continuous signal `You think about every action, but after repetition` MUST be checked against the chapter article text

#### Scenario: Future route review checks every source sentence

- **WHEN** a future chapter route is reviewed against subtitle or transcript source text
- **THEN** every source transcript sentence with at least four words SHALL be checked against the normalized chapter article text after explicit subtitle correction mappings are applied
- **AND** any unmatched sentence SHALL make the route content incomplete until the sentence is restored or covered by a narrow correction mapping

##### Example: missing confidence sentence

- **GIVEN** normalized source contains a confidence-stage sentence saying the brain is still working
- **WHEN** the chapter article omits that signal
- **THEN** the route content is incomplete until the signal is restored
