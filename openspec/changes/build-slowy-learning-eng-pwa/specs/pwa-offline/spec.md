## ADDED Requirements

### Requirement: The app is installable as a PWA on mobile devices

The app SHALL include a valid `public/manifest.json` with the required fields so that iOS Safari and Android Chrome prompt the user to add it to their home screen.

#### Scenario: Manifest minimum fields

- **WHEN** a browser fetches `/manifest.json`
- **THEN** the response includes: `name`, `short_name`, `start_url` (`"/"`), `display` (`"standalone"`), `background_color` (`"#F4ECDC"`), `theme_color` (`"#F4ECDC"`), and at least one icon entry

### Requirement: All static assets are cached on first visit

After the user's first visit to the app, all HTML, CSS, JavaScript, and font files SHALL be cached by the Service Worker so that subsequent visits work fully offline.

#### Scenario: Offline static asset access

- **GIVEN** the user has visited the app at least once with network access
- **WHEN** network access is disabled and the user navigates to `/`, `/grammar`, or `/ch1`
- **THEN** each route renders correctly with all styles and fonts

### Requirement: Service Worker uses Cache First for static assets

The Workbox configuration (via vite-plugin-pwa) SHALL apply a **Cache First** strategy to all files matching `**/*.{js,css,html,ico,png,svg,woff2}`.

#### Scenario: Subsequent visit loads from cache

- **GIVEN** the user has visited the app once with network access, caching all static assets
- **WHEN** the user opens the app with network access disabled
- **THEN** the App shell, CSS, and JavaScript all load from cache without any network request for static files

### Requirement: App operates in fully offline mode after first visit

The app SHALL use Workbox **precache** for ALL assets — including HTML, CSS, JS, fonts, images, icons, and MP3 files — so that after the first visit the app works completely without any network access. The `navigateFallback` SHALL be set to `/index.html` to ensure History mode routes resolve correctly offline.

**This is a critical acceptance item.** Offline mode MUST be verified in airplane mode across all three routes.

#### Scenario: Full offline operation in airplane mode

- **GIVEN** the user has visited the app at least once with network access
- **WHEN** network access is completely disabled (airplane mode) and the user reopens the app
- **THEN** all three routes (`/`, `/grammar`, `/ch1`) render correctly with all styles, fonts, and content — no network requests are made

#### Scenario: Offline MP3 playback

- **GIVEN** the user has visited the app at least once with network access (MP3 is precached)
- **WHEN** network access is disabled
- **THEN** the MP3 plays from the Service Worker precache without error

#### Scenario: History mode routes resolve offline

- **GIVEN** the Service Worker is active and the app is fully precached
- **WHEN** the user directly navigates to `/grammar` or `/ch1` with network disabled
- **THEN** the app shell loads correctly via the `navigateFallback: '/index.html'` rule


### Requirement: PWA icons are provided in required sizes

The app SHALL include placeholder PWA icon files so that Android and iOS can display the correct home screen icon.

#### Scenario: Icon files exist at required paths

- **WHEN** the app is built
- **THEN** the following files exist in `public/icons/`: `icon-192.png` (192×192 px), `icon-512.png` (512×512 px), and `apple-touch-icon.png` (180×180 px)
- **AND** `manifest.json` references all three icon entries
- **AND** `<link rel="apple-touch-icon">` in `index.html` references `apple-touch-icon.png`

### Requirement: Service Worker update is applied automatically within 3 seconds

When a new Service Worker version is detected, the app SHALL notify the user with a Toast and apply the update automatically within 3 seconds, regardless of user interaction.

#### Scenario: Toast appears and auto-updates when user does not tap

- **GIVEN** a new Service Worker version is waiting
- **WHEN** the app detects the waiting SW
- **THEN** a Toast with message "有新版本，點此立即更新" appears for approximately 3 seconds
- **AND** after the Toast closes (without user interaction), `skipWaiting` is called and the page reloads automatically

#### Scenario: Tapping Toast triggers immediate update

- **GIVEN** the update Toast is visible
- **WHEN** the user taps the Toast
- **THEN** `skipWaiting` is called immediately and the page reloads

### Requirement: Build output chunk size does not exceed 500 KB

Each JavaScript chunk produced by `npm run build` SHALL be under 500 KB. The Vite config SHALL set `build.chunkSizeWarningLimit` to 500.

#### Scenario: Build completes without chunk size warnings

- **WHEN** `npm run build` is executed
- **THEN** no chunk size warning is printed to stdout
