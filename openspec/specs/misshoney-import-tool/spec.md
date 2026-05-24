# misshoney-import-tool Specification

## Purpose

TBD - created by archiving change 'add-misshoney-playlists'. Update Purpose after archive.

## Requirements

### Requirement: Import tool fetches playlists and captions automatically

The project SHALL provide a script-driven MissHoney import workflow. The user SHALL NOT be required to manually copy playlist URLs beyond the configured sources file, manually collect video IDs, or manually copy subtitles.

#### Scenario: source playlists are configured once

- **GIVEN** `scripts/misshoney/sources.json` exists
- **THEN** it contains exactly four entries in this order: A1, A2, B1, B2
- **THEN** each entry contains `level`, `title`, and `playlistUrl`

#### Scenario: import command does not require manual subtitle fetching

- **WHEN** the user runs `npm run misshoney:import`
- **THEN** the importer reads the configured playlist URLs
- **THEN** the importer attempts to fetch public playlist metadata and English captions or auto-captions automatically
- **THEN** the command output does not ask the user to manually paste subtitles

#### Scenario: import command covers every configured level

- **WHEN** the user runs `npm run misshoney:import`
- **THEN** the importer processes A1, A2, B1, and B2 in the configured order
- **THEN** the command reports per-level counts for imported transcripts and skipped videos


