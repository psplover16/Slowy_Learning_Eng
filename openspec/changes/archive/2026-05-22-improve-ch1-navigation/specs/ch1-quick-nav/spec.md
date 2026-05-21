## ADDED Requirements

### Requirement: NavBar SHALL provide an extensible chapter-content dropdown

The top navigation bar SHALL render a "內容" dropdown trigger between the existing "首頁" and "文法" buttons. The trigger SHALL share the same visual style as the existing buttons (same dimensions, font weight, hover, and active-state colors). Clicking the trigger SHALL open a menu listing every chapter from a single source of truth (`src/shared/config/chapters.ts`). Selecting a menu item SHALL navigate to that chapter's route. This design ensures that adding a new chapter (e.g., Ch2, Ch3) only requires appending an entry to the chapters config — NavBar itself does NOT need to change as chapters are added.

#### Scenario: Dropdown trigger renders in NavBar

- **WHEN** the user is on any route and the navigation bar is visible
- **THEN** a button element with `data-testid="nav-content-trigger"` is rendered between `nav-home` and `nav-grammar`
- **AND** its visible text contains "內容"
- **AND** its `aria-haspopup` attribute is `"menu"`

#### Scenario: Menu opens on trigger click and lists every chapter

- **WHEN** the dropdown is initially closed and the user clicks the trigger
- **THEN** an element with `data-testid="nav-content-menu"` becomes visible
- **AND** the menu contains exactly one button element per chapter in `src/shared/config/chapters.ts`
- **AND** each chapter button has `data-testid="nav-content-{chapterId}"`

#### Scenario: Menu remains usable when chapter count grows large (forward-compat for many chapters)

- **WHEN** the chapters config contains many entries (e.g., 50+)
- **THEN** the menu element has CSS `max-height` no greater than 60vh AND `overflow-y: auto`
- **AND** the menu panel SHALL NOT exceed the viewport height — users can scroll within the panel to reach all chapters

NOTE: Beyond a `max-height + scroll` affordance, advanced organization (in-menu search, grouping by level/topic, dedicated chapter index page) is intentionally OUT OF SCOPE for this change. When the chapter count grows to a point where scrolling alone is insufficient, a separate change SHALL introduce search and/or grouping. This change ensures the menu remains technically usable (not broken UX, just dense) at scale; it does NOT promise good UX past ~20 chapters.

##### Example: chapter list mapping

| Chapter id (config) | Menu button data-testid | Visible label includes |
| ------------------- | ----------------------- | ---------------------- |
| `ch1`               | `nav-content-ch1`       | "我的紐約之旅"          |
| (future `ch2`)      | `nav-content-ch2`       | (chapter `titleZh`)    |

#### Scenario: Selecting a chapter navigates and closes the menu

- **WHEN** the menu is open and the user clicks a chapter button (e.g. `nav-content-ch1`)
- **THEN** the router navigates to that chapter's `path` (e.g., `/ch1`)
- **AND** the menu element (`nav-content-menu`) is no longer visible

#### Scenario: Menu closes on outside click

- **WHEN** the menu is open and the user clicks anywhere outside the dropdown container
- **THEN** the menu element is no longer visible

#### Scenario: Menu closes on Escape key

- **WHEN** the menu is open and the user presses the Escape key
- **THEN** the menu element is no longer visible

#### Scenario: Trigger highlights when current route is a chapter route

- **WHEN** the current route path matches any chapter `path` from the chapters config (e.g., `/ch1`)
- **THEN** the dropdown trigger has the active highlight classes (`bg-terracotta`, `text-white`)
- **AND** the "首頁" and "文法" buttons are NOT in their active state

#### Scenario: Trigger does NOT highlight on non-chapter routes

- **WHEN** the current route path is `/` or `/grammar` (not a chapter route)
- **THEN** the dropdown trigger does NOT have the active highlight classes

---

### Requirement: Chapter list SHALL be defined in a single shared config

The project SHALL expose a single chapter registry at `src/shared/config/chapters.ts` as the sole source of truth for chapter metadata. The NavBar dropdown and the HomeView article list SHALL both consume this registry; no other place SHALL hardcode chapter entries. Adding a new chapter SHALL be a one-line append to this config.

#### Scenario: Config exports a chapters array

- **WHEN** the module `src/shared/config/chapters.ts` is imported
- **THEN** it exports a named `chapters` array
- **AND** each entry has at least the fields: `id` (string), `path` (string), `shortLabel` (string), `titleZh` (string), `titleEn` (string)

#### Scenario: Single-source consumption

- **WHEN** `src/shared/components/NavBar.vue` is inspected
- **THEN** it imports `chapters` from `src/shared/config/chapters` and uses it to render dropdown items
- **AND** does NOT hardcode any chapter id, path, or title string

#### Scenario: HomeView uses the same source

- **WHEN** `src/modules/home/views/HomeView.vue` is inspected
- **THEN** it imports `chapters` from `src/shared/config/chapters` and iterates over it to render article items
- **AND** does NOT hardcode any chapter id, path, or title string

##### Example: chapters array shape

```ts
export const chapters = [
  {
    id: 'ch1',
    path: '/ch1',
    shortLabel: 'Ch1',
    titleZh: '我的紐約之旅',
    titleEn: 'My Trip to New York City · Slow English Podcast B1',
  },
  // future entries follow the same shape
]
```

---

### Requirement: Ch1 page SHALL provide an in-page section quick-navigation toolbar

The `/ch1` route SHALL render a horizontal toolbar immediately below the page header, containing four buttons that link to the four main sections of the page. Clicking a button SHALL smooth-scroll the viewport to the corresponding section. The toolbar SHALL NOT be sticky — it scrolls out of view along with the page content.

#### Scenario: Quick-nav toolbar renders below header

- **WHEN** the user visits `/ch1`
- **THEN** an element with `data-testid="ch1-quick-nav"` is rendered between the page header and the first content section
- **AND** the toolbar contains exactly four buttons

#### Scenario: Buttons map to sections

- **WHEN** the user views the quick-nav toolbar
- **THEN** the four buttons have labels "全文", "單字", "片語", "句型" in that order
- **AND** each button targets one section by id

##### Example: button-to-section mapping

| Button label | Target section id              |
| ------------ | ------------------------------ |
| 全文         | `ch1-section-bilingual`        |
| 單字         | `ch1-section-vocabulary`       |
| 片語         | `ch1-section-phrases`          |
| 句型         | `ch1-section-breakdown`        |

#### Scenario: Smooth scroll on button click leaves the section heading visible below the sticky NavBar

- **WHEN** the user clicks any quick-nav button
- **THEN** the browser smooth-scrolls toward the target section
- **AND** the resulting scroll position leaves the section's heading visible (not occluded by the sticky NavBar)
- **AND** the URL hash does NOT change

The NavBar offset SHALL be implemented globally via a CSS `scroll-padding-top` rule on the `html` element (in `src/style.css`), so the same offset applies to every `scrollIntoView` call in the app — including the existing reading-bookmark scene scroll and any future content-page anchored scrolls. The offset SHALL account for both the NavBar height and the iOS safe-area inset.

#### Scenario: Toolbar scrolls with page content (not sticky)

- **WHEN** the user scrolls down past the toolbar
- **THEN** the toolbar is no longer visible in the viewport (it does not stick to any edge)

---

### Requirement: Ch1 page sections SHALL have stable anchor ids

The four main `<section>` elements on `/ch1` SHALL declare stable id attributes so the quick-nav toolbar can target them. Section ids SHALL use the prefix `ch1-section-` to avoid collisions with future chapter routes.

#### Scenario: Section ids present in DOM

- **WHEN** the `/ch1` page is rendered
- **THEN** elements with ids `ch1-section-bilingual`, `ch1-section-vocabulary`, `ch1-section-phrases`, `ch1-section-breakdown` exist in the DOM
- **AND** each id appears exactly once

#### Scenario: Section ids correspond to section content

- **WHEN** an element with id `ch1-section-bilingual` exists
- **THEN** it is the section containing the bilingual full text content
- **AND** the same correspondence holds for vocabulary, phrases, and breakdown sections

---

### Requirement: Back-to-top FAB SHALL appear when the quick-nav toolbar is out of view

A floating action button (FAB) SHALL appear in the bottom-right of the viewport when the quick-nav toolbar is no longer visible in the viewport, and SHALL disappear when the toolbar returns to view. Clicking the FAB SHALL smooth-scroll the page back to the top. Visibility detection SHALL use the `IntersectionObserver` API observing the toolbar element.

#### Scenario: FAB hidden when toolbar visible

- **WHEN** the user is on `/ch1` and the quick-nav toolbar is at least partially in the viewport
- **THEN** no element with `data-testid="back-to-top-fab"` is visible to the user

#### Scenario: FAB shown when toolbar out of view

- **WHEN** the user scrolls down past the quick-nav toolbar so it is fully out of the viewport
- **THEN** an element with `data-testid="back-to-top-fab"` becomes visible
- **AND** the FAB is positioned in the bottom-right of the viewport

#### Scenario: FAB returns to hidden when toolbar scrolls back into view

- **WHEN** the user scrolls back up so the quick-nav toolbar re-enters the viewport
- **THEN** the FAB transitions out and is no longer visible

#### Scenario: Click FAB scrolls page to top

- **WHEN** the user clicks the back-to-top FAB
- **THEN** the page smooth-scrolls so the viewport's top edge is at the page top (`window.scrollY === 0`)

---

### Requirement: Back-to-top FAB SHALL coexist with the existing back-to-word FAB without overlap

When both the back-to-top FAB and the existing back-to-word FAB are visible at the same time, they SHALL be stacked vertically in the bottom-right corner without overlapping. The back-to-word FAB SHALL retain its current position; the back-to-top FAB SHALL offset itself upward by a fixed amount so it sits above the back-to-word FAB.

#### Scenario: Only back-to-top visible

- **WHEN** the back-to-top FAB is visible AND the back-to-word FAB is NOT visible
- **THEN** the back-to-top FAB is positioned at the default bottom-right anchor (`bottom: 1.5rem`)

#### Scenario: Both FABs visible

- **WHEN** both the back-to-top FAB and the back-to-word FAB are visible
- **THEN** the back-to-word FAB remains at `bottom: 1.5rem` (unchanged from current behavior)
- **AND** the back-to-top FAB is positioned higher by 60px (`bottom: calc(1.5rem + 60px)`)
- **AND** neither FAB visually overlaps the other

#### Scenario: Only back-to-word visible (existing behavior preserved)

- **WHEN** the back-to-word FAB is visible AND the back-to-top FAB is NOT visible
- **THEN** the back-to-word FAB renders at `bottom: 1.5rem` with no change from its pre-change behavior
