## ADDED Requirements

### Requirement: MissHoney grammar supplements are conservative

The grammar page SHALL accept MissHoney proofread grammar supplements only when the grammar topic clearly matches an existing grammar card. Unmatched or uncertain grammar points SHALL remain inside the source video page's grammar section.

#### Scenario: Clear grammar match supplements existing card

- **WHEN** A1 ch1 proofread output contains a grammar point that clearly matches an existing grammar card topic
- **THEN** the grammar page keeps the existing card
- **AND** the matched card receives a supplemental example or explanation from the MissHoney source
- **AND** no duplicate grammar card is created for the same topic

##### Example: Relative clause supplement

- **GIVEN** the grammar page already has a `Relative Clause` card
- **WHEN** MissHoney proofread output contains a `which` relative clause example
- **THEN** the `Relative Clause` card can include the `which` example as a supplement
- **AND** the grammar page does not create another `Relative Clause` card

#### Scenario: Uncertain grammar classification stays video-local

- **WHEN** A1 ch1 proofread output contains a grammar point that does not clearly match an existing grammar card topic
- **THEN** the grammar point remains in the A1 ch1 video grammar section
- **AND** the grammar page does not receive a new card or group for that uncertain point

### Requirement: MissHoney supplements preserve grammar page organization

MissHoney grammar supplements SHALL NOT change the existing grammar group order, card order, or badge numbering during the A1 ch1 vertical slice.

#### Scenario: Grammar page order remains stable after supplement

- **WHEN** a MissHoney supplement is added to an existing grammar card
- **THEN** the grammar page still renders the same thematic group order
- **AND** the existing card order remains unchanged
- **AND** existing badge identifiers remain consecutive and unchanged