<!-- @trace
source: add-misshoney-playlists
updated: 2026-05-23
code:
  - src/modules/playlists/data/videos/a2/ch29-what-you-taught-me-about-hope-slow-english-listening.json
  - src/modules/playlists/data/videos/a2/ch5-84-english-phrases-for-beginners-speak-like-a-native.json
  - src/modules/playlists/data/videos/b1/ch10-learn-english-with-slow-interviews-comprehensible-input-b1-interview-practice.json
  - src/modules/playlists/data/videos/b1/ch14-real-english-conversation-life-in-the-usa-vs-life-in-mexico-b1.json
  - src/modules/playlists/data/videos/b1/ch17-slow-english-practice-airport-essentials-for-traveling.json
  - src/modules/playlists/data/videos/b1/ch2-slow-english-practice-for-b1-intermediate-talking-about-airports.json
  - src/modules/playlists/data/videos/a2/ch15-daily-english-affirmations-for-speaking-confidence-fluency-i-am-a-fluent-english-speaker.json
  - src/modules/playlists/data/videos/a2/ch27-pronunciation-practice-50-english-words-to-sound-natural.json
  - src/modules/playlists/data/videos/b2/ch5-interview-about-childhood-memories-faster-english-podcast-for-intermediate-listening-practice.json
  - src/modules/playlists/data/videos/a2/ch1-slow-english-stories-level-a2-listening-a-weird-phone-call.json
  - src/modules/playlists/data/videos/a1/ch12-a-day-in-my-life-slow-english-podcast-a1-present-simple.json
  - package.json
  - src/modules/chapters/utils/highlight.ts
  - src/modules/playlists/data/b2.ts
  - src/modules/playlists/data/videos/a2/ch13-my-weird-trip-in-puerto-escondido-storytime-slow-english-for-intermediate-listeners.json
  - src/modules/playlists/data/videos/a2/ch20-intermediate-slow-english-podcast-my-trip-to-the-elephant-sanctuarycomprehensible-input.json
  - src/modules/playlists/data/a2.ts
  - src/modules/playlists/data/videos/b1/ch21-slow-english-listening-practice-makeup-routine.json
  - src/modules/playlists/data/videos/a1/ch6-slow-english-podcast-for-beginners-talking-about-friends.json
  - _private/misshoney/README.md
  - src/modules/playlists/data/videos/a1/ch7-slow-english-podcast-for-beginners-talking-about-goals.json
  - src/modules/playlists/data/videos/a2/ch10-powerful-daily-affirmations-learn-english-and-practice-gratitude-comprehensible-input.json
  - src/modules/playlists/data/videos/a2/ch16-slow-english-podcast-my-day-a2-listening-practice.json
  - src/app/router/index.ts
  - src/modules/playlists/data/videos/a2/ch3-slow-english-podcast-bus-stories-for-beginners.json
  - src/modules/playlists/data/videos/b1/ch7-interview-about-childhood-memories-faster-english-podcast-for-intermediate-listening-practice.json
  - src/modules/playlists/data/videos/b1/ch8-learn-slow-english-asmr-intermediate-b1-talking-about-sounds-and-noises-comprehensible-input.json
  - src/modules/playlists/data/videos/b2/ch1-slow-english-listening-for-upper-intermediate-talking-about-comfort-foods.json
  - src/modules/playlists/data/videos/a2/ch25-learn-english-travel-vlog-for-beginners.json
  - src/modules/playlists/data/videos/a2/ch12-grocery-store-essentials-for-a1-a2-beginners.json
  - src/modules/playlists/data/videos/b2/ch13-travel-with-english-slow-english-podcast.json
  - src/modules/playlists/data/videos/a2/ch4-slow-english-podcast-for-a2-b1-intemediate-levels-planning-my-first-trip.json
  - src/modules/chapters/data/ch4.ts
  - src/modules/playlists/data/videos/b1/ch3-slow-english-podcast-bus-stories-for-beginners.json
  - src/modules/playlists/data/videos/a1/ch14-how-to-introduce-yourself-in-english-for-beginners.json
  - src/modules/playlists/data/videos/a2/ch11-the-scariest-beach-day-slow-english-podcast-for-a1-a2-beginners-comprehensible-input.json
  - src/modules/playlists/data/videos/a1/ch10-learn-english-with-slow-interviews-comprehensible-input-a1-sleep-routines.json
  - PROJECT_ARCHITECTURE.md
  - src/modules/playlists/data/videos/a1/ch11-slow-english-reading-rainbow-fish-for-beginners-a1a2.json
  - src/modules/playlists/data/b1.ts
  - src/modules/playlists/data/videos/a1/ch2-beginner-english-slow-listening-practice-talking-about-me.json
  - src/modules/playlists/data/videos/a1/ch9-a1-beginner-slow-english-podcast-sleep-rest-vocabulary.json
  - src/modules/playlists/data/videos/b1/ch19-how-to-speak-english-real-life-role-play-b1b2.json
  - src/modules/playlists/components/PlaylistReadingHeader.vue
  - src/modules/playlists/data/videos/b1/ch15-english-sleep-learning-shadowing-positive-affirmations.json
  - _private/propose.md
  - src/modules/playlists/data/videos/a1/ch15-absolute-beginner-slow-english-what-is-my-favorite-holiday.json
  - src/modules/playlists/data/videos/a2/ch19-english-sleep-learning-shadowing-positive-affirmations.json
  - src/modules/playlists/types.ts
  - src/modules/playlists/data/videos/a1/ch16-beginner-english-speaking-practice-real-life-role-play-a1.json
  - scripts/misshoney/author-polished-content.mjs
  - src/modules/playlists/data/videos/a2/ch18-slow-english-podcast-a-day-in-my-life-a2-english-listening-practice.json
  - src/modules/playlists/data/videos/a2/ch24-sleep-and-learn-english-shadow-positive-affirmations.json
  - src/modules/playlists/data/videos/a2/ch8-a1-beginner-slow-english-podcast-sleep-rest-vocabulary.json
  - src/modules/playlists/components/PlaylistWordTag.vue
  - scripts/misshoney/content-core.d.mts
  - src/modules/playlists/data/videos/b1/ch20-100-essential-english-words-for-daily-life-slow-english-vocabulary.json
  - src/modules/playlists/data/videos/b2/ch15-learn-english-by-making-mistakes-slow-english-podcast.json
  - src/modules/playlists/data/videos/a1/ch3-slow-english-listening-for-beginners-talking-about-languages.json
  - src/modules/playlists/data/videos/b2/ch9-intermediate-slow-english-podcast-my-trip-to-the-elephant-sanctuarycomprehensible-input.json
  - scripts/publishPages.mjs
  - src/modules/playlists/data/videos/a1/ch4-practice-slow-english-for-a1-beginners-talk-about-family.json
  - src/modules/playlists/data/videos/a1/ch13-slow-english-podcast-the-giving-tree-for-beginners-a1a2.json
  - src/modules/playlists/data/videos/a2/ch23-how-to-actually-learn-english-10-tips-that-really-work.json
  - src/modules/home/components/ArticleListItem.vue
  - src/modules/playlists/data/videos/a2/ch6-essential-airport-vocabulary-slow-english-podcast-for-a2-beginners.json
  - src/modules/playlists/data/videos/b2/ch6-slow-english-podcast-my-bus-stories.json
  - src/modules/playlists/data/videos/b2/ch7-learn-english-with-slow-interviews-comprehensible-input-b1-interview-practice.json
  - src/shared/components/NavBar.vue
  - src/modules/playlists/data/videos/b1/ch18-english-kitchen-vocabulary-comprehensible-input.json
  - src/modules/playlists/data/videos/b1/ch12-slow-english-podcast-my-trip-to-new-york-city-level-b1.json
  - src/modules/playlists/data/videos/b1/ch6-my-trip-to-brazil-slow-english-podcast-for-high-beginners-a2-b1-comprehensible-input.json
  - src/modules/playlists/data/videos/b2/ch2-slow-english-for-intermediate-b2-with-subtitles-in-spanish-talking-about-languages.json
  - src/modules/playlists/data/videos/b2/ch16-learn-english-with-my-morning-routine-natural-speaking-practice.json
  - _private/筆記.md
  - src/modules/playlists/data/videos/a2/ch14-learn-english-with-slow-conversations-comprehensible-input-a1-weekend-routines.json
  - src/modules/playlists/components/PlaylistPhraseCard.vue
  - src/modules/home/views/HomeView.vue
  - src/modules/playlists/data/videos/b2/ch10-real-english-to-speak-when-you-travel-advanced-slow-english-podcast.json
  - src/modules/playlists/components/PlaylistSentenceBreakdown.vue
  - src/modules/playlists/data/videos/b1/ch16-slow-english-podcast-my-trip-to-mexico-city.json
  - src/modules/playlists/data/videos/b2/ch8-slow-english-podcast-why-am-i-learning-chinese-b2.json
  - src/modules/playlists/data/videos/b2/ch11-slow-english-podcast-my-stressful-trip-to-chinacomprehensible-input.json
  - src/modules/playlists/data/videos/a2/ch22-learn-english-at-home-slow-english.json
  - scripts/misshoney/promote-content.mjs
  - src/modules/playlists/PlaylistView.vue
  - src/modules/playlists/data/videos/b1/ch4-slow-english-podcast-for-a2-b1-intemediate-levels-planning-my-first-trip.json
  - src/modules/chapters/data/ch3.ts
  - src/modules/playlists/data/videos/a1/ch1-slow-english-for-beginners-a1-listening-practice.json
  - scripts/misshoney/scaffold-content.mjs
  - src/modules/playlists/data/videos/a1/ch18-english-listening-practice-for-beginners-my-weekend-a1-a2.json
  - src/modules/playlists/data/videos/b1/ch9-speak-like-a-native-common-english-idioms-slow-english-podcast-for-a2-b1-beginners.json
  - src/modules/playlists/data/videos/a2/ch2-slow-english-for-a2-high-beginners-how-colors-make-me-feel.json
  - src/modules/playlists/data/videos/a2/ch26-100-essential-english-words-for-daily-life-slow-english-vocabulary.json
  - src/modules/playlists/data/videos/b2/ch12-slow-english-podcast-advanced-listening-practice-natural-conversation-comprehensible-input.json
  - scripts/misshoney/content-core.mjs
  - src/modules/playlists/data/videos/b2/ch17-how-she-became-fluent-in-english-intermediate-listening-practice.json
  - src/modules/playlists/PlaylistVideoView.vue
  - scripts/misshoney/import-core.d.mts
  - src/modules/playlists/data/videos/a2/ch7-speak-like-a-native-common-abbreviations-slow-english-podcast-for-a2-beginners.json
  - src/modules/playlists/data/videos/a1/ch5-practice-slow-english-podcast-talking-about-weather.json
  - src/modules/playlists/data/videos/a1/ch8-slow-english-podcast-chat-with-me-about-foods.json
  - src/modules/playlists/data/videos/b2/ch3-slow-english-for-intermediate-b2-with-subtitles-in-portuguese-talking-about-languages.json
  - src/shared/config/playlists.ts
  - src/modules/playlists/data/videos/a2/ch28-learn-in-on-at-naturally-english-listening-practice.json
  - src/modules/playlists/data/videos/b1/ch1-slow-english-listening-intermediate-practice-talking-about-my-hobbies.json
  - src/modules/playlists/data/videos/a2/ch9-learn-english-with-slow-interviews-comprehensible-input-a1-sleep-routines.json
  - src/modules/playlists/data/videos/b1/ch11-slow-english-podcast-for-high-beginners-a2-b1-my-trip-to-the-usa-comprehensible-input.json
  - src/modules/playlists/data/videos/b2/ch14-learn-english-in-nyc-slow-english-vlog.json
  - _private/discuss.txt
  - src/modules/playlists/components/PlaylistSceneBlock.vue
  - src/modules/playlists/data/videos/a2/ch17-asmr-learn-english-while-sleeping-with-relaxing-sounds-slow-english-podcast.json
  - src/modules/playlists/data/videos/b1/ch5-job-interview-essentials-slow-english-podcast-for-intermediate-b1.json
  - src/modules/playlists/data/videos/b2/ch4-slow-english-for-c1-advanced-dreams.json
  - scripts/misshoney/import-playlists.mjs
  - src/shared/config/storageKeys.ts
  - src/modules/playlists/data/videos/a1/ch17-slow-english-conversations-a1-comprehensible-input.json
  - src/modules/grammar/views/GrammarView.vue
  - src/modules/home/composables/useMissHoneyCompletion.ts
  - src/modules/playlists/data/videos/a2/ch21-slow-english-reading-learn-english-with-childrens-books-comprehensible-input.json
  - src/modules/playlists/data/videos/b1/ch13-slow-english-podcast-my-trip-to-puerto-escondido-level-a2.json
  - src/shared/config/chapters.ts
  - scripts/misshoney/import-core.mjs
  - scripts/misshoney/validate-content.mjs
  - scripts/misshoney/sources.json
  - src/modules/playlists/data/a1.ts
  - src/modules/playlists/composables/usePlaylistReadingSections.ts
tests:
  - src/__tests__/NavBar.test.ts
  - tests/e2e/misshoney-polished.smoke.spec.ts
  - src/__tests__/HomeView.test.ts
  - src/__tests__/importerCore.test.ts
  - src/__tests__/ChapterView.test.ts
  - src/__tests__/ArticleListItemCompletion.test.ts
  - src/__tests__/PlaylistView.test.ts
  - src/__tests__/publishPages.test.ts
  - src/__tests__/PlaylistVideoView.test.ts
  - src/__tests__/chapterDataModule.test.ts
  - tests/e2e/ch3.smoke.spec.ts
  - tests/e2e/app-shell.smoke.spec.ts
  - src/__tests__/contentCore.test.ts
  - src/__tests__/useMissHoneyCompletion.test.ts
  - src/__tests__/GrammarView.test.ts
  - src/__tests__/HomeViewMissHoney.test.ts
