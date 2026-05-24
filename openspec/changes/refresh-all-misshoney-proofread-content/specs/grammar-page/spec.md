## ADDED Requirements

### Requirement: MissHoney grammar content is organized before route sync

The grammar page refresh SHALL use _private/tmp/grammar_deal.md as the organized source for MissHoney grammar updates. The organized source MUST be produced from accumulated _private/tmp/grammar.md content and MUST contain Markdown content plus machine-readable JSON.

#### Scenario: Organized grammar file is required

- **WHEN** MissHoney video proofread processing is complete
- **THEN** _private/tmp/grammar.md exists with grammar content accumulated from processed videos
- **AND** _private/tmp/grammar_deal.md exists after grammar_organizer completes
- **AND** grammar_deal.md contains Markdown content and a machine-readable JSON code block

### Requirement: Grammar topics follow simple-to-difficult ordering

MissHoney grammar points imported into /grammar SHALL follow the simple-to-difficult ordering from grammar_deal.md. JSON grammarPoints MUST have continuous increasing sortOrder values, and the grammar page insertion position MUST respect that order within the existing grammar organization.

#### Scenario: Organized grammar sort order is valid

- **WHEN** grammar_deal.md contains grammarPoints in its JSON block
- **THEN** each grammar point has a numeric sortOrder
- **AND** sortOrder values are continuous and increasing
- **AND** the app imports grammar points according to that order

#### Scenario: New grammar topic is inserted in sorted position

- **WHEN** grammar_deal.md contains a grammar topic that does not exist on /grammar
- **THEN** the topic is added to /grammar in a position consistent with its sortOrder and level

### Requirement: Existing grammar topics are supplemented without duplication

When grammar_deal.md contains a grammar point matching an existing /grammar topic, the grammar page SHALL supplement the existing topic with missing explanations, constraints, variants, examples, or source sentences. The page MUST NOT create a duplicate topic for the same grammar concept.

#### Scenario: Existing relative clause topic receives new variant

- **WHEN** /grammar already contains a Relative Clause topic
- **AND** grammar_deal.md contains an additional which relative clause explanation
- **THEN** the existing Relative Clause topic is supplemented with the which explanation
- **AND** no separate duplicate topic is created for which relative clauses

### Requirement: Grammar omissions are explicit

If a grammar point from grammar_deal.md is not synchronized to /grammar, the omission MUST be recorded with the grammar title, source coverage, and reason. Grammar points MUST NOT disappear silently.

#### Scenario: Ambiguous grammar point is recorded as omitted

- **WHEN** a grammar point cannot be matched or inserted because the source content is ambiguous
- **THEN** the final verification report lists the grammar title, source coverage, and omission reason
- **AND** the absence from /grammar is intentional and traceable
