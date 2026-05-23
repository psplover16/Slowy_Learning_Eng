# ch4-content Specification

## Purpose

Defines the /ch4 chapter page, which hosts "Why Traditional Study Can't Create Fluency" moved from the former /ch3 route.

## ADDED Requirements

### Requirement: Ch4 chapter page is accessible at /ch4

The application SHALL render a chapter page at the /ch4 route. The chapter data SHALL be identical to the content previously at /ch3 (傳統學習法為何無法帶來流暢), with all scenes, tags, and vocabGroups preserved unchanged.

#### Scenario: User navigates to Ch4

- **WHEN** the user navigates to `/ch4`
- **THEN** ChapterView renders with ch4 data loaded
- **THEN** the page header title reads "Why Traditional Study Can't Create Fluency" / "傳統學習法為何無法帶來流暢"
- **THEN** all original scenes and vocabulary are visible

### Requirement: Ch4 appears in chapter navigation after Ch3

The chapters array in `src/shared/config/chapters.ts` SHALL include a ch4 entry with id='ch4', path='/ch4', shortLabel='Ch4', positioned after the ch3 entry.

#### Scenario: Ch4 appears as fourth item in navigation

- **WHEN** the app initialises
- **THEN** the chapter registry contains entries in order: ch1, ch2, ch3, ch4
- **THEN** ch4 entry has path '/ch4' and dataLoader pointing to ch4 data file