-->

---
### Requirement: Import output is generated under `_private/misshoney`

Raw imported data SHALL be written under `_private/misshoney` only. The importer SHALL NOT write or overwrite curated app content under `src/modules/playlists/data/videos/**`.

#### Scenario: generated files are separated from curated app data

- **WHEN** the importer succeeds for level `a1`
- **THEN** it writes playlist inventory to `_private/misshoney/inventory/a1.json`
- **THEN** it writes transcript files to `_private/misshoney/transcripts/a1/<slug>.json`
- **THEN** it writes skipped report entries to `_private/misshoney/skipped/a1.json`
- **THEN** it writes per-level counts to `_private/misshoney/import-summary.json`
- **THEN** no file under `src/modules/playlists/data/videos/` is created, changed, or deleted by the importer

#### Scenario: existing raw outputs can be checked without fetching YouTube

- **WHEN** the user runs `npm run misshoney:import -- --check-existing`
- **THEN** the importer reads existing files under `_private/misshoney/inventory`, `_private/misshoney/transcripts`, and `_private/misshoney/skipped`
- **THEN** the command exits with code 0 only when every non-skipped inventory item has one matching transcript file
- **THEN** the command does not call YouTube

#### Scenario: importer can be re-run without overwriting curated content

- **GIVEN** `src/modules/playlists/data/videos/a1/ch1-what-is-your-name.json` exists
- **WHEN** the user re-runs `npm run misshoney:import`
- **THEN** that curated JSON file remains unchanged


<!-- @trace
source: add-misshoney-playlists
updated: 2026-05-23
code:
  - src/modules/playlists/data/videos/a2/ch29-what-you-taught-me-about-hope-slow-english-listening.json
  - src/modules/playlists/data/videos/a2/ch5-84-english-phrases-for-beginners-speak-like-a-native.json
  - src/modules/playlists/data/videos/b1/ch10-learn-english-with-slow-interviews-comprehensible-input-b1-interview-practice.json
  - src/modules/playlists/data/videos/b1/ch14-real-english-conversation-life-in-the-usa-vs-life-in-mexico-b1.json
  - src/modules/playlists/data/videos/b1/ch17-slow-english-practice-airport-essentials-for-traveling.json
  - src/modules/playlists/data/videos/b1/ch2-slow-english-practice-for-b1-intermediate-talking-about-airports.json
  - src/modules/playlists/data/videos/a2/ch15-daily-english-affirmations-for-speaking-confidence-fluency-i-am-a-fluent-english-speaker.json
  - src/modules/playlists/data/videos/a2/ch27-pronunciation-practice-50-english-words-to-sound-natural.json
  - src/modules/playlists/data/videos/b2/ch5-interview-about-childhood-memories-faster-english-podcast-for-intermediate-listening-practice.json
  - src/modules/playlists/data/videos/a2/ch1-slow-english-stories-level-a2-listening-a-weird-phone-call.json
  - src/modules/playlists/data/videos/a1/ch12-a-day-in-my-life-slow-english-podcast-a1-present-simple.json
  - package.json
  - src/modules/chapters/utils/highlight.ts
  - src/modules/playlists/data/b2.ts
  - src/modules/playlists/data/videos/a2/ch13-my-weird-trip-in-puerto-escondido-storytime-slow-english-for-intermediate-listeners.json
  - src/modules/playlists/data/videos/a2/ch20-intermediate-slow-english-podcast-my-trip-to-the-elephant-sanctuarycomprehensible-input.json
  - src/modules/playlists/data/a2.ts
  - src/modules/playlists/data/videos/b1/ch21-slow-english-listening-practice-makeup-routine.json
  - src/modules/playlists/data/videos/a1/ch6-slow-english-podcast-for-beginners-talking-about-friends.json
  - _private/misshoney/README.md
  - src/modules/playlists/data/videos/a1/ch7-slow-english-podcast-for-beginners-talking-about-goals.json
  - src/modules/playlists/data/videos/a2/ch10-powerful-daily-affirmations-learn-english-and-practice-gratitude-comprehensible-input.json
  - src/modules/playlists/data/videos/a2/ch16-slow-english-podcast-my-day-a2-listening-practice.json
  - src/app/router/index.ts
  - src/modules/playlists/data/videos/a2/ch3-slow-english-podcast-bus-stories-for-beginners.json
  - src/modules/playlists/data/videos/b1/ch7-interview-about-childhood-memories-faster-english-podcast-for-intermediate-listening-practice.json
  - src/modules/playlists/data/videos/b1/ch8-learn-slow-english-asmr-intermediate-b1-talking-about-sounds-and-noises-comprehensible-input.json
  - src/modules/playlists/data/videos/b2/ch1-slow-english-listening-for-upper-intermediate-talking-about-comfort-foods.json
  - src/modules/playlists/data/videos/a2/ch25-learn-english-travel-vlog-for-beginners.json
  - src/modules/playlists/data/videos/a2/ch12-grocery-store-essentials-for-a1-a2-beginners.json
  - src/modules/playlists/data/videos/b2/ch13-travel-with-english-slow-english-podcast.json
  - src/modules/playlists/data/videos/a2/ch4-slow-english-podcast-for-a2-b1-intemediate-levels-planning-my-first-trip.json
  - src/modules/chapters/data/ch4.ts
  - src/modules/playlists/data/videos/b1/ch3-slow-english-podcast-bus-stories-for-beginners.json
  - src/modules/playlists/data/videos/a1/ch14-how-to-introduce-yourself-in-english-for-beginners.json
  - src/modules/playlists/data/videos/a2/ch11-the-scariest-beach-day-slow-english-podcast-for-a1-a2-beginners-comprehensible-input.json
  - src/modules/playlists/data/videos/a1/ch10-learn-english-with-slow-interviews-comprehensible-input-a1-sleep-routines.json
  - PROJECT_ARCHITECTURE.md
  - src/modules/playlists/data/videos/a1/ch11-slow-english-reading-rainbow-fish-for-beginners-a1a2.json
  - src/modules/playlists/data/b1.ts
  - src/modules/playlists/data/videos/a1/ch2-beginner-english-slow-listening-practice-talking-about-me.json
  - src/modules/playlists/data/videos/a1/ch9-a1-beginner-slow-english-podcast-sleep-rest-vocabulary.json
  - src/modules/playlists/data/videos/b1/ch19-how-to-speak-english-real-life-role-play-b1b2.json
  - src/modules/playlists/components/PlaylistReadingHeader.vue
  - src/modules/playlists/data/videos/b1/ch15-english-sleep-learning-shadowing-positive-affirmations.json
  - _private/propose.md
  - src/modules/playlists/data/videos/a1/ch15-absolute-beginner-slow-english-what-is-my-favorite-holiday.json
  - src/modules/playlists/data/videos/a2/ch19-english-sleep-learning-shadowing-positive-affirmations.json
  - src/modules/playlists/types.ts
  - src/modules/playlists/data/videos/a1/ch16-beginner-english-speaking-practice-real-life-role-play-a1.json
  - scripts/misshoney/author-polished-content.mjs
  - src/modules/playlists/data/videos/a2/ch18-slow-english-podcast-a-day-in-my-life-a2-english-listening-practice.json
  - src/modules/playlists/data/videos/a2/ch24-sleep-and-learn-english-shadow-positive-affirmations.json
  - src/modules/playlists/data/videos/a2/ch8-a1-beginner-slow-english-podcast-sleep-rest-vocabulary.json
  - src/modules/playlists/components/PlaylistWordTag.vue
  - scripts/misshoney/content-core.d.mts
  - src/modules/playlists/data/videos/b1/ch20-100-essential-english-words-for-daily-life-slow-english-vocabulary.json
  - src/modules/playlists/data/videos/b2/ch15-learn-english-by-making-mistakes-slow-english-podcast.json
  - src/modules/playlists/data/videos/a1/ch3-slow-english-listening-for-beginners-talking-about-languages.json
  - src/modules/playlists/data/videos/b2/ch9-intermediate-slow-english-podcast-my-trip-to-the-elephant-sanctuarycomprehensible-input.json
  - scripts/publishPages.mjs
  - src/modules/playlists/data/videos/a1/ch4-practice-slow-english-for-a1-beginners-talk-about-family.json
  - src/modules/playlists/data/videos/a1/ch13-slow-english-podcast-the-giving-tree-for-beginners-a1a2.json
  - src/modules/playlists/data/videos/a2/ch23-how-to-actually-learn-english-10-tips-that-really-work.json
  - src/modules/home/components/ArticleListItem.vue
  - src/modules/playlists/data/videos/a2/ch6-essential-airport-vocabulary-slow-english-podcast-for-a2-beginners.json
  - src/modules/playlists/data/videos/b2/ch6-slow-english-podcast-my-bus-stories.json
  - src/modules/playlists/data/videos/b2/ch7-learn-english-with-slow-interviews-comprehensible-input-b1-interview-practice.json
  - src/shared/components/NavBar.vue
  - src/modules/playlists/data/videos/b1/ch18-english-kitchen-vocabulary-comprehensible-input.json
  - src/modules/playlists/data/videos/b1/ch12-slow-english-podcast-my-trip-to-new-york-city-level-b1.json
  - src/modules/playlists/data/videos/b1/ch6-my-trip-to-brazil-slow-english-podcast-for-high-beginners-a2-b1-comprehensible-input.json
  - src/modules/playlists/data/videos/b2/ch2-slow-english-for-intermediate-b2-with-subtitles-in-spanish-talking-about-languages.json
  - src/modules/playlists/data/videos/b2/ch16-learn-english-with-my-morning-routine-natural-speaking-practice.json
  - _private/筆記.md
  - src/modules/playlists/data/videos/a2/ch14-learn-english-with-slow-conversations-comprehensible-input-a1-weekend-routines.json
  - src/modules/playlists/components/PlaylistPhraseCard.vue
  - src/modules/home/views/HomeView.vue
  - src/modules/playlists/data/videos/b2/ch10-real-english-to-speak-when-you-travel-advanced-slow-english-podcast.json
  - src/modules/playlists/components/PlaylistSentenceBreakdown.vue
  - src/modules/playlists/data/videos/b1/ch16-slow-english-podcast-my-trip-to-mexico-city.json
  - src/modules/playlists/data/videos/b2/ch8-slow-english-podcast-why-am-i-learning-chinese-b2.json
  - src/modules/playlists/data/videos/b2/ch11-slow-english-podcast-my-stressful-trip-to-chinacomprehensible-input.json
  - src/modules/playlists/data/videos/a2/ch22-learn-english-at-home-slow-english.json
  - scripts/misshoney/promote-content.mjs
  - src/modules/playlists/PlaylistView.vue
  - src/modules/playlists/data/videos/b1/ch4-slow-english-podcast-for-a2-b1-intemediate-levels-planning-my-first-trip.json
  - src/modules/chapters/data/ch3.ts
  - src/modules/playlists/data/videos/a1/ch1-slow-english-for-beginners-a1-listening-practice.json
  - scripts/misshoney/scaffold-content.mjs
  - src/modules/playlists/data/videos/a1/ch18-english-listening-practice-for-beginners-my-weekend-a1-a2.json
  - src/modules/playlists/data/videos/b1/ch9-speak-like-a-native-common-english-idioms-slow-english-podcast-for-a2-b1-beginners.json
  - src/modules/playlists/data/videos/a2/ch2-slow-english-for-a2-high-beginners-how-colors-make-me-feel.json
  - src/modules/playlists/data/videos/a2/ch26-100-essential-english-words-for-daily-life-slow-english-vocabulary.json
  - src/modules/playlists/data/videos/b2/ch12-slow-english-podcast-advanced-listening-practice-natural-conversation-comprehensible-input.json
  - scripts/misshoney/content-core.mjs
  - src/modules/playlists/data/videos/b2/ch17-how-she-became-fluent-in-english-intermediate-listening-practice.json
  - src/modules/playlists/PlaylistVideoView.vue
  - scripts/misshoney/import-core.d.mts
  - src/modules/playlists/data/videos/a2/ch7-speak-like-a-native-common-abbreviations-slow-english-podcast-for-a2-beginners.json
  - src/modules/playlists/data/videos/a1/ch5-practice-slow-english-podcast-talking-about-weather.json
  - src/modules/playlists/data/videos/a1/ch8-slow-english-podcast-chat-with-me-about-foods.json
  - src/modules/playlists/data/videos/b2/ch3-slow-english-for-intermediate-b2-with-subtitles-in-portuguese-talking-about-languages.json
  - src/shared/config/playlists.ts
  - src/modules/playlists/data/videos/a2/ch28-learn-in-on-at-naturally-english-listening-practice.json
  - src/modules/playlists/data/videos/b1/ch1-slow-english-listening-intermediate-practice-talking-about-my-hobbies.json
  - src/modules/playlists/data/videos/a2/ch9-learn-english-with-slow-interviews-comprehensible-input-a1-sleep-routines.json
  - src/modules/playlists/data/videos/b1/ch11-slow-english-podcast-for-high-beginners-a2-b1-my-trip-to-the-usa-comprehensible-input.json
  - src/modules/playlists/data/videos/b2/ch14-learn-english-in-nyc-slow-english-vlog.json
  - _private/discuss.txt
  - src/modules/playlists/components/PlaylistSceneBlock.vue
  - src/modules/playlists/data/videos/a2/ch17-asmr-learn-english-while-sleeping-with-relaxing-sounds-slow-english-podcast.json
  - src/modules/playlists/data/videos/b1/ch5-job-interview-essentials-slow-english-podcast-for-intermediate-b1.json
  - src/modules/playlists/data/videos/b2/ch4-slow-english-for-c1-advanced-dreams.json
  - scripts/misshoney/import-playlists.mjs
  - src/shared/config/storageKeys.ts
  - src/modules/playlists/data/videos/a1/ch17-slow-english-conversations-a1-comprehensible-input.json
  - src/modules/grammar/views/GrammarView.vue
  - src/modules/home/composables/useMissHoneyCompletion.ts
  - src/modules/playlists/data/videos/a2/ch21-slow-english-reading-learn-english-with-childrens-books-comprehensible-input.json
  - src/modules/playlists/data/videos/b1/ch13-slow-english-podcast-my-trip-to-puerto-escondido-level-a2.json
  - src/shared/config/chapters.ts
  - scripts/misshoney/import-core.mjs
  - scripts/misshoney/validate-content.mjs
  - scripts/misshoney/sources.json
  - src/modules/playlists/data/a1.ts
  - src/modules/playlists/composables/usePlaylistReadingSections.ts
tests:
  - src/__tests__/NavBar.test.ts
  - tests/e2e/misshoney-polished.smoke.spec.ts
  - src/__tests__/HomeView.test.ts
  - src/__tests__/importerCore.test.ts
  - src/__tests__/ChapterView.test.ts
  - src/__tests__/ArticleListItemCompletion.test.ts
  - src/__tests__/PlaylistView.test.ts
  - src/__tests__/publishPages.test.ts
  - src/__tests__/PlaylistVideoView.test.ts
  - src/__tests__/chapterDataModule.test.ts
  - tests/e2e/ch3.smoke.spec.ts
  - tests/e2e/app-shell.smoke.spec.ts
  - src/__tests__/contentCore.test.ts
  - src/__tests__/useMissHoneyCompletion.test.ts
  - src/__tests__/GrammarView.test.ts
  - src/__tests__/HomeViewMissHoney.test.ts
-->

---
### Requirement: Import tool handles unavailable captions and videos safely

The importer SHALL treat unavailable videos and captions as reportable states, not as manual work for the user.

#### Scenario: video has no public English captions

- **WHEN** a playlist video has no public English captions or auto-captions
- **THEN** the importer records the video in `_private/misshoney/skipped/<level>.json`
- **THEN** the skipped reason is `no-english-captions`

#### Scenario: video is private, member-only, unavailable, or geo-restricted

- **WHEN** a playlist video cannot be fetched publicly
- **THEN** the importer records the video in `_private/misshoney/skipped/<level>.json`
- **THEN** the skipped reason is one of `member-only`, `private`, `unavailable`, or `geo-restricted`
- **THEN** the importer continues processing the remaining videos


<!-- @trace
source: add-misshoney-playlists
updated: 2026-05-23
code:
  - src/modules/playlists/data/videos/a2/ch29-what-you-taught-me-about-hope-slow-english-listening.json
  - src/modules/playlists/data/videos/a2/ch5-84-english-phrases-for-beginners-speak-like-a-native.json
  - src/modules/playlists/data/videos/b1/ch10-learn-english-with-slow-interviews-comprehensible-input-b1-interview-practice.json
  - src/modules/playlists/data/videos/b1/ch14-real-english-conversation-life-in-the-usa-vs-life-in-mexico-b1.json
  - src/modules/playlists/data/videos/b1/ch17-slow-english-practice-airport-essentials-for-traveling.json
  - src/modules/playlists/data/videos/b1/ch2-slow-english-practice-for-b1-intermediate-talking-about-airports.json
  - src/modules/playlists/data/videos/a2/ch15-daily-english-affirmations-for-speaking-confidence-fluency-i-am-a-fluent-english-speaker.json
  - src/modules/playlists/data/videos/a2/ch27-pronunciation-practice-50-english-words-to-sound-natural.json
  - src/modules/playlists/data/videos/b2/ch5-interview-about-childhood-memories-faster-english-podcast-for-intermediate-listening-practice.json
  - src/modules/playlists/data/videos/a2/ch1-slow-english-stories-level-a2-listening-a-weird-phone-call.json
  - src/modules/playlists/data/videos/a1/ch12-a-day-in-my-life-slow-english-podcast-a1-present-simple.json
  - package.json
  - src/modules/chapters/utils/highlight.ts
  - src/modules/playlists/data/b2.ts
  - src/modules/playlists/data/videos/a2/ch13-my-weird-trip-in-puerto-escondido-storytime-slow-english-for-intermediate-listeners.json
  - src/modules/playlists/data/videos/a2/ch20-intermediate-slow-english-podcast-my-trip-to-the-elephant-sanctuarycomprehensible-input.json
  - src/modules/playlists/data/a2.ts
  - src/modules/playlists/data/videos/b1/ch21-slow-english-listening-practice-makeup-routine.json
  - src/modules/playlists/data/videos/a1/ch6-slow-english-podcast-for-beginners-talking-about-friends.json
  - _private/misshoney/README.md
  - src/modules/playlists/data/videos/a1/ch7-slow-english-podcast-for-beginners-talking-about-goals.json
  - src/modules/playlists/data/videos/a2/ch10-powerful-daily-affirmations-learn-english-and-practice-gratitude-comprehensible-input.json
  - src/modules/playlists/data/videos/a2/ch16-slow-english-podcast-my-day-a2-listening-practice.json
  - src/app/router/index.ts
  - src/modules/playlists/data/videos/a2/ch3-slow-english-podcast-bus-stories-for-beginners.json
  - src/modules/playlists/data/videos/b1/ch7-interview-about-childhood-memories-faster-english-podcast-for-intermediate-listening-practice.json
  - src/modules/playlists/data/videos/b1/ch8-learn-slow-english-asmr-intermediate-b1-talking-about-sounds-and-noises-comprehensible-input.json
  - src/modules/playlists/data/videos/b2/ch1-slow-english-listening-for-upper-intermediate-talking-about-comfort-foods.json
  - src/modules/playlists/data/videos/a2/ch25-learn-english-travel-vlog-for-beginners.json
  - src/modules/playlists/data/videos/a2/ch12-grocery-store-essentials-for-a1-a2-beginners.json
  - src/modules/playlists/data/videos/b2/ch13-travel-with-english-slow-english-podcast.json
  - src/modules/playlists/data/videos/a2/ch4-slow-english-podcast-for-a2-b1-intemediate-levels-planning-my-first-trip.json
  - src/modules/chapters/data/ch4.ts
  - src/modules/playlists/data/videos/b1/ch3-slow-english-podcast-bus-stories-for-beginners.json
  - src/modules/playlists/data/videos/a1/ch14-how-to-introduce-yourself-in-english-for-beginners.json
  - src/modules/playlists/data/videos/a2/ch11-the-scariest-beach-day-slow-english-podcast-for-a1-a2-beginners-comprehensible-input.json
  - src/modules/playlists/data/videos/a1/ch10-learn-english-with-slow-interviews-comprehensible-input-a1-sleep-routines.json
  - PROJECT_ARCHITECTURE.md
  - src/modules/playlists/data/videos/a1/ch11-slow-english-reading-rainbow-fish-for-beginners-a1a2.json
  - src/modules/playlists/data/b1.ts
  - src/modules/playlists/data/videos/a1/ch2-beginner-english-slow-listening-practice-talking-about-me.json
  - src/modules/playlists/data/videos/a1/ch9-a1-beginner-slow-english-podcast-sleep-rest-vocabulary.json
  - src/modules/playlists/data/videos/b1/ch19-how-to-speak-english-real-life-role-play-b1b2.json
  - src/modules/playlists/components/PlaylistReadingHeader.vue
  - src/modules/playlists/data/videos/b1/ch15-english-sleep-learning-shadowing-positive-affirmations.json
  - _private/propose.md
  - src/modules/playlists/data/videos/a1/ch15-absolute-beginner-slow-english-what-is-my-favorite-holiday.json
  - src/modules/playlists/data/videos/a2/ch19-english-sleep-learning-shadowing-positive-affirmations.json
  - src/modules/playlists/types.ts
  - src/modules/playlists/data/videos/a1/ch16-beginner-english-speaking-practice-real-life-role-play-a1.json
  - scripts/misshoney/author-polished-content.mjs
  - src/modules/playlists/data/videos/a2/ch18-slow-english-podcast-a-day-in-my-life-a2-english-listening-practice.json
  - src/modules/playlists/data/videos/a2/ch24-sleep-and-learn-english-shadow-positive-affirmations.json
  - src/modules/playlists/data/videos/a2/ch8-a1-beginner-slow-english-podcast-sleep-rest-vocabulary.json
  - src/modules/playlists/components/PlaylistWordTag.vue
  - scripts/misshoney/content-core.d.mts
  - src/modules/playlists/data/videos/b1/ch20-100-essential-english-words-for-daily-life-slow-english-vocabulary.json
  - src/modules/playlists/data/videos/b2/ch15-learn-english-by-making-mistakes-slow-english-podcast.json
  - src/modules/playlists/data/videos/a1/ch3-slow-english-listening-for-beginners-talking-about-languages.json
  - src/modules/playlists/data/videos/b2/ch9-intermediate-slow-english-podcast-my-trip-to-the-elephant-sanctuarycomprehensible-input.json
  - scripts/publishPages.mjs
  - src/modules/playlists/data/videos/a1/ch4-practice-slow-english-for-a1-beginners-talk-about-family.json
  - src/modules/playlists/data/videos/a1/ch13-slow-english-podcast-the-giving-tree-for-beginners-a1a2.json
  - src/modules/playlists/data/videos/a2/ch23-how-to-actually-learn-english-10-tips-that-really-work.json
  - src/modules/home/components/ArticleListItem.vue
  - src/modules/playlists/data/videos/a2/ch6-essential-airport-vocabulary-slow-english-podcast-for-a2-beginners.json
  - src/modules/playlists/data/videos/b2/ch6-slow-english-podcast-my-bus-stories.json
  - src/modules/playlists/data/videos/b2/ch7-learn-english-with-slow-interviews-comprehensible-input-b1-interview-practice.json
  - src/shared/components/NavBar.vue
  - src/modules/playlists/data/videos/b1/ch18-english-kitchen-vocabulary-comprehensible-input.json
  - src/modules/playlists/data/videos/b1/ch12-slow-english-podcast-my-trip-to-new-york-city-level-b1.json
  - src/modules/playlists/data/videos/b1/ch6-my-trip-to-brazil-slow-english-podcast-for-high-beginners-a2-b1-comprehensible-input.json
  - src/modules/playlists/data/videos/b2/ch2-slow-english-for-intermediate-b2-with-subtitles-in-spanish-talking-about-languages.json
  - src/modules/playlists/data/videos/b2/ch16-learn-english-with-my-morning-routine-natural-speaking-practice.json
  - _private/筆記.md
  - src/modules/playlists/data/videos/a2/ch14-learn-english-with-slow-conversations-comprehensible-input-a1-weekend-routines.json
  - src/modules/playlists/components/PlaylistPhraseCard.vue
  - src/modules/home/views/HomeView.vue
  - src/modules/playlists/data/videos/b2/ch10-real-english-to-speak-when-you-travel-advanced-slow-english-podcast.json
  - src/modules/playlists/components/PlaylistSentenceBreakdown.vue
  - src/modules/playlists/data/videos/b1/ch16-slow-english-podcast-my-trip-to-mexico-city.json
  - src/modules/playlists/data/videos/b2/ch8-slow-english-podcast-why-am-i-learning-chinese-b2.json
  - src/modules/playlists/data/videos/b2/ch11-slow-english-podcast-my-stressful-trip-to-chinacomprehensible-input.json
  - src/modules/playlists/data/videos/a2/ch22-learn-english-at-home-slow-english.json
  - scripts/misshoney/promote-content.mjs
  - src/modules/playlists/PlaylistView.vue
  - src/modules/playlists/data/videos/b1/ch4-slow-english-podcast-for-a2-b1-intemediate-levels-planning-my-first-trip.json
  - src/modules/chapters/data/ch3.ts
  - src/modules/playlists/data/videos/a1/ch1-slow-english-for-beginners-a1-listening-practice.json
  - scripts/misshoney/scaffold-content.mjs
  - src/modules/playlists/data/videos/a1/ch18-english-listening-practice-for-beginners-my-weekend-a1-a2.json
  - src/modules/playlists/data/videos/b1/ch9-speak-like-a-native-common-english-idioms-slow-english-podcast-for-a2-b1-beginners.json
  - src/modules/playlists/data/videos/a2/ch2-slow-english-for-a2-high-beginners-how-colors-make-me-feel.json
  - src/modules/playlists/data/videos/a2/ch26-100-essential-english-words-for-daily-life-slow-english-vocabulary.json
  - src/modules/playlists/data/videos/b2/ch12-slow-english-podcast-advanced-listening-practice-natural-conversation-comprehensible-input.json
  - scripts/misshoney/content-core.mjs
  - src/modules/playlists/data/videos/b2/ch17-how-she-became-fluent-in-english-intermediate-listening-practice.json
  - src/modules/playlists/PlaylistVideoView.vue
  - scripts/misshoney/import-core.d.mts
  - src/modules/playlists/data/videos/a2/ch7-speak-like-a-native-common-abbreviations-slow-english-podcast-for-a2-beginners.json
  - src/modules/playlists/data/videos/a1/ch5-practice-slow-english-podcast-talking-about-weather.json
  - src/modules/playlists/data/videos/a1/ch8-slow-english-podcast-chat-with-me-about-foods.json
  - src/modules/playlists/data/videos/b2/ch3-slow-english-for-intermediate-b2-with-subtitles-in-portuguese-talking-about-languages.json
  - src/shared/config/playlists.ts
  - src/modules/playlists/data/videos/a2/ch28-learn-in-on-at-naturally-english-listening-practice.json
  - src/modules/playlists/data/videos/b1/ch1-slow-english-listening-intermediate-practice-talking-about-my-hobbies.json
  - src/modules/playlists/data/videos/a2/ch9-learn-english-with-slow-interviews-comprehensible-input-a1-sleep-routines.json
  - src/modules/playlists/data/videos/b1/ch11-slow-english-podcast-for-high-beginners-a2-b1-my-trip-to-the-usa-comprehensible-input.json
  - src/modules/playlists/data/videos/b2/ch14-learn-english-in-nyc-slow-english-vlog.json
  - _private/discuss.txt
  - src/modules/playlists/components/PlaylistSceneBlock.vue
  - src/modules/playlists/data/videos/a2/ch17-asmr-learn-english-while-sleeping-with-relaxing-sounds-slow-english-podcast.json
  - src/modules/playlists/data/videos/b1/ch5-job-interview-essentials-slow-english-podcast-for-intermediate-b1.json
  - src/modules/playlists/data/videos/b2/ch4-slow-english-for-c1-advanced-dreams.json
  - scripts/misshoney/import-playlists.mjs
  - src/shared/config/storageKeys.ts
  - src/modules/playlists/data/videos/a1/ch17-slow-english-conversations-a1-comprehensible-input.json
  - src/modules/grammar/views/GrammarView.vue
  - src/modules/home/composables/useMissHoneyCompletion.ts
  - src/modules/playlists/data/videos/a2/ch21-slow-english-reading-learn-english-with-childrens-books-comprehensible-input.json
  - src/modules/playlists/data/videos/b1/ch13-slow-english-podcast-my-trip-to-puerto-escondido-level-a2.json
  - src/shared/config/chapters.ts
  - scripts/misshoney/import-core.mjs
  - scripts/misshoney/validate-content.mjs
  - scripts/misshoney/sources.json
  - src/modules/playlists/data/a1.ts
  - src/modules/playlists/composables/usePlaylistReadingSections.ts
tests:
  - src/__tests__/NavBar.test.ts
  - tests/e2e/misshoney-polished.smoke.spec.ts
  - src/__tests__/HomeView.test.ts
  - src/__tests__/importerCore.test.ts
  - src/__tests__/ChapterView.test.ts
  - src/__tests__/ArticleListItemCompletion.test.ts
  - src/__tests__/PlaylistView.test.ts
  - src/__tests__/publishPages.test.ts
  - src/__tests__/PlaylistVideoView.test.ts
  - src/__tests__/chapterDataModule.test.ts
  - tests/e2e/ch3.smoke.spec.ts
  - tests/e2e/app-shell.smoke.spec.ts
  - src/__tests__/contentCore.test.ts
  - src/__tests__/useMissHoneyCompletion.test.ts
  - src/__tests__/GrammarView.test.ts
  - src/__tests__/HomeViewMissHoney.test.ts
-->

---
### Requirement: Import helper functions are testable without network access

Network calls SHALL be isolated in the CLI wrapper. Playlist ordering, slug creation, skipped reason mapping, transcript normalization, and output planning SHALL be implemented as pure helper functions that can be unit-tested without YouTube access.

#### Scenario: skipped videos do not consume display order

- **GIVEN** raw playlist items with original indexes 1, 2, 3, 4 where index 2 is skipped
- **WHEN** the importer normalizes the playlist in reverse original-index order
- **THEN** the non-skipped video at original index 4 receives `displayOrder: 1`
- **THEN** the non-skipped video at original index 3 receives `displayOrder: 2`
- **THEN** the non-skipped video at original index 1 receives `displayOrder: 3`
- **THEN** the skipped video receives no display order and no slug

#### Scenario: slug is generated from display order and English title

- **GIVEN** a learnable video with `displayOrder: 1` and title `What Is Your Name?`
- **WHEN** the importer derives the slug
- **THEN** the slug is `ch1-what-is-your-name`

<!-- @trace
source: add-misshoney-playlists
updated: 2026-05-23
code:
  - src/modules/playlists/data/videos/a2/ch29-what-you-taught-me-about-hope-slow-english-listening.json
  - src/modules/playlists/data/videos/a2/ch5-84-english-phrases-for-beginners-speak-like-a-native.json
  - src/modules/playlists/data/videos/b1/ch10-learn-english-with-slow-interviews-comprehensible-input-b1-interview-practice.json
  - src/modules/playlists/data/videos/b1/ch14-real-english-conversation-life-in-the-usa-vs-life-in-mexico-b1.json
  - src/modules/playlists/data/videos/b1/ch17-slow-english-practice-airport-essentials-for-traveling.json
  - src/modules/playlists/data/videos/b1/ch2-slow-english-practice-for-b1-intermediate-talking-about-airports.json
  - src/modules/playlists/data/videos/a2/ch15-daily-english-affirmations-for-speaking-confidence-fluency-i-am-a-fluent-english-speaker.json
  - src/modules/playlists/data/videos/a2/ch27-pronunciation-practice-50-english-words-to-sound-natural.json
  - src/modules/playlists/data/videos/b2/ch5-interview-about-childhood-memories-faster-english-podcast-for-intermediate-listening-practice.json
  - src/modules/playlists/data/videos/a2/ch1-slow-english-stories-level-a2-listening-a-weird-phone-call.json
  - src/modules/playlists/data/videos/a1/ch12-a-day-in-my-life-slow-english-podcast-a1-present-simple.json
  - package.json
  - src/modules/chapters/utils/highlight.ts
  - src/modules/playlists/data/b2.ts
  - src/modules/playlists/data/videos/a2/ch13-my-weird-trip-in-puerto-escondido-storytime-slow-english-for-intermediate-listeners.json
  - src/modules/playlists/data/videos/a2/ch20-intermediate-slow-english-podcast-my-trip-to-the-elephant-sanctuarycomprehensible-input.json
  - src/modules/playlists/data/a2.ts
  - src/modules/playlists/data/videos/b1/ch21-slow-english-listening-practice-makeup-routine.json
  - src/modules/playlists/data/videos/a1/ch6-slow-english-podcast-for-beginners-talking-about-friends.json
  - _private/misshoney/README.md
  - src/modules/playlists/data/videos/a1/ch7-slow-english-podcast-for-beginners-talking-about-goals.json
  - src/modules/playlists/data/videos/a2/ch10-powerful-daily-affirmations-learn-english-and-practice-gratitude-comprehensible-input.json
  - src/modules/playlists/data/videos/a2/ch16-slow-english-podcast-my-day-a2-listening-practice.json
  - src/app/router/index.ts
  - src/modules/playlists/data/videos/a2/ch3-slow-english-podcast-bus-stories-for-beginners.json
  - src/modules/playlists/data/videos/b1/ch7-interview-about-childhood-memories-faster-english-podcast-for-intermediate-listening-practice.json
  - src/modules/playlists/data/videos/b1/ch8-learn-slow-english-asmr-intermediate-b1-talking-about-sounds-and-noises-comprehensible-input.json
  - src/modules/playlists/data/videos/b2/ch1-slow-english-listening-for-upper-intermediate-talking-about-comfort-foods.json
  - src/modules/playlists/data/videos/a2/ch25-learn-english-travel-vlog-for-beginners.json
  - src/modules/playlists/data/videos/a2/ch12-grocery-store-essentials-for-a1-a2-beginners.json
  - src/modules/playlists/data/videos/b2/ch13-travel-with-english-slow-english-podcast.json
  - src/modules/playlists/data/videos/a2/ch4-slow-english-podcast-for-a2-b1-intemediate-levels-planning-my-first-trip.json
  - src/modules/chapters/data/ch4.ts
  - src/modules/playlists/data/videos/b1/ch3-slow-english-podcast-bus-stories-for-beginners.json
  - src/modules/playlists/data/videos/a1/ch14-how-to-introduce-yourself-in-english-for-beginners.json
  - src/modules/playlists/data/videos/a2/ch11-the-scariest-beach-day-slow-english-podcast-for-a1-a2-beginners-comprehensible-input.json
  - src/modules/playlists/data/videos/a1/ch10-learn-english-with-slow-interviews-comprehensible-input-a1-sleep-routines.json
  - PROJECT_ARCHITECTURE.md
  - src/modules/playlists/data/videos/a1/ch11-slow-english-reading-rainbow-fish-for-beginners-a1a2.json
  - src/modules/playlists/data/b1.ts
  - src/modules/playlists/data/videos/a1/ch2-beginner-english-slow-listening-practice-talking-about-me.json
  - src/modules/playlists/data/videos/a1/ch9-a1-beginner-slow-english-podcast-sleep-rest-vocabulary.json
  - src/modules/playlists/data/videos/b1/ch19-how-to-speak-english-real-life-role-play-b1b2.json
  - src/modules/playlists/components/PlaylistReadingHeader.vue
  - src/modules/playlists/data/videos/b1/ch15-english-sleep-learning-shadowing-positive-affirmations.json
  - _private/propose.md
  - src/modules/playlists/data/videos/a1/ch15-absolute-beginner-slow-english-what-is-my-favorite-holiday.json
  - src/modules/playlists/data/videos/a2/ch19-english-sleep-learning-shadowing-positive-affirmations.json
  - src/modules/playlists/types.ts
  - src/modules/playlists/data/videos/a1/ch16-beginner-english-speaking-practice-real-life-role-play-a1.json
  - scripts/misshoney/author-polished-content.mjs
  - src/modules/playlists/data/videos/a2/ch18-slow-english-podcast-a-day-in-my-life-a2-english-listening-practice.json
  - src/modules/playlists/data/videos/a2/ch24-sleep-and-learn-english-shadow-positive-affirmations.json
  - src/modules/playlists/data/videos/a2/ch8-a1-beginner-slow-english-podcast-sleep-rest-vocabulary.json
  - src/modules/playlists/components/PlaylistWordTag.vue
  - scripts/misshoney/content-core.d.mts
  - src/modules/playlists/data/videos/b1/ch20-100-essential-english-words-for-daily-life-slow-english-vocabulary.json
  - src/modules/playlists/data/videos/b2/ch15-learn-english-by-making-mistakes-slow-english-podcast.json
  - src/modules/playlists/data/videos/a1/ch3-slow-english-listening-for-beginners-talking-about-languages.json
  - src/modules/playlists/data/videos/b2/ch9-intermediate-slow-english-podcast-my-trip-to-the-elephant-sanctuarycomprehensible-input.json
  - scripts/publishPages.mjs
  - src/modules/playlists/data/videos/a1/ch4-practice-slow-english-for-a1-beginners-talk-about-family.json
  - src/modules/playlists/data/videos/a1/ch13-slow-english-podcast-the-giving-tree-for-beginners-a1a2.json
  - src/modules/playlists/data/videos/a2/ch23-how-to-actually-learn-english-10-tips-that-really-work.json
  - src/modules/home/components/ArticleListItem.vue
  - src/modules/playlists/data/videos/a2/ch6-essential-airport-vocabulary-slow-english-podcast-for-a2-beginners.json
  - src/modules/playlists/data/videos/b2/ch6-slow-english-podcast-my-bus-stories.json
  - src/modules/playlists/data/videos/b2/ch7-learn-english-with-slow-interviews-comprehensible-input-b1-interview-practice.json
  - src/shared/components/NavBar.vue
  - src/modules/playlists/data/videos/b1/ch18-english-kitchen-vocabulary-comprehensible-input.json
  - src/modules/playlists/data/videos/b1/ch12-slow-english-podcast-my-trip-to-new-york-city-level-b1.json
  - src/modules/playlists/data/videos/b1/ch6-my-trip-to-brazil-slow-english-podcast-for-high-beginners-a2-b1-comprehensible-input.json
  - src/modules/playlists/data/videos/b2/ch2-slow-english-for-intermediate-b2-with-subtitles-in-spanish-talking-about-languages.json
  - src/modules/playlists/data/videos/b2/ch16-learn-english-with-my-morning-routine-natural-speaking-practice.json
  - _private/筆記.md
  - src/modules/playlists/data/videos/a2/ch14-learn-english-with-slow-conversations-comprehensible-input-a1-weekend-routines.json
  - src/modules/playlists/components/PlaylistPhraseCard.vue
  - src/modules/home/views/HomeView.vue
  - src/modules/playlists/data/videos/b2/ch10-real-english-to-speak-when-you-travel-advanced-slow-english-podcast.json
  - src/modules/playlists/components/PlaylistSentenceBreakdown.vue
  - src/modules/playlists/data/videos/b1/ch16-slow-english-podcast-my-trip-to-mexico-city.json
  - src/modules/playlists/data/videos/b2/ch8-slow-english-podcast-why-am-i-learning-chinese-b2.json
  - src/modules/playlists/data/videos/b2/ch11-slow-english-podcast-my-stressful-trip-to-chinacomprehensible-input.json
  - src/modules/playlists/data/videos/a2/ch22-learn-english-at-home-slow-english.json
  - scripts/misshoney/promote-content.mjs
  - src/modules/playlists/PlaylistView.vue
  - src/modules/playlists/data/videos/b1/ch4-slow-english-podcast-for-a2-b1-intemediate-levels-planning-my-first-trip.json
  - src/modules/chapters/data/ch3.ts
  - src/modules/playlists/data/videos/a1/ch1-slow-english-for-beginners-a1-listening-practice.json
  - scripts/misshoney/scaffold-content.mjs
  - src/modules/playlists/data/videos/a1/ch18-english-listening-practice-for-beginners-my-weekend-a1-a2.json
  - src/modules/playlists/data/videos/b1/ch9-speak-like-a-native-common-english-idioms-slow-english-podcast-for-a2-b1-beginners.json
  - src/modules/playlists/data/videos/a2/ch2-slow-english-for-a2-high-beginners-how-colors-make-me-feel.json
  - src/modules/playlists/data/videos/a2/ch26-100-essential-english-words-for-daily-life-slow-english-vocabulary.json
  - src/modules/playlists/data/videos/b2/ch12-slow-english-podcast-advanced-listening-practice-natural-conversation-comprehensible-input.json
  - scripts/misshoney/content-core.mjs
  - src/modules/playlists/data/videos/b2/ch17-how-she-became-fluent-in-english-intermediate-listening-practice.json
  - src/modules/playlists/PlaylistVideoView.vue
  - scripts/misshoney/import-core.d.mts
  - src/modules/playlists/data/videos/a2/ch7-speak-like-a-native-common-abbreviations-slow-english-podcast-for-a2-beginners.json
  - src/modules/playlists/data/videos/a1/ch5-practice-slow-english-podcast-talking-about-weather.json
  - src/modules/playlists/data/videos/a1/ch8-slow-english-podcast-chat-with-me-about-foods.json
  - src/modules/playlists/data/videos/b2/ch3-slow-english-for-intermediate-b2-with-subtitles-in-portuguese-talking-about-languages.json
  - src/shared/config/playlists.ts
  - src/modules/playlists/data/videos/a2/ch28-learn-in-on-at-naturally-english-listening-practice.json
  - src/modules/playlists/data/videos/b1/ch1-slow-english-listening-intermediate-practice-talking-about-my-hobbies.json
  - src/modules/playlists/data/videos/a2/ch9-learn-english-with-slow-interviews-comprehensible-input-a1-sleep-routines.json
  - src/modules/playlists/data/videos/b1/ch11-slow-english-podcast-for-high-beginners-a2-b1-my-trip-to-the-usa-comprehensible-input.json
  - src/modules/playlists/data/videos/b2/ch14-learn-english-in-nyc-slow-english-vlog.json
  - _private/discuss.txt
  - src/modules/playlists/components/PlaylistSceneBlock.vue
  - src/modules/playlists/data/videos/a2/ch17-asmr-learn-english-while-sleeping-with-relaxing-sounds-slow-english-podcast.json
  - src/modules/playlists/data/videos/b1/ch5-job-interview-essentials-slow-english-podcast-for-intermediate-b1.json
  - src/modules/playlists/data/videos/b2/ch4-slow-english-for-c1-advanced-dreams.json
  - scripts/misshoney/import-playlists.mjs
  - src/shared/config/storageKeys.ts
  - src/modules/playlists/data/videos/a1/ch17-slow-english-conversations-a1-comprehensible-input.json
  - src/modules/grammar/views/GrammarView.vue
  - src/modules/home/composables/useMissHoneyCompletion.ts
  - src/modules/playlists/data/videos/a2/ch21-slow-english-reading-learn-english-with-childrens-books-comprehensible-input.json
  - src/modules/playlists/data/videos/b1/ch13-slow-english-podcast-my-trip-to-puerto-escondido-level-a2.json
  - src/shared/config/chapters.ts
  - scripts/misshoney/import-core.mjs
  - scripts/misshoney/validate-content.mjs
  - scripts/misshoney/sources.json
  - src/modules/playlists/data/a1.ts
  - src/modules/playlists/composables/usePlaylistReadingSections.ts
tests:
  - src/__tests__/NavBar.test.ts
  - tests/e2e/misshoney-polished.smoke.spec.ts
  - src/__tests__/HomeView.test.ts
  - src/__tests__/importerCore.test.ts
  - src/__tests__/ChapterView.test.ts
  - src/__tests__/ArticleListItemCompletion.test.ts
  - src/__tests__/PlaylistView.test.ts
  - src/__tests__/publishPages.test.ts
  - src/__tests__/PlaylistVideoView.test.ts
  - src/__tests__/chapterDataModule.test.ts
  - tests/e2e/ch3.smoke.spec.ts
  - tests/e2e/app-shell.smoke.spec.ts
  - src/__tests__/contentCore.test.ts
  - src/__tests__/useMissHoneyCompletion.test.ts
  - src/__tests__/GrammarView.test.ts
  - src/__tests__/HomeViewMissHoney.test.ts
-->