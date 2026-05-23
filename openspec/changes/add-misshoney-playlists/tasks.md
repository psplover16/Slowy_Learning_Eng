## 1. Foundation — Types, Storage Key

- [ ] [P] 1.1 Define all six playlist TypeScript interfaces in src/modules/playlists/types.ts: PlaylistData, PlaylistVideoEntry, SkippedVideoEntry, PlaylistVideoData, PlaylistScene, PlaylistVocabGroup, PlaylistPhrase — matching the exact shapes in the Implementation Contract. Verify: npm run build compiles types.ts without errors.
- [ ] [P] 1.2 Add MISS_HONEY_COMPLETION: 'slowy:miss-honey-completion' to the exported STORAGE_KEYS object in src/shared/config/storageKeys.ts. Satisfies: Storage key isolation. Verify: property present in STORAGE_KEYS; npm run build passes.

## 2. Completion Composable

- [ ] 2.1 Write failing unit tests for useMissHoneyCompletion (RED) covering: Video completion state toggle (toggleCompletion adds videoId as true to slowy:miss-honey-completion, second call sets false), Completion state persists across reloads (localStorage read), Graceful failure on localStorage error (corrupt JSON returns empty map without throwing). Verify: npm run test reports test failures for these cases.
- [ ] 2.2 Create src/modules/home/composables/useMissHoneyCompletion.ts. Implements: Video completion state toggle, Completion state persists across reloads, Storage key isolation, Graceful failure on localStorage error. Follows the same JSON-map pattern as useCompletion.ts, reading and writing STORAGE_KEYS.MISS_HONEY_COMPLETION. Exports: reactive completionMap (Record<string,boolean>), toggleCompletion(videoId: string). localStorage errors produce an empty map. Verify: all tests from task 2.1 pass.

## 3. Playlist Config and Metadata Files

- [ ] [P] 3.1 Create src/shared/config/playlists.ts exporting a playlists array with four entries ordered A1, A2, B1, B2. Satisfies: Difficulty display order is fixed from easy to hard. Each entry contains id, path, shortLabel (A1/A2/B1/B2), and titleZh. Verify: npm run build imports the file without errors.
- [ ] [P] 3.2 Create src/modules/playlists/data/a1.ts. Implements: Video slug format (ch[displayOrder]-[kebab-title], skipped videos do not occupy a displayOrder number), Skipped videos are not routable (skippedVideos array). Exports PlaylistData (level: a1) with at least 1 ready video (contentLoader pointing to a stub JSON), at least 1 pendingTranscript video (contentLoader: null), and at least 1 skippedVideo. Verify: TypeScript type-check passes.
- [ ] [P] 3.3 Create src/modules/playlists/data/a2.ts with same structure pattern (level: a2, video slug format, skipped videos). Verify: TypeScript type-check passes.
- [ ] [P] 3.4 Create src/modules/playlists/data/b1.ts with same structure pattern (level: b1, video slug format, skipped videos). Verify: TypeScript type-check passes.
- [ ] [P] 3.5 Create src/modules/playlists/data/b2.ts with same structure pattern (level: b2, video slug format, skipped videos). Verify: TypeScript type-check passes.
- [ ] 3.6 Create src/modules/playlists/data/videos/a1/<ready-slug>.json implementing JSON content structure: pure JSON PlaylistVideoData (videoId, slug, level, title, youtubeUrl, scenes with at least 1 sentence pair, vocabGroups with at least 1 item where highlight is true, phrases with at least 1 example). No HTML strings or function calls. Verify: Vite JSON import succeeds; npm run build passes.

## 4. PlaylistView — Playlist Entry Page

- [ ] 4.1 Write failing component tests for PlaylistView (RED) covering: Four CEFR-level playlist entry routes are accessible (PlaylistView renders for each level), Skipped videos are not routable (skipped absent from list), Video slug format (cards link to correct slug), Difficulty display order (cards sorted by displayOrder ascending). Verify: npm run test reports failures for PlaylistView.
- [ ] 4.2 Create src/modules/playlists/PlaylistView.vue. Implements: Four CEFR-level playlist entry routes are accessible, Skipped videos are not routable (only videos array rendered, not skippedVideos), Difficulty display order is fixed from easy to hard (card order follows displayOrder ascending). Accepts a level prop (a1/a2/b1/b2), lazy-loads the corresponding data module, renders video cards in ascending displayOrder, shows title and subtitle (if present), and a completion circle per card wired to useMissHoneyCompletion. Clicking a card navigates to /:level/:slug. Verify: all PlaylistView tests from 4.1 pass.

## 5. PlaylistVideoView — Video Sub-Page

- [ ] 5.1 Write failing component tests for PlaylistVideoView (RED) covering: Video content status display (ready shows content, pendingTranscript shows placeholder, unknown slug shows not-found), JSON content structure (scenes/vocabGroups/phrases rendered; highlight:true has distinct CSS class). Verify: npm run test reports failures for PlaylistVideoView.
- [ ] 5.2 Create src/modules/playlists/PlaylistVideoView.vue. Implements: Video content status display, JSON content structure, Skipped videos are not routable (no route for skipped). Accepts level and videoSlug props. Finds matching video by slug in the level data; calls contentLoader for ready status and renders scenes (en/tc rows), vocabGroups (items with highlight applied as a CSS class), phrases (phrase plus meaning plus example pairs); shows placeholder "内容整理中" when pendingTranscript; shows "找不到此影片" when slug not matched. Verify: all PlaylistVideoView tests from 5.1 pass.

## 6. Router — Register Playlist Routes

- [ ] 6.1 Add eight lazy-loaded routes to src/app/router/index.ts. Implements: Four CEFR-level playlist entry routes are accessible (/a1, /a2, /b1, /b2 to PlaylistView), Video sub-page routes are accessible for learnable videos (/a1/:videoSlug through /b2/:videoSlug to PlaylistVideoView). Each route passes level prop; video sub-page routes also pass videoSlug prop. Verify: npm run build succeeds; navigating to /a1 resolves PlaylistView.

## 7. NavBar — MissHoney Dropdown

- [ ] 7.1 Write failing tests for NavBar (RED) covering: NavBar contains MissHoney entry (button present between content dropdown and grammar link), MissHoney dropdown button in NavBar (active style on MissHoney routes), MissHoney dropdown menu contains A1–B2 items (menu opens with A1/A2/B1/B2 in order), Dropdown overflow prevention (max-w-[calc(100vw-11rem)]). Verify: npm run test reports failures.
- [ ] 7.2 Add MissHoney dropdown to src/shared/components/NavBar.vue. Implements: NavBar contains MissHoney entry, MissHoney dropdown button in NavBar (active style when route is /a1–/b2), MissHoney dropdown menu contains A1–B2 items (items in order: A1, A2, B1, B2, each navigating to /a1–/b2), Dropdown overflow prevention (absolute top-full left-0 w-max max-w-[calc(100vw-11rem)]). Positioned between the content dropdown and the grammar link. Closes on outside click or Escape using the same pattern as the existing content dropdown. Verify: all NavBar MissHoney tests from 7.1 pass.

## 8. ArticleListItem — showCompletion Prop

- [ ] 8.1 Write a failing test for ArticleListItem (RED) covering: ArticleListItem supports optional completion circle (showCompletion false hides circle, no prop shows circle). Verify: npm run test reports the new test as failing.
- [ ] 8.2 Add optional boolean prop showCompletion (default true) to src/modules/home/components/ArticleListItem.vue. Implements: ArticleListItem supports optional completion circle. Conditionally renders the completion circle element only when showCompletion is true. Verify: test from 8.1 passes; existing ch1–ch4 usage with no prop still shows circles.

## 9. HomeView — MissHoney Section

- [ ] 9.1 Write failing tests for HomeView (RED) covering: MissHoney section on homepage (section heading visible, four cards A1/A2/B1/B2 in order), MissHoney homepage cards do not show completion circles (showCompletion false), Existing article list is unaffected (ch1–ch4 above MissHoney section), Difficulty display order is fixed from easy to hard (A1, A2, B1, B2 order). Verify: npm run test reports failures.
- [ ] 9.2 Add a MissHoney section to src/modules/home/views/HomeView.vue below the existing article list. Implements: MissHoney section on homepage, MissHoney homepage cards do not show completion circles (showCompletion false), Existing article list is unaffected. Renders four ArticleListItem cards for A1/A2/B1/B2 in order with showCompletion set to false, each navigating to /a1 through /b2. Adds a visible section heading MissHoney. Verify: all HomeView MissHoney tests from 9.1 pass.

## 10. Build Verification

- [ ] 10.1 Run npm run build end-to-end and confirm exit code 0 with no TypeScript errors and no Vite missing-import warnings. Verify: build output succeeds cleanly.

## 11. Manual Verification

- [ ] 11.1 Navigate to /a1 — playlist cards appear in reverse-index order (displayOrder 1 first), skipped videos absent, each card has a completion circle.
- [ ] 11.2 Navigate to the ready video sub-page — scenes, vocabGroups (highlight items visually distinct), and phrases render without errors.
- [ ] 11.3 Navigate to the pendingTranscript video sub-page — placeholder message shown, no learning content sections.
- [ ] 11.4 Navigate to /a1/ch99-no-such-slug — not-found message shown.
- [ ] 11.5 Click a completion circle on /a1 — circle fills; reload page — circle remains filled (localStorage persisted).
- [ ] 11.6 Visit homepage — MissHoney section visible below ch1–ch4; clicking A2 navigates to /a2; A1–B2 cards have no circles; ch1–ch4 circles are intact.
- [ ] 11.7 Click MissHoney dropdown in NavBar — shows A1/A2/B1/B2 in that order; clicking B1 navigates to /b1; Escape closes without navigating.
