## REMOVED Requirements

### Requirement: Ch2 has no full-text article

**Reason**: Decision reversed — Ch2 requires bilingual full-text to provide vocabulary context for learners.
**Migration**: Replace `scenes: []` with 10 bilingual scene objects in `src/modules/chapters/data/ch2.ts`.

#### Scenario: Full-text section no longer absent after migration

- **WHEN** the migration is complete and the user visits `/ch2`
- **THEN** the `#ch2-section-bilingual` section IS present in the DOM (the "absent" behavior is removed)

## MODIFIED Requirements

### Requirement: Ch2 chapter page is accessible at /ch2

The system SHALL register Ch2 in the chapter registry so Vue Router auto-generates a route at `/ch2` that renders `ChapterView` with `id="ch2"`.

#### Scenario: User navigates to Ch2

- **WHEN** the user navigates to `/ch2`
- **THEN** `ChapterView` renders with the Ch2 data and displays the title "How Languages Are Really Learned"

#### Scenario: Ch2 route appears in chapter registry

- **WHEN** the app initialises
- **THEN** the chapter registry contains an entry with `id: 'ch2'` and `path: '/ch2'`

## ADDED Requirements

### Requirement: Ch2 has a full-text bilingual article with 10 scenes

Ch2 SHALL have a `scenes` array containing exactly 10 bilingual scene objects. Each scene SHALL have an `id` (scene-01 through scene-10), a bilingual title (`titleZh`, `titleEn`), an array of `sentences` each with `en` and `tc` fields, and a `tags` array. Key vocabulary terms in English sentences SHALL use `hl()` to create underlined links to their corresponding vocab/phrases card ids.

#### Scenario: Full-text section is rendered

- **WHEN** the user visits `/ch2`
- **THEN** the `#ch2-section-bilingual` section is visible
- **THEN** the section heading contains "中英對照全文"
- **THEN** 10 scene blocks with `data-testid` matching `scene-01` through `scene-10` are present

#### Scenario: Quick-nav shows 4 buttons including 全文

- **WHEN** the user visits `/ch2`
- **THEN** the quick-nav bar shows exactly 4 buttons in order: 全文, 單字, 片語, 句型

#### Scenario: Scenes contain bilingual sentences with vocab links

- **WHEN** the user views the full-text section on `/ch2`
- **THEN** each scene block shows at least one English sentence paired with a Chinese translation
- **THEN** at least one underlined `data-target` span links to a vocab or phrases card id (e.g., `vocab-fills-the-gaps`, `vocab-go-silent`)
