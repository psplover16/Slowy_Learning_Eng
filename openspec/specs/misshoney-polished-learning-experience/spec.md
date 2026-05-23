# misshoney-polished-learning-experience Specification

## Purpose

TBD - created by archiving change 'polish-misshoney-ui-and-content'. Update Purpose after archive.

## Requirements

### Requirement: Playlist level pages use article-list card styling

The MissHoney level routes (`/a1`, `/a2`, `/b1`, `/b2`) SHALL render video entries as vertically spaced cards that match the home article list card structure: primary title, optional subtitle, full-card navigation target, trailing completion toggle, paper background, rounded border, and hover/focus feedback.

#### Scenario: Level page renders article-style video cards

- **WHEN** the user visits `/a1`
- **THEN** every ready or pending video entry is rendered as an article-style card with title, optional subtitle, and a trailing completion toggle
- **AND** the cards are separated by a stable vertical gap

#### Scenario: Completion toggle persists per video

- **WHEN** the user toggles the completion control on a MissHoney video card
- **THEN** the card completion icon changes state
- **AND** the state is persisted under the MissHoney completion storage key for that videoId
- **AND** chapter completion storage is not modified

##### Example: Completion isolation

- **GIVEN** `localStorage["slowy:completion"]` is `{ "ch1": true }`
- **AND** `localStorage["slowy:miss-honey-completion"]` is `{}`
- **WHEN** the user toggles videoId `kVNYOW3eMk4` on `/a1`
- **THEN** `localStorage["slowy:miss-honey-completion"]` contains `{ "kVNYOW3eMk4": true }`
- **AND** `localStorage["slowy:completion"]` remains `{ "ch1": true }`


