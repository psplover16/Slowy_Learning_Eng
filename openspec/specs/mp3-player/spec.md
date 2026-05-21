# mp3-player Specification

## Purpose

TBD - created by archiving change 'build-slowy-learning-eng-pwa'. Update Purpose after archive.

## Requirements

### Requirement: Sticky MP3 player appears at the top of content pages that have an audio source

A content page component SHALL accept a `mp3Src` prop (`string | null`). When `mp3Src` is a non-empty string, the MP3 player component SHALL render at the top of the page with `position: sticky; top: <navbar-height>`. When `mp3Src` is null or empty string, the player component SHALL NOT render at all.

#### Scenario: No audio source — player hidden

- **WHEN** Ch1View renders with `mp3Src = null`
- **THEN** no MP3 player UI is visible on the page

#### Scenario: Audio source present — player visible

- **WHEN** a future content page renders with `mp3Src = "/audio/ch2.mp3"`
- **THEN** the MP3 player is visible at the top of the content, below the navigation bar


<!-- @trace
source: build-slowy-learning-eng-pwa
updated: 2026-05-22
code:
  - _private/done/claudeCli.md
  - src/modules/chapters/types.ts
  - _private/done/筆記.html
  - src/modules/chapters/data/ch1.ts
  - _private/done/spectraYaml.md
  - src/modules/chapters/data/ch2.ts
  - _private/done/claude-intro.html
  - src/modules/chapters/data/ch3.ts
  - _private/ch2-data-draft.ts
  - src/shared/components/SectionQuickNav.vue
  - src/shared/config/chapters.ts
  - _private/ch1-new york travel.html
  - _private/index.html
  - _private/discuss.txt
  - _private/propose.md
  - src/modules/chapters/ChapterView.vue
tests:
  - src/__tests__/SectionQuickNav.test.ts
  - tests/e2e/ch3.smoke.spec.ts
  - src/__tests__/ChapterView.test.ts
  - src/__tests__/ChapterViewDynamic.test.ts
  - tests/e2e/app-shell.smoke.spec.ts
  - tests/e2e/ch2.smoke.spec.ts
-->

---
### Requirement: MP3 player provides playback controls

When visible, the player SHALL include:

- Play / Pause toggle button (icon changes between ▶ and ⏸)
- Skip forward 5 seconds button
- Skip forward 10 seconds button
- Volume slider (range 0–1)
- Seekable timeline (range input showing current position / total duration)
- Current time and total duration display (MM:SS format)
- Loop toggle button (default: ON — audio repeats when it ends)

#### Scenario: Loop is ON by default

- **WHEN** the MP3 player first renders
- **THEN** the loop toggle is in the active (ON) state and the underlying `<audio>` element has `loop` attribute set

#### Scenario: Seeking with timeline slider

- **WHEN** the user drags the timeline slider to a new position
- **THEN** `audio.currentTime` is updated to the selected value and playback continues from that position

#### Scenario: Volume slider

- **WHEN** the user adjusts the volume slider
- **THEN** `audio.volume` reflects the slider value (0.0 to 1.0)


<!-- @trace
source: build-slowy-learning-eng-pwa
updated: 2026-05-22
code:
  - _private/done/claudeCli.md
  - src/modules/chapters/types.ts
  - _private/done/筆記.html
  - src/modules/chapters/data/ch1.ts
  - _private/done/spectraYaml.md
  - src/modules/chapters/data/ch2.ts
  - _private/done/claude-intro.html
  - src/modules/chapters/data/ch3.ts
  - _private/ch2-data-draft.ts
  - src/shared/components/SectionQuickNav.vue
  - src/shared/config/chapters.ts
  - _private/ch1-new york travel.html
  - _private/index.html
  - _private/discuss.txt
  - _private/propose.md
  - src/modules/chapters/ChapterView.vue
tests:
  - src/__tests__/SectionQuickNav.test.ts
  - tests/e2e/ch3.smoke.spec.ts
  - src/__tests__/ChapterView.test.ts
  - src/__tests__/ChapterViewDynamic.test.ts
  - tests/e2e/app-shell.smoke.spec.ts
  - tests/e2e/ch2.smoke.spec.ts
-->

---
### Requirement: MP3 player is offline-capable

The audio file referenced by `mp3Src` SHALL be cached by the Service Worker using a Network First strategy, so that it can be played offline after the first load.

#### Scenario: Offline audio playback after prior streaming

- **GIVEN** the user has streamed an MP3 via `mp3Src` at least once with network access
- **WHEN** the user disables network access and reopens the same content page
- **THEN** the MP3 player still loads and plays the audio from the Service Worker cache

<!-- @trace
source: build-slowy-learning-eng-pwa
updated: 2026-05-22
code:
  - _private/done/claudeCli.md
  - src/modules/chapters/types.ts
  - _private/done/筆記.html
  - src/modules/chapters/data/ch1.ts
  - _private/done/spectraYaml.md
  - src/modules/chapters/data/ch2.ts
  - _private/done/claude-intro.html
  - src/modules/chapters/data/ch3.ts
  - _private/ch2-data-draft.ts
  - src/shared/components/SectionQuickNav.vue
  - src/shared/config/chapters.ts
  - _private/ch1-new york travel.html
  - _private/index.html
  - _private/discuss.txt
  - _private/propose.md
  - src/modules/chapters/ChapterView.vue
tests:
  - src/__tests__/SectionQuickNav.test.ts
  - tests/e2e/ch3.smoke.spec.ts
  - src/__tests__/ChapterView.test.ts
  - src/__tests__/ChapterViewDynamic.test.ts
  - tests/e2e/app-shell.smoke.spec.ts
  - tests/e2e/ch2.smoke.spec.ts
-->