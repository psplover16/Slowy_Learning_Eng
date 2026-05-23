## ADDED Requirements

### Requirement: Playlist videos are grouped by completion state

MissHoney level playlist routes SHALL render incomplete videos before completed videos. This grouping SHALL apply to `/a1`, `/a2`, `/b1`, and `/b2`. The grouping SHALL use the existing local completion state for each video and SHALL NOT change the stored completion data shape.

#### Scenario: Incomplete videos appear before completed videos

- **WHEN** a user opens a MissHoney level playlist route with both incomplete and completed videos
- **THEN** every incomplete video appears before every completed video in the rendered list

##### Example: Mixed completion state

- **GIVEN** the playlist order is `ch1`, `ch2`, `ch3`, `ch4`
- **GIVEN** `ch2` and `ch4` are completed, while `ch1` and `ch3` are incomplete
- **WHEN** the playlist list renders
- **THEN** the rendered order is `ch1`, `ch3`, `ch2`, `ch4`

#### Scenario: Group ordering preserves display order inside each group

- **WHEN** the playlist list contains multiple incomplete videos and multiple completed videos
- **THEN** incomplete videos keep their original display order relative to other incomplete videos
- **THEN** completed videos keep their original display order relative to other completed videos

##### Example: Original order remains stable inside groups

- **GIVEN** the playlist order is `ch1`, `ch2`, `ch3`, `ch4`, `ch5`
- **GIVEN** `ch1`, `ch3`, and `ch5` are completed, while `ch2` and `ch4` are incomplete
- **WHEN** the playlist list renders
- **THEN** the rendered order is `ch2`, `ch4`, `ch1`, `ch3`, `ch5`

#### Scenario: Toggling completion updates grouping without changing card UI

- **WHEN** a user toggles a playlist video from incomplete to completed
- **THEN** that video moves after all incomplete videos
- **THEN** the existing playlist card component, checkbox control, title, subtitle, and route link remain available

#### Scenario: Toggling back to incomplete returns video to the incomplete group

- **WHEN** a user toggles a completed playlist video back to incomplete
- **THEN** that video moves before all completed videos
- **THEN** its position among incomplete videos follows the playlist display order