<!-- @trace
source: polish-misshoney-ui-and-content
updated: 2026-05-23
code:
  - src/modules/playlists/data/videos/b2/ch4-slow-english-for-c1-advanced-dreams.json
  - src/modules/playlists/types.ts
  - src/modules/playlists/data/videos/a2/ch27-pronunciation-practice-50-english-words-to-sound-natural.json
  - src/modules/playlists/components/PlaylistReadingHeader.vue
  - src/modules/playlists/data/videos/a2/ch11-the-scariest-beach-day-slow-english-podcast-for-a1-a2-beginners-comprehensible-input.json
  - src/modules/playlists/data/videos/a2/ch3-slow-english-podcast-bus-stories-for-beginners.json
  - src/modules/playlists/data/videos/a2/ch5-84-english-phrases-for-beginners-speak-like-a-native.json
  - src/modules/playlists/data/videos/a2/ch18-slow-english-podcast-a-day-in-my-life-a2-english-listening-practice.json
  - src/modules/playlists/data/videos/b1/ch21-slow-english-listening-practice-makeup-routine.json
  - src/modules/playlists/data/videos/b1/ch8-learn-slow-english-asmr-intermediate-b1-talking-about-sounds-and-noises-comprehensible-input.json
  - src/modules/playlists/data/videos/b2/ch6-slow-english-podcast-my-bus-stories.json
  - src/modules/playlists/data/videos/a1/ch14-how-to-introduce-yourself-in-english-for-beginners.json
  - src/modules/playlists/data/videos/a2/ch7-speak-like-a-native-common-abbreviations-slow-english-podcast-for-a2-beginners.json
  - src/modules/playlists/data/videos/b1/ch4-slow-english-podcast-for-a2-b1-intemediate-levels-planning-my-first-trip.json
  - src/modules/playlists/data/videos/b1/ch12-slow-english-podcast-my-trip-to-new-york-city-level-b1.json
  - src/modules/playlists/data/videos/b1/ch15-english-sleep-learning-shadowing-positive-affirmations.json
  - src/modules/playlists/components/PlaylistPhraseCard.vue
  - src/modules/playlists/data/videos/a1/ch11-slow-english-reading-rainbow-fish-for-beginners-a1a2.json
  - scripts/misshoney/author-polished-content.mjs
  - src/modules/playlists/data/videos/b1/ch3-slow-english-podcast-bus-stories-for-beginners.json
  - src/modules/playlists/data/videos/a2/ch10-powerful-daily-affirmations-learn-english-and-practice-gratitude-comprehensible-input.json
  - src/modules/playlists/data/videos/a2/ch14-learn-english-with-slow-conversations-comprehensible-input-a1-weekend-routines.json
  - src/modules/playlists/data/videos/a2/ch2-slow-english-for-a2-high-beginners-how-colors-make-me-feel.json
  - src/modules/playlists/data/videos/b1/ch13-slow-english-podcast-my-trip-to-puerto-escondido-level-a2.json
  - scripts/misshoney/content-core.mjs
  - src/modules/home/views/HomeView.vue
  - src/modules/playlists/data/videos/b2/ch1-slow-english-listening-for-upper-intermediate-talking-about-comfort-foods.json
  - src/modules/playlists/data/videos/b2/ch3-slow-english-for-intermediate-b2-with-subtitles-in-portuguese-talking-about-languages.json
  - src/modules/playlists/data/videos/a2/ch25-learn-english-travel-vlog-for-beginners.json
  - src/modules/playlists/data/videos/b1/ch2-slow-english-practice-for-b1-intermediate-talking-about-airports.json
  - src/modules/playlists/data/videos/a2/ch1-slow-english-stories-level-a2-listening-a-weird-phone-call.json
  - src/modules/home/components/ArticleListItem.vue
  - src/modules/playlists/data/videos/a2/ch19-english-sleep-learning-shadowing-positive-affirmations.json
  - src/modules/playlists/data/videos/a2/ch21-slow-english-reading-learn-english-with-childrens-books-comprehensible-input.json
  - src/modules/playlists/PlaylistView.vue
  - src/modules/playlists/data/videos/a2/ch4-slow-english-podcast-for-a2-b1-intemediate-levels-planning-my-first-trip.json
  - src/modules/playlists/data/videos/b2/ch5-interview-about-childhood-memories-faster-english-podcast-for-intermediate-listening-practice.json
  - PROJECT_ARCHITECTURE.md
  - src/modules/playlists/data/videos/a1/ch16-beginner-english-speaking-practice-real-life-role-play-a1.json
  - src/modules/playlists/PlaylistVideoView.vue
  - src/modules/playlists/composables/usePlaylistReadingSections.ts
  - src/modules/playlists/data/videos/a2/ch9-learn-english-with-slow-interviews-comprehensible-input-a1-sleep-routines.json
  - src/modules/playlists/data/videos/a1/ch1-slow-english-for-beginners-a1-listening-practice.json
  - src/modules/playlists/data/videos/a1/ch9-a1-beginner-slow-english-podcast-sleep-rest-vocabulary.json
  - package.json
  - src/modules/playlists/data/videos/b2/ch11-slow-english-podcast-my-stressful-trip-to-chinacomprehensible-input.json
  - src/modules/playlists/data/videos/b2/ch13-travel-with-english-slow-english-podcast.json
  - scripts/misshoney/sources.json
  - src/modules/playlists/data/videos/b2/ch7-learn-english-with-slow-interviews-comprehensible-input-b1-interview-practice.json
  - src/modules/playlists/data/videos/b2/ch14-learn-english-in-nyc-slow-english-vlog.json
  - src/modules/playlists/data/videos/b1/ch20-100-essential-english-words-for-daily-life-slow-english-vocabulary.json
  - scripts/misshoney/promote-content.mjs
  - src/modules/playlists/data/videos/a2/ch20-intermediate-slow-english-podcast-my-trip-to-the-elephant-sanctuarycomprehensible-input.json
  - src/modules/playlists/data/videos/b1/ch16-slow-english-podcast-my-trip-to-mexico-city.json
  - src/modules/playlists/data/videos/a1/ch17-slow-english-conversations-a1-comprehensible-input.json
  - src/modules/playlists/data/videos/b1/ch19-how-to-speak-english-real-life-role-play-b1b2.json
  - src/modules/playlists/data/videos/b1/ch11-slow-english-podcast-for-high-beginners-a2-b1-my-trip-to-the-usa-comprehensible-input.json
  - src/modules/playlists/data/videos/b1/ch6-my-trip-to-brazil-slow-english-podcast-for-high-beginners-a2-b1-comprehensible-input.json
  - src/modules/playlists/data/a2.ts
  - src/modules/playlists/data/videos/b2/ch10-real-english-to-speak-when-you-travel-advanced-slow-english-podcast.json
  - src/modules/playlists/data/videos/b1/ch7-interview-about-childhood-memories-faster-english-podcast-for-intermediate-listening-practice.json
  - src/modules/playlists/data/videos/a2/ch16-slow-english-podcast-my-day-a2-listening-practice.json
  - src/modules/playlists/data/b1.ts
  - src/modules/playlists/data/videos/a1/ch2-beginner-english-slow-listening-practice-talking-about-me.json
  - src/modules/playlists/data/videos/b1/ch14-real-english-conversation-life-in-the-usa-vs-life-in-mexico-b1.json
  - src/modules/playlists/data/videos/b1/ch18-english-kitchen-vocabulary-comprehensible-input.json
  - src/modules/playlists/data/videos/a1/ch5-practice-slow-english-podcast-talking-about-weather.json
  - src/modules/playlists/data/videos/a1/ch7-slow-english-podcast-for-beginners-talking-about-goals.json
  - scripts/publishPages.mjs
  - src/modules/playlists/data/b2.ts
  - scripts/misshoney/import-playlists.mjs
  - src/modules/playlists/data/videos/b2/ch16-learn-english-with-my-morning-routine-natural-speaking-practice.json
  - src/modules/playlists/data/videos/a1/ch6-slow-english-podcast-for-beginners-talking-about-friends.json
  - src/modules/playlists/data/videos/a2/ch24-sleep-and-learn-english-shadow-positive-affirmations.json
  - src/modules/playlists/data/videos/b1/ch5-job-interview-essentials-slow-english-podcast-for-intermediate-b1.json
  - src/modules/playlists/data/videos/a1/ch3-slow-english-listening-for-beginners-talking-about-languages.json
  - src/modules/playlists/data/videos/b2/ch8-slow-english-podcast-why-am-i-learning-chinese-b2.json
  - src/modules/playlists/components/PlaylistSentenceBreakdown.vue
  - src/modules/playlists/data/videos/b2/ch2-slow-english-for-intermediate-b2-with-subtitles-in-spanish-talking-about-languages.json
  - src/modules/playlists/data/videos/a2/ch6-essential-airport-vocabulary-slow-english-podcast-for-a2-beginners.json
  - src/modules/playlists/data/videos/a1/ch4-practice-slow-english-for-a1-beginners-talk-about-family.json
  - src/modules/playlists/data/videos/a1/ch8-slow-english-podcast-chat-with-me-about-foods.json
  - src/modules/playlists/data/videos/b1/ch17-slow-english-practice-airport-essentials-for-traveling.json
  - src/modules/playlists/data/a1.ts
  - src/modules/playlists/data/videos/a1/ch12-a-day-in-my-life-slow-english-podcast-a1-present-simple.json
  - src/modules/playlists/data/videos/a2/ch8-a1-beginner-slow-english-podcast-sleep-rest-vocabulary.json
  - src/modules/playlists/data/videos/b1/ch9-speak-like-a-native-common-english-idioms-slow-english-podcast-for-a2-b1-beginners.json
  - src/modules/playlists/data/videos/b2/ch15-learn-english-by-making-mistakes-slow-english-podcast.json
  - src/modules/playlists/data/videos/b2/ch17-how-she-became-fluent-in-english-intermediate-listening-practice.json
  - src/modules/playlists/data/videos/a2/ch12-grocery-store-essentials-for-a1-a2-beginners.json
  - src/modules/playlists/data/videos/a1/ch13-slow-english-podcast-the-giving-tree-for-beginners-a1a2.json
  - scripts/misshoney/content-core.d.mts
  - src/modules/playlists/data/videos/a2/ch13-my-weird-trip-in-puerto-escondido-storytime-slow-english-for-intermediate-listeners.json
  - src/modules/playlists/data/videos/a2/ch29-what-you-taught-me-about-hope-slow-english-listening.json
  - src/modules/playlists/data/videos/b1/ch10-learn-english-with-slow-interviews-comprehensible-input-b1-interview-practice.json
  - src/modules/playlists/data/videos/a2/ch15-daily-english-affirmations-for-speaking-confidence-fluency-i-am-a-fluent-english-speaker.json
  - scripts/misshoney/import-core.d.mts
  - scripts/misshoney/import-core.mjs
  - src/modules/playlists/data/videos/a2/ch26-100-essential-english-words-for-daily-life-slow-english-vocabulary.json
  - src/modules/playlists/data/videos/b1/ch1-slow-english-listening-intermediate-practice-talking-about-my-hobbies.json
  - src/modules/playlists/data/videos/a2/ch22-learn-english-at-home-slow-english.json
  - src/modules/playlists/data/videos/b2/ch9-intermediate-slow-english-podcast-my-trip-to-the-elephant-sanctuarycomprehensible-input.json
  - src/modules/playlists/data/videos/b2/ch12-slow-english-podcast-advanced-listening-practice-natural-conversation-comprehensible-input.json
  - src/modules/playlists/data/videos/a1/ch18-english-listening-practice-for-beginners-my-weekend-a1-a2.json
  - src/modules/playlists/data/videos/a2/ch28-learn-in-on-at-naturally-english-listening-practice.json
  - src/modules/playlists/data/videos/a1/ch10-learn-english-with-slow-interviews-comprehensible-input-a1-sleep-routines.json
  - src/modules/playlists/data/videos/a1/ch15-absolute-beginner-slow-english-what-is-my-favorite-holiday.json
  - src/modules/playlists/components/PlaylistSceneBlock.vue
  - src/modules/playlists/data/videos/a2/ch17-asmr-learn-english-while-sleeping-with-relaxing-sounds-slow-english-podcast.json
  - src/modules/playlists/components/PlaylistWordTag.vue
  - src/modules/playlists/data/videos/a2/ch23-how-to-actually-learn-english-10-tips-that-really-work.json
tests:
  - tests/e2e/misshoney-polished.smoke.spec.ts
  - src/__tests__/publishPages.test.ts
  - src/__tests__/PlaylistView.test.ts
  - src/__tests__/PlaylistVideoView.test.ts
  - src/__tests__/HomeView.test.ts
  - src/__tests__/contentCore.test.ts
  - src/__tests__/importerCore.test.ts
-->

---
### Requirement: Playlist video pages render a polished reading layout

A ready MissHoney video route SHALL render a polished reading page that follows the existing chapter reading language: header block, source link, section quick navigation, numbered section headings, bilingual scene blocks, vocabulary, phrases, and sentence breakdowns.

#### Scenario: Ready video page renders all learning sections

- **WHEN** the user visits a ready video route such as `/a1/ch1-slow-english-for-beginners-a1-listening-practice`
- **THEN** the page displays a header with the video title, level tag, topic tag when present, and YouTube source link
- **AND** the page displays quick navigation for every non-empty learning section
- **AND** the page displays bilingual text, vocabulary, phrases, and sentence breakdowns when the content contains those arrays

#### Scenario: Mobile bilingual text uses separate lines

- **WHEN** a bilingual sentence renders on a viewport narrower than 640 px
- **THEN** the English text appears on its own line
- **AND** the Traditional Chinese translation appears on the next line with visual indentation or border treatment


<!-- @trace
source: polish-misshoney-ui-and-content
updated: 2026-05-23
code:
  - src/modules/playlists/data/videos/b2/ch4-slow-english-for-c1-advanced-dreams.json
  - src/modules/playlists/types.ts
  - src/modules/playlists/data/videos/a2/ch27-pronunciation-practice-50-english-words-to-sound-natural.json
  - src/modules/playlists/components/PlaylistReadingHeader.vue
  - src/modules/playlists/data/videos/a2/ch11-the-scariest-beach-day-slow-english-podcast-for-a1-a2-beginners-comprehensible-input.json
  - src/modules/playlists/data/videos/a2/ch3-slow-english-podcast-bus-stories-for-beginners.json
  - src/modules/playlists/data/videos/a2/ch5-84-english-phrases-for-beginners-speak-like-a-native.json
  - src/modules/playlists/data/videos/a2/ch18-slow-english-podcast-a-day-in-my-life-a2-english-listening-practice.json
  - src/modules/playlists/data/videos/b1/ch21-slow-english-listening-practice-makeup-routine.json
  - src/modules/playlists/data/videos/b1/ch8-learn-slow-english-asmr-intermediate-b1-talking-about-sounds-and-noises-comprehensible-input.json
  - src/modules/playlists/data/videos/b2/ch6-slow-english-podcast-my-bus-stories.json
  - src/modules/playlists/data/videos/a1/ch14-how-to-introduce-yourself-in-english-for-beginners.json
  - src/modules/playlists/data/videos/a2/ch7-speak-like-a-native-common-abbreviations-slow-english-podcast-for-a2-beginners.json
  - src/modules/playlists/data/videos/b1/ch4-slow-english-podcast-for-a2-b1-intemediate-levels-planning-my-first-trip.json
  - src/modules/playlists/data/videos/b1/ch12-slow-english-podcast-my-trip-to-new-york-city-level-b1.json
  - src/modules/playlists/data/videos/b1/ch15-english-sleep-learning-shadowing-positive-affirmations.json
  - src/modules/playlists/components/PlaylistPhraseCard.vue
  - src/modules/playlists/data/videos/a1/ch11-slow-english-reading-rainbow-fish-for-beginners-a1a2.json
  - scripts/misshoney/author-polished-content.mjs
  - src/modules/playlists/data/videos/b1/ch3-slow-english-podcast-bus-stories-for-beginners.json
  - src/modules/playlists/data/videos/a2/ch10-powerful-daily-affirmations-learn-english-and-practice-gratitude-comprehensible-input.json
  - src/modules/playlists/data/videos/a2/ch14-learn-english-with-slow-conversations-comprehensible-input-a1-weekend-routines.json
  - src/modules/playlists/data/videos/a2/ch2-slow-english-for-a2-high-beginners-how-colors-make-me-feel.json
  - src/modules/playlists/data/videos/b1/ch13-slow-english-podcast-my-trip-to-puerto-escondido-level-a2.json
  - scripts/misshoney/content-core.mjs
  - src/modules/home/views/HomeView.vue
  - src/modules/playlists/data/videos/b2/ch1-slow-english-listening-for-upper-intermediate-talking-about-comfort-foods.json
  - src/modules/playlists/data/videos/b2/ch3-slow-english-for-intermediate-b2-with-subtitles-in-portuguese-talking-about-languages.json
  - src/modules/playlists/data/videos/a2/ch25-learn-english-travel-vlog-for-beginners.json
  - src/modules/playlists/data/videos/b1/ch2-slow-english-practice-for-b1-intermediate-talking-about-airports.json
  - src/modules/playlists/data/videos/a2/ch1-slow-english-stories-level-a2-listening-a-weird-phone-call.json
  - src/modules/home/components/ArticleListItem.vue
  - src/modules/playlists/data/videos/a2/ch19-english-sleep-learning-shadowing-positive-affirmations.json
  - src/modules/playlists/data/videos/a2/ch21-slow-english-reading-learn-english-with-childrens-books-comprehensible-input.json
  - src/modules/playlists/PlaylistView.vue
  - src/modules/playlists/data/videos/a2/ch4-slow-english-podcast-for-a2-b1-intemediate-levels-planning-my-first-trip.json
  - src/modules/playlists/data/videos/b2/ch5-interview-about-childhood-memories-faster-english-podcast-for-intermediate-listening-practice.json
  - PROJECT_ARCHITECTURE.md
  - src/modules/playlists/data/videos/a1/ch16-beginner-english-speaking-practice-real-life-role-play-a1.json
  - src/modules/playlists/PlaylistVideoView.vue
  - src/modules/playlists/composables/usePlaylistReadingSections.ts
  - src/modules/playlists/data/videos/a2/ch9-learn-english-with-slow-interviews-comprehensible-input-a1-sleep-routines.json
  - src/modules/playlists/data/videos/a1/ch1-slow-english-for-beginners-a1-listening-practice.json
  - src/modules/playlists/data/videos/a1/ch9-a1-beginner-slow-english-podcast-sleep-rest-vocabulary.json
  - package.json
  - src/modules/playlists/data/videos/b2/ch11-slow-english-podcast-my-stressful-trip-to-chinacomprehensible-input.json
  - src/modules/playlists/data/videos/b2/ch13-travel-with-english-slow-english-podcast.json
  - scripts/misshoney/sources.json
  - src/modules/playlists/data/videos/b2/ch7-learn-english-with-slow-interviews-comprehensible-input-b1-interview-practice.json
  - src/modules/playlists/data/videos/b2/ch14-learn-english-in-nyc-slow-english-vlog.json
  - src/modules/playlists/data/videos/b1/ch20-100-essential-english-words-for-daily-life-slow-english-vocabulary.json
  - scripts/misshoney/promote-content.mjs
  - src/modules/playlists/data/videos/a2/ch20-intermediate-slow-english-podcast-my-trip-to-the-elephant-sanctuarycomprehensible-input.json
  - src/modules/playlists/data/videos/b1/ch16-slow-english-podcast-my-trip-to-mexico-city.json
  - src/modules/playlists/data/videos/a1/ch17-slow-english-conversations-a1-comprehensible-input.json
  - src/modules/playlists/data/videos/b1/ch19-how-to-speak-english-real-life-role-play-b1b2.json
  - src/modules/playlists/data/videos/b1/ch11-slow-english-podcast-for-high-beginners-a2-b1-my-trip-to-the-usa-comprehensible-input.json
  - src/modules/playlists/data/videos/b1/ch6-my-trip-to-brazil-slow-english-podcast-for-high-beginners-a2-b1-comprehensible-input.json
  - src/modules/playlists/data/a2.ts
  - src/modules/playlists/data/videos/b2/ch10-real-english-to-speak-when-you-travel-advanced-slow-english-podcast.json
  - src/modules/playlists/data/videos/b1/ch7-interview-about-childhood-memories-faster-english-podcast-for-intermediate-listening-practice.json
  - src/modules/playlists/data/videos/a2/ch16-slow-english-podcast-my-day-a2-listening-practice.json
  - src/modules/playlists/data/b1.ts
  - src/modules/playlists/data/videos/a1/ch2-beginner-english-slow-listening-practice-talking-about-me.json
  - src/modules/playlists/data/videos/b1/ch14-real-english-conversation-life-in-the-usa-vs-life-in-mexico-b1.json
  - src/modules/playlists/data/videos/b1/ch18-english-kitchen-vocabulary-comprehensible-input.json
  - src/modules/playlists/data/videos/a1/ch5-practice-slow-english-podcast-talking-about-weather.json
  - src/modules/playlists/data/videos/a1/ch7-slow-english-podcast-for-beginners-talking-about-goals.json
  - scripts/publishPages.mjs
  - src/modules/playlists/data/b2.ts
  - scripts/misshoney/import-playlists.mjs
  - src/modules/playlists/data/videos/b2/ch16-learn-english-with-my-morning-routine-natural-speaking-practice.json
  - src/modules/playlists/data/videos/a1/ch6-slow-english-podcast-for-beginners-talking-about-friends.json
  - src/modules/playlists/data/videos/a2/ch24-sleep-and-learn-english-shadow-positive-affirmations.json
  - src/modules/playlists/data/videos/b1/ch5-job-interview-essentials-slow-english-podcast-for-intermediate-b1.json
  - src/modules/playlists/data/videos/a1/ch3-slow-english-listening-for-beginners-talking-about-languages.json
  - src/modules/playlists/data/videos/b2/ch8-slow-english-podcast-why-am-i-learning-chinese-b2.json
  - src/modules/playlists/components/PlaylistSentenceBreakdown.vue
  - src/modules/playlists/data/videos/b2/ch2-slow-english-for-intermediate-b2-with-subtitles-in-spanish-talking-about-languages.json
  - src/modules/playlists/data/videos/a2/ch6-essential-airport-vocabulary-slow-english-podcast-for-a2-beginners.json
  - src/modules/playlists/data/videos/a1/ch4-practice-slow-english-for-a1-beginners-talk-about-family.json
  - src/modules/playlists/data/videos/a1/ch8-slow-english-podcast-chat-with-me-about-foods.json
  - src/modules/playlists/data/videos/b1/ch17-slow-english-practice-airport-essentials-for-traveling.json
  - src/modules/playlists/data/a1.ts
  - src/modules/playlists/data/videos/a1/ch12-a-day-in-my-life-slow-english-podcast-a1-present-simple.json
  - src/modules/playlists/data/videos/a2/ch8-a1-beginner-slow-english-podcast-sleep-rest-vocabulary.json
  - src/modules/playlists/data/videos/b1/ch9-speak-like-a-native-common-english-idioms-slow-english-podcast-for-a2-b1-beginners.json
  - src/modules/playlists/data/videos/b2/ch15-learn-english-by-making-mistakes-slow-english-podcast.json
  - src/modules/playlists/data/videos/b2/ch17-how-she-became-fluent-in-english-intermediate-listening-practice.json
  - src/modules/playlists/data/videos/a2/ch12-grocery-store-essentials-for-a1-a2-beginners.json
  - src/modules/playlists/data/videos/a1/ch13-slow-english-podcast-the-giving-tree-for-beginners-a1a2.json
  - scripts/misshoney/content-core.d.mts
  - src/modules/playlists/data/videos/a2/ch13-my-weird-trip-in-puerto-escondido-storytime-slow-english-for-intermediate-listeners.json
  - src/modules/playlists/data/videos/a2/ch29-what-you-taught-me-about-hope-slow-english-listening.json
  - src/modules/playlists/data/videos/b1/ch10-learn-english-with-slow-interviews-comprehensible-input-b1-interview-practice.json
  - src/modules/playlists/data/videos/a2/ch15-daily-english-affirmations-for-speaking-confidence-fluency-i-am-a-fluent-english-speaker.json
  - scripts/misshoney/import-core.d.mts
  - scripts/misshoney/import-core.mjs
  - src/modules/playlists/data/videos/a2/ch26-100-essential-english-words-for-daily-life-slow-english-vocabulary.json
  - src/modules/playlists/data/videos/b1/ch1-slow-english-listening-intermediate-practice-talking-about-my-hobbies.json
  - src/modules/playlists/data/videos/a2/ch22-learn-english-at-home-slow-english.json
  - src/modules/playlists/data/videos/b2/ch9-intermediate-slow-english-podcast-my-trip-to-the-elephant-sanctuarycomprehensible-input.json
  - src/modules/playlists/data/videos/b2/ch12-slow-english-podcast-advanced-listening-practice-natural-conversation-comprehensible-input.json
  - src/modules/playlists/data/videos/a1/ch18-english-listening-practice-for-beginners-my-weekend-a1-a2.json
  - src/modules/playlists/data/videos/a2/ch28-learn-in-on-at-naturally-english-listening-practice.json
  - src/modules/playlists/data/videos/a1/ch10-learn-english-with-slow-interviews-comprehensible-input-a1-sleep-routines.json
  - src/modules/playlists/data/videos/a1/ch15-absolute-beginner-slow-english-what-is-my-favorite-holiday.json
  - src/modules/playlists/components/PlaylistSceneBlock.vue
  - src/modules/playlists/data/videos/a2/ch17-asmr-learn-english-while-sleeping-with-relaxing-sounds-slow-english-podcast.json
  - src/modules/playlists/components/PlaylistWordTag.vue
  - src/modules/playlists/data/videos/a2/ch23-how-to-actually-learn-english-10-tips-that-really-work.json
tests:
  - tests/e2e/misshoney-polished.smoke.spec.ts
  - src/__tests__/publishPages.test.ts
  - src/__tests__/PlaylistView.test.ts
  - src/__tests__/PlaylistVideoView.test.ts
  - src/__tests__/HomeView.test.ts
  - src/__tests__/contentCore.test.ts
  - src/__tests__/importerCore.test.ts
-->

---
### Requirement: Playlist reading sections are data-driven

MissHoney video pages SHALL render only sections whose backing arrays are non-empty. Visible section numbers SHALL start at 1 and increment according to the rendered section order.

#### Scenario: Empty section is hidden from content and quick nav

- **WHEN** a ready video has non-empty scenes and phrases but empty vocabGroups and breakdowns
- **THEN** the page displays only the bilingual text and phrases sections
- **AND** quick navigation displays only those two sections
- **AND** the visible section numbers are 1 and 2

##### Example: Dynamic section numbering

| scenes | vocabGroups | phrases | breakdowns | Expected quick nav |
| ------ | ----------- | ------- | ---------- | ------------------ |
| 2      | 1           | 1       | 1          | 全文, 單字, 片語, 句型 |
| 2      | 0           | 1       | 0          | 全文, 片語 |
| 0      | 1           | 0       | 1          | 單字, 句型 |


<!-- @trace
source: polish-misshoney-ui-and-content
updated: 2026-05-23
code:
  - src/modules/playlists/data/videos/b2/ch4-slow-english-for-c1-advanced-dreams.json
  - src/modules/playlists/types.ts
  - src/modules/playlists/data/videos/a2/ch27-pronunciation-practice-50-english-words-to-sound-natural.json
  - src/modules/playlists/components/PlaylistReadingHeader.vue
  - src/modules/playlists/data/videos/a2/ch11-the-scariest-beach-day-slow-english-podcast-for-a1-a2-beginners-comprehensible-input.json
  - src/modules/playlists/data/videos/a2/ch3-slow-english-podcast-bus-stories-for-beginners.json
  - src/modules/playlists/data/videos/a2/ch5-84-english-phrases-for-beginners-speak-like-a-native.json
  - src/modules/playlists/data/videos/a2/ch18-slow-english-podcast-a-day-in-my-life-a2-english-listening-practice.json
  - src/modules/playlists/data/videos/b1/ch21-slow-english-listening-practice-makeup-routine.json
  - src/modules/playlists/data/videos/b1/ch8-learn-slow-english-asmr-intermediate-b1-talking-about-sounds-and-noises-comprehensible-input.json
  - src/modules/playlists/data/videos/b2/ch6-slow-english-podcast-my-bus-stories.json
  - src/modules/playlists/data/videos/a1/ch14-how-to-introduce-yourself-in-english-for-beginners.json
  - src/modules/playlists/data/videos/a2/ch7-speak-like-a-native-common-abbreviations-slow-english-podcast-for-a2-beginners.json
  - src/modules/playlists/data/videos/b1/ch4-slow-english-podcast-for-a2-b1-intemediate-levels-planning-my-first-trip.json
  - src/modules/playlists/data/videos/b1/ch12-slow-english-podcast-my-trip-to-new-york-city-level-b1.json
  - src/modules/playlists/data/videos/b1/ch15-english-sleep-learning-shadowing-positive-affirmations.json
  - src/modules/playlists/components/PlaylistPhraseCard.vue
  - src/modules/playlists/data/videos/a1/ch11-slow-english-reading-rainbow-fish-for-beginners-a1a2.json
  - scripts/misshoney/author-polished-content.mjs
  - src/modules/playlists/data/videos/b1/ch3-slow-english-podcast-bus-stories-for-beginners.json
  - src/modules/playlists/data/videos/a2/ch10-powerful-daily-affirmations-learn-english-and-practice-gratitude-comprehensible-input.json
  - src/modules/playlists/data/videos/a2/ch14-learn-english-with-slow-conversations-comprehensible-input-a1-weekend-routines.json
  - src/modules/playlists/data/videos/a2/ch2-slow-english-for-a2-high-beginners-how-colors-make-me-feel.json
  - src/modules/playlists/data/videos/b1/ch13-slow-english-podcast-my-trip-to-puerto-escondido-level-a2.json
  - scripts/misshoney/content-core.mjs
  - src/modules/home/views/HomeView.vue
  - src/modules/playlists/data/videos/b2/ch1-slow-english-listening-for-upper-intermediate-talking-about-comfort-foods.json
  - src/modules/playlists/data/videos/b2/ch3-slow-english-for-intermediate-b2-with-subtitles-in-portuguese-talking-about-languages.json
  - src/modules/playlists/data/videos/a2/ch25-learn-english-travel-vlog-for-beginners.json
  - src/modules/playlists/data/videos/b1/ch2-slow-english-practice-for-b1-intermediate-talking-about-airports.json
  - src/modules/playlists/data/videos/a2/ch1-slow-english-stories-level-a2-listening-a-weird-phone-call.json
  - src/modules/home/components/ArticleListItem.vue
  - src/modules/playlists/data/videos/a2/ch19-english-sleep-learning-shadowing-positive-affirmations.json
  - src/modules/playlists/data/videos/a2/ch21-slow-english-reading-learn-english-with-childrens-books-comprehensible-input.json
  - src/modules/playlists/PlaylistView.vue
  - src/modules/playlists/data/videos/a2/ch4-slow-english-podcast-for-a2-b1-intemediate-levels-planning-my-first-trip.json
  - src/modules/playlists/data/videos/b2/ch5-interview-about-childhood-memories-faster-english-podcast-for-intermediate-listening-practice.json
  - PROJECT_ARCHITECTURE.md
  - src/modules/playlists/data/videos/a1/ch16-beginner-english-speaking-practice-real-life-role-play-a1.json
  - src/modules/playlists/PlaylistVideoView.vue
  - src/modules/playlists/composables/usePlaylistReadingSections.ts
  - src/modules/playlists/data/videos/a2/ch9-learn-english-with-slow-interviews-comprehensible-input-a1-sleep-routines.json
  - src/modules/playlists/data/videos/a1/ch1-slow-english-for-beginners-a1-listening-practice.json
  - src/modules/playlists/data/videos/a1/ch9-a1-beginner-slow-english-podcast-sleep-rest-vocabulary.json
  - package.json
  - src/modules/playlists/data/videos/b2/ch11-slow-english-podcast-my-stressful-trip-to-chinacomprehensible-input.json
  - src/modules/playlists/data/videos/b2/ch13-travel-with-english-slow-english-podcast.json
  - scripts/misshoney/sources.json
  - src/modules/playlists/data/videos/b2/ch7-learn-english-with-slow-interviews-comprehensible-input-b1-interview-practice.json
  - src/modules/playlists/data/videos/b2/ch14-learn-english-in-nyc-slow-english-vlog.json
  - src/modules/playlists/data/videos/b1/ch20-100-essential-english-words-for-daily-life-slow-english-vocabulary.json
  - scripts/misshoney/promote-content.mjs
  - src/modules/playlists/data/videos/a2/ch20-intermediate-slow-english-podcast-my-trip-to-the-elephant-sanctuarycomprehensible-input.json
  - src/modules/playlists/data/videos/b1/ch16-slow-english-podcast-my-trip-to-mexico-city.json
  - src/modules/playlists/data/videos/a1/ch17-slow-english-conversations-a1-comprehensible-input.json
  - src/modules/playlists/data/videos/b1/ch19-how-to-speak-english-real-life-role-play-b1b2.json
  - src/modules/playlists/data/videos/b1/ch11-slow-english-podcast-for-high-beginners-a2-b1-my-trip-to-the-usa-comprehensible-input.json
  - src/modules/playlists/data/videos/b1/ch6-my-trip-to-brazil-slow-english-podcast-for-high-beginners-a2-b1-comprehensible-input.json
  - src/modules/playlists/data/a2.ts
  - src/modules/playlists/data/videos/b2/ch10-real-english-to-speak-when-you-travel-advanced-slow-english-podcast.json
  - src/modules/playlists/data/videos/b1/ch7-interview-about-childhood-memories-faster-english-podcast-for-intermediate-listening-practice.json
  - src/modules/playlists/data/videos/a2/ch16-slow-english-podcast-my-day-a2-listening-practice.json
  - src/modules/playlists/data/b1.ts
  - src/modules/playlists/data/videos/a1/ch2-beginner-english-slow-listening-practice-talking-about-me.json
  - src/modules/playlists/data/videos/b1/ch14-real-english-conversation-life-in-the-usa-vs-life-in-mexico-b1.json
  - src/modules/playlists/data/videos/b1/ch18-english-kitchen-vocabulary-comprehensible-input.json
  - src/modules/playlists/data/videos/a1/ch5-practice-slow-english-podcast-talking-about-weather.json
  - src/modules/playlists/data/videos/a1/ch7-slow-english-podcast-for-beginners-talking-about-goals.json
  - scripts/publishPages.mjs
  - src/modules/playlists/data/b2.ts
  - scripts/misshoney/import-playlists.mjs
  - src/modules/playlists/data/videos/b2/ch16-learn-english-with-my-morning-routine-natural-speaking-practice.json
  - src/modules/playlists/data/videos/a1/ch6-slow-english-podcast-for-beginners-talking-about-friends.json
  - src/modules/playlists/data/videos/a2/ch24-sleep-and-learn-english-shadow-positive-affirmations.json
  - src/modules/playlists/data/videos/b1/ch5-job-interview-essentials-slow-english-podcast-for-intermediate-b1.json
  - src/modules/playlists/data/videos/a1/ch3-slow-english-listening-for-beginners-talking-about-languages.json
  - src/modules/playlists/data/videos/b2/ch8-slow-english-podcast-why-am-i-learning-chinese-b2.json
  - src/modules/playlists/components/PlaylistSentenceBreakdown.vue
  - src/modules/playlists/data/videos/b2/ch2-slow-english-for-intermediate-b2-with-subtitles-in-spanish-talking-about-languages.json
  - src/modules/playlists/data/videos/a2/ch6-essential-airport-vocabulary-slow-english-podcast-for-a2-beginners.json
  - src/modules/playlists/data/videos/a1/ch4-practice-slow-english-for-a1-beginners-talk-about-family.json
  - src/modules/playlists/data/videos/a1/ch8-slow-english-podcast-chat-with-me-about-foods.json
  - src/modules/playlists/data/videos/b1/ch17-slow-english-practice-airport-essentials-for-traveling.json
  - src/modules/playlists/data/a1.ts
  - src/modules/playlists/data/videos/a1/ch12-a-day-in-my-life-slow-english-podcast-a1-present-simple.json
  - src/modules/playlists/data/videos/a2/ch8-a1-beginner-slow-english-podcast-sleep-rest-vocabulary.json
  - src/modules/playlists/data/videos/b1/ch9-speak-like-a-native-common-english-idioms-slow-english-podcast-for-a2-b1-beginners.json
  - src/modules/playlists/data/videos/b2/ch15-learn-english-by-making-mistakes-slow-english-podcast.json
  - src/modules/playlists/data/videos/b2/ch17-how-she-became-fluent-in-english-intermediate-listening-practice.json
  - src/modules/playlists/data/videos/a2/ch12-grocery-store-essentials-for-a1-a2-beginners.json
  - src/modules/playlists/data/videos/a1/ch13-slow-english-podcast-the-giving-tree-for-beginners-a1a2.json
  - scripts/misshoney/content-core.d.mts
  - src/modules/playlists/data/videos/a2/ch13-my-weird-trip-in-puerto-escondido-storytime-slow-english-for-intermediate-listeners.json
  - src/modules/playlists/data/videos/a2/ch29-what-you-taught-me-about-hope-slow-english-listening.json
  - src/modules/playlists/data/videos/b1/ch10-learn-english-with-slow-interviews-comprehensible-input-b1-interview-practice.json
  - src/modules/playlists/data/videos/a2/ch15-daily-english-affirmations-for-speaking-confidence-fluency-i-am-a-fluent-english-speaker.json
  - scripts/misshoney/import-core.d.mts
  - scripts/misshoney/import-core.mjs
  - src/modules/playlists/data/videos/a2/ch26-100-essential-english-words-for-daily-life-slow-english-vocabulary.json
  - src/modules/playlists/data/videos/b1/ch1-slow-english-listening-intermediate-practice-talking-about-my-hobbies.json
  - src/modules/playlists/data/videos/a2/ch22-learn-english-at-home-slow-english.json
  - src/modules/playlists/data/videos/b2/ch9-intermediate-slow-english-podcast-my-trip-to-the-elephant-sanctuarycomprehensible-input.json
  - src/modules/playlists/data/videos/b2/ch12-slow-english-podcast-advanced-listening-practice-natural-conversation-comprehensible-input.json
  - src/modules/playlists/data/videos/a1/ch18-english-listening-practice-for-beginners-my-weekend-a1-a2.json
  - src/modules/playlists/data/videos/a2/ch28-learn-in-on-at-naturally-english-listening-practice.json
  - src/modules/playlists/data/videos/a1/ch10-learn-english-with-slow-interviews-comprehensible-input-a1-sleep-routines.json
  - src/modules/playlists/data/videos/a1/ch15-absolute-beginner-slow-english-what-is-my-favorite-holiday.json
  - src/modules/playlists/components/PlaylistSceneBlock.vue
  - src/modules/playlists/data/videos/a2/ch17-asmr-learn-english-while-sleeping-with-relaxing-sounds-slow-english-podcast.json
  - src/modules/playlists/components/PlaylistWordTag.vue
  - src/modules/playlists/data/videos/a2/ch23-how-to-actually-learn-english-10-tips-that-really-work.json
tests:
  - tests/e2e/misshoney-polished.smoke.spec.ts
  - src/__tests__/publishPages.test.ts
  - src/__tests__/PlaylistView.test.ts
  - src/__tests__/PlaylistVideoView.test.ts
  - src/__tests__/HomeView.test.ts
  - src/__tests__/contentCore.test.ts
  - src/__tests__/importerCore.test.ts
-->

---
### Requirement: Playlist pages handle unavailable content without console errors

MissHoney playlist and video pages SHALL render safe fallback states for loading, unknown slugs, pending transcripts, malformed optional fields, and localStorage read failures.

#### Scenario: Unknown video slug shows not-found state

- **WHEN** the user visits `/a1/unknown-slug`
- **THEN** the page displays the not-found message
- **AND** no uncaught error is emitted during render

#### Scenario: Pending transcript shows in-progress state

- **WHEN** the user visits a video entry whose status is `pendingTranscript`
- **THEN** the page displays the content-in-progress message
- **AND** the page does not attempt to render learning sections

<!-- @trace
source: polish-misshoney-ui-and-content
updated: 2026-05-23
code:
  - src/modules/playlists/data/videos/b2/ch4-slow-english-for-c1-advanced-dreams.json
  - src/modules/playlists/types.ts
  - src/modules/playlists/data/videos/a2/ch27-pronunciation-practice-50-english-words-to-sound-natural.json
  - src/modules/playlists/components/PlaylistReadingHeader.vue
  - src/modules/playlists/data/videos/a2/ch11-the-scariest-beach-day-slow-english-podcast-for-a1-a2-beginners-comprehensible-input.json
  - src/modules/playlists/data/videos/a2/ch3-slow-english-podcast-bus-stories-for-beginners.json
  - src/modules/playlists/data/videos/a2/ch5-84-english-phrases-for-beginners-speak-like-a-native.json
  - src/modules/playlists/data/videos/a2/ch18-slow-english-podcast-a-day-in-my-life-a2-english-listening-practice.json
  - src/modules/playlists/data/videos/b1/ch21-slow-english-listening-practice-makeup-routine.json
  - src/modules/playlists/data/videos/b1/ch8-learn-slow-english-asmr-intermediate-b1-talking-about-sounds-and-noises-comprehensible-input.json
  - src/modules/playlists/data/videos/b2/ch6-slow-english-podcast-my-bus-stories.json
  - src/modules/playlists/data/videos/a1/ch14-how-to-introduce-yourself-in-english-for-beginners.json
  - src/modules/playlists/data/videos/a2/ch7-speak-like-a-native-common-abbreviations-slow-english-podcast-for-a2-beginners.json
  - src/modules/playlists/data/videos/b1/ch4-slow-english-podcast-for-a2-b1-intemediate-levels-planning-my-first-trip.json
  - src/modules/playlists/data/videos/b1/ch12-slow-english-podcast-my-trip-to-new-york-city-level-b1.json
  - src/modules/playlists/data/videos/b1/ch15-english-sleep-learning-shadowing-positive-affirmations.json
  - src/modules/playlists/components/PlaylistPhraseCard.vue
  - src/modules/playlists/data/videos/a1/ch11-slow-english-reading-rainbow-fish-for-beginners-a1a2.json
  - scripts/misshoney/author-polished-content.mjs
  - src/modules/playlists/data/videos/b1/ch3-slow-english-podcast-bus-stories-for-beginners.json
  - src/modules/playlists/data/videos/a2/ch10-powerful-daily-affirmations-learn-english-and-practice-gratitude-comprehensible-input.json
  - src/modules/playlists/data/videos/a2/ch14-learn-english-with-slow-conversations-comprehensible-input-a1-weekend-routines.json
  - src/modules/playlists/data/videos/a2/ch2-slow-english-for-a2-high-beginners-how-colors-make-me-feel.json
  - src/modules/playlists/data/videos/b1/ch13-slow-english-podcast-my-trip-to-puerto-escondido-level-a2.json
  - scripts/misshoney/content-core.mjs
  - src/modules/home/views/HomeView.vue
  - src/modules/playlists/data/videos/b2/ch1-slow-english-listening-for-upper-intermediate-talking-about-comfort-foods.json
  - src/modules/playlists/data/videos/b2/ch3-slow-english-for-intermediate-b2-with-subtitles-in-portuguese-talking-about-languages.json
  - src/modules/playlists/data/videos/a2/ch25-learn-english-travel-vlog-for-beginners.json
  - src/modules/playlists/data/videos/b1/ch2-slow-english-practice-for-b1-intermediate-talking-about-airports.json
  - src/modules/playlists/data/videos/a2/ch1-slow-english-stories-level-a2-listening-a-weird-phone-call.json
  - src/modules/home/components/ArticleListItem.vue
  - src/modules/playlists/data/videos/a2/ch19-english-sleep-learning-shadowing-positive-affirmations.json
  - src/modules/playlists/data/videos/a2/ch21-slow-english-reading-learn-english-with-childrens-books-comprehensible-input.json
  - src/modules/playlists/PlaylistView.vue
  - src/modules/playlists/data/videos/a2/ch4-slow-english-podcast-for-a2-b1-intemediate-levels-planning-my-first-trip.json
  - src/modules/playlists/data/videos/b2/ch5-interview-about-childhood-memories-faster-english-podcast-for-intermediate-listening-practice.json
  - PROJECT_ARCHITECTURE.md
  - src/modules/playlists/data/videos/a1/ch16-beginner-english-speaking-practice-real-life-role-play-a1.json
  - src/modules/playlists/PlaylistVideoView.vue
  - src/modules/playlists/composables/usePlaylistReadingSections.ts
  - src/modules/playlists/data/videos/a2/ch9-learn-english-with-slow-interviews-comprehensible-input-a1-sleep-routines.json
  - src/modules/playlists/data/videos/a1/ch1-slow-english-for-beginners-a1-listening-practice.json
  - src/modules/playlists/data/videos/a1/ch9-a1-beginner-slow-english-podcast-sleep-rest-vocabulary.json
  - package.json
  - src/modules/playlists/data/videos/b2/ch11-slow-english-podcast-my-stressful-trip-to-chinacomprehensible-input.json
  - src/modules/playlists/data/videos/b2/ch13-travel-with-english-slow-english-podcast.json
  - scripts/misshoney/sources.json
  - src/modules/playlists/data/videos/b2/ch7-learn-english-with-slow-interviews-comprehensible-input-b1-interview-practice.json
  - src/modules/playlists/data/videos/b2/ch14-learn-english-in-nyc-slow-english-vlog.json
  - src/modules/playlists/data/videos/b1/ch20-100-essential-english-words-for-daily-life-slow-english-vocabulary.json
  - scripts/misshoney/promote-content.mjs
  - src/modules/playlists/data/videos/a2/ch20-intermediate-slow-english-podcast-my-trip-to-the-elephant-sanctuarycomprehensible-input.json
  - src/modules/playlists/data/videos/b1/ch16-slow-english-podcast-my-trip-to-mexico-city.json
  - src/modules/playlists/data/videos/a1/ch17-slow-english-conversations-a1-comprehensible-input.json
  - src/modules/playlists/data/videos/b1/ch19-how-to-speak-english-real-life-role-play-b1b2.json
  - src/modules/playlists/data/videos/b1/ch11-slow-english-podcast-for-high-beginners-a2-b1-my-trip-to-the-usa-comprehensible-input.json
  - src/modules/playlists/data/videos/b1/ch6-my-trip-to-brazil-slow-english-podcast-for-high-beginners-a2-b1-comprehensible-input.json
  - src/modules/playlists/data/a2.ts
  - src/modules/playlists/data/videos/b2/ch10-real-english-to-speak-when-you-travel-advanced-slow-english-podcast.json
  - src/modules/playlists/data/videos/b1/ch7-interview-about-childhood-memories-faster-english-podcast-for-intermediate-listening-practice.json
  - src/modules/playlists/data/videos/a2/ch16-slow-english-podcast-my-day-a2-listening-practice.json
  - src/modules/playlists/data/b1.ts
  - src/modules/playlists/data/videos/a1/ch2-beginner-english-slow-listening-practice-talking-about-me.json
  - src/modules/playlists/data/videos/b1/ch14-real-english-conversation-life-in-the-usa-vs-life-in-mexico-b1.json
  - src/modules/playlists/data/videos/b1/ch18-english-kitchen-vocabulary-comprehensible-input.json
  - src/modules/playlists/data/videos/a1/ch5-practice-slow-english-podcast-talking-about-weather.json
  - src/modules/playlists/data/videos/a1/ch7-slow-english-podcast-for-beginners-talking-about-goals.json
  - scripts/publishPages.mjs
  - src/modules/playlists/data/b2.ts
  - scripts/misshoney/import-playlists.mjs
  - src/modules/playlists/data/videos/b2/ch16-learn-english-with-my-morning-routine-natural-speaking-practice.json
  - src/modules/playlists/data/videos/a1/ch6-slow-english-podcast-for-beginners-talking-about-friends.json
  - src/modules/playlists/data/videos/a2/ch24-sleep-and-learn-english-shadow-positive-affirmations.json
  - src/modules/playlists/data/videos/b1/ch5-job-interview-essentials-slow-english-podcast-for-intermediate-b1.json
  - src/modules/playlists/data/videos/a1/ch3-slow-english-listening-for-beginners-talking-about-languages.json
  - src/modules/playlists/data/videos/b2/ch8-slow-english-podcast-why-am-i-learning-chinese-b2.json
  - src/modules/playlists/components/PlaylistSentenceBreakdown.vue
  - src/modules/playlists/data/videos/b2/ch2-slow-english-for-intermediate-b2-with-subtitles-in-spanish-talking-about-languages.json
  - src/modules/playlists/data/videos/a2/ch6-essential-airport-vocabulary-slow-english-podcast-for-a2-beginners.json
  - src/modules/playlists/data/videos/a1/ch4-practice-slow-english-for-a1-beginners-talk-about-family.json
  - src/modules/playlists/data/videos/a1/ch8-slow-english-podcast-chat-with-me-about-foods.json
  - src/modules/playlists/data/videos/b1/ch17-slow-english-practice-airport-essentials-for-traveling.json
  - src/modules/playlists/data/a1.ts
  - src/modules/playlists/data/videos/a1/ch12-a-day-in-my-life-slow-english-podcast-a1-present-simple.json
  - src/modules/playlists/data/videos/a2/ch8-a1-beginner-slow-english-podcast-sleep-rest-vocabulary.json
  - src/modules/playlists/data/videos/b1/ch9-speak-like-a-native-common-english-idioms-slow-english-podcast-for-a2-b1-beginners.json
  - src/modules/playlists/data/videos/b2/ch15-learn-english-by-making-mistakes-slow-english-podcast.json
  - src/modules/playlists/data/videos/b2/ch17-how-she-became-fluent-in-english-intermediate-listening-practice.json
  - src/modules/playlists/data/videos/a2/ch12-grocery-store-essentials-for-a1-a2-beginners.json
  - src/modules/playlists/data/videos/a1/ch13-slow-english-podcast-the-giving-tree-for-beginners-a1a2.json
  - scripts/misshoney/content-core.d.mts
  - src/modules/playlists/data/videos/a2/ch13-my-weird-trip-in-puerto-escondido-storytime-slow-english-for-intermediate-listeners.json
  - src/modules/playlists/data/videos/a2/ch29-what-you-taught-me-about-hope-slow-english-listening.json
  - src/modules/playlists/data/videos/b1/ch10-learn-english-with-slow-interviews-comprehensible-input-b1-interview-practice.json
  - src/modules/playlists/data/videos/a2/ch15-daily-english-affirmations-for-speaking-confidence-fluency-i-am-a-fluent-english-speaker.json
  - scripts/misshoney/import-core.d.mts
  - scripts/misshoney/import-core.mjs
  - src/modules/playlists/data/videos/a2/ch26-100-essential-english-words-for-daily-life-slow-english-vocabulary.json
  - src/modules/playlists/data/videos/b1/ch1-slow-english-listening-intermediate-practice-talking-about-my-hobbies.json
  - src/modules/playlists/data/videos/a2/ch22-learn-english-at-home-slow-english.json
  - src/modules/playlists/data/videos/b2/ch9-intermediate-slow-english-podcast-my-trip-to-the-elephant-sanctuarycomprehensible-input.json
  - src/modules/playlists/data/videos/b2/ch12-slow-english-podcast-advanced-listening-practice-natural-conversation-comprehensible-input.json
  - src/modules/playlists/data/videos/a1/ch18-english-listening-practice-for-beginners-my-weekend-a1-a2.json
  - src/modules/playlists/data/videos/a2/ch28-learn-in-on-at-naturally-english-listening-practice.json
  - src/modules/playlists/data/videos/a1/ch10-learn-english-with-slow-interviews-comprehensible-input-a1-sleep-routines.json
  - src/modules/playlists/data/videos/a1/ch15-absolute-beginner-slow-english-what-is-my-favorite-holiday.json
  - src/modules/playlists/components/PlaylistSceneBlock.vue
  - src/modules/playlists/data/videos/a2/ch17-asmr-learn-english-while-sleeping-with-relaxing-sounds-slow-english-podcast.json
  - src/modules/playlists/components/PlaylistWordTag.vue
  - src/modules/playlists/data/videos/a2/ch23-how-to-actually-learn-english-10-tips-that-really-work.json
tests:
  - tests/e2e/misshoney-polished.smoke.spec.ts
  - src/__tests__/publishPages.test.ts
  - src/__tests__/PlaylistView.test.ts
  - src/__tests__/PlaylistVideoView.test.ts
  - src/__tests__/HomeView.test.ts
  - src/__tests__/contentCore.test.ts
  - src/__tests__/importerCore.test.ts
-->