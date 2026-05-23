## ADDED Requirements

### Requirement: Video content status display

Each playlist video has a status field that controls what is displayed on its sub-page.

#### Scenario: ready video shows learning content

- **WHEN** a user navigates to `/a1/ch1-what-is-your-name` and the video's status is `ready`
- **THEN** the page loads the JSON content via `contentLoader` and displays scenes, vocabGroups, and phrases

#### Scenario: pendingTranscript video shows placeholder

- **WHEN** a user navigates to `/a1/ch2-how-are-you` and the video's status is `pendingTranscript`
- **THEN** the page displays the message "內容整理中" and does not display any learning content sections

#### Scenario: non-existent slug shows error

- **WHEN** a user navigates to `/a1/ch99-unknown-slug` and no video with that slug exists in the a1 playlist
- **THEN** the page displays "找不到此影片"

### Requirement: JSON content structure

Video learning content files are pure data JSON, containing no HTML strings or function calls.

#### Scenario: scenes section contains sentence pairs

- **WHEN** `PlaylistVideoData.scenes` is rendered
- **THEN** each scene contains one or more `{ en, tc }` sentence pairs displayed as English and Traditional Chinese

#### Scenario: vocabGroup item highlight field drives word emphasis

- **WHEN** a `PlaylistVocabGroup` item has `highlight: true`
- **THEN** `PlaylistVideoView` renders that word with visual emphasis (e.g. bold or coloured text)

- **WHEN** a `PlaylistVocabGroup` item has `highlight: false` or the field is absent
- **THEN** the word is rendered in normal weight without emphasis

#### Scenario: phrases section contains example sentences

- **WHEN** `PlaylistVideoData.phrases` is rendered
- **THEN** each phrase displays the phrase text, its meaning, and its `examples` array of `{ en, tc }` pairs

### Requirement: Skipped videos are not routable

Videos with status `skipped` SHALL be excluded from the `videos` array. When source metadata is known, they SHALL be listed in `skippedVideos`. They SHALL NOT generate sub-page routes.

#### Scenario: skipped video is absent from list and routing

- **WHEN** the playlist data is loaded and rendered
- **THEN** no card or link to a skipped video appears; navigating to a URL that would correspond to a skipped video's title returns "找不到此影片"

### Requirement: Video slug format

Each video's slug encodes its display order (reverse index among non-skipped videos) followed by a kebab-case English title.

#### Scenario: slug is derived from displayOrder and English title

- **WHEN** a playlist's non-skipped videos are numbered in reverse originalIndex order (highest originalIndex = displayOrder 1)
- **THEN** each video's slug is `ch[displayOrder]-[english-title-in-kebab-case]`, where skipped videos do not consume a displayOrder number

##### Example: slug derivation

| originalIndex | skipped? | displayOrder | English title          | slug                       |
| ------------- | -------- | ------------ | ---------------------- | -------------------------- |
| 1             | no       | 3 (of 3)     | What is your name      | ch3-what-is-your-name      |
| 2             | yes      | —            | Member only            | (no slug, not in videos)   |
| 3             | no       | 2 (of 3)     | How are you            | ch2-how-are-you            |
| 4             | no       | 1 (of 3)     | Nice to meet you       | ch1-nice-to-meet-you       |
