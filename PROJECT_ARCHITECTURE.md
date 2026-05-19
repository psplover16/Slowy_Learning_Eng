# Project Architecture

## Directory Structure

```
src/
  app/
    main.ts            — App entry point (createApp, mount)
    App.vue            — Root shell (NavBar + RouterView)
    router/
      index.ts         — Vue Router (/, /grammar, /ch1)
  modules/
    home/
      views/
        HomeView.vue   — Article list with completion marks
      components/
        ArticleListItem.vue — Single article row
      composables/
        useCompletion.ts    — localStorage completion toggle
    grammar/
      views/
        GrammarView.vue     — Grammar reference page
      components/
        GrammarCard.vue     — Single grammar container
    ch1/
      views/
        Ch1View.vue         — Ch1 full content page
      components/
        SceneBlock.vue      — Scene container (title + content)
        WordTag.vue         — Vocab item (KK / POS / meaning)
        PhraseCard.vue      — Phrase explanation card
        SentenceBreakdown.vue — Sentence analysis card
  shared/
    components/
      NavBar.vue             — Sticky top navigation
      Mp3Player.vue          — Conditional audio player
      BackToWordFab.vue      — Return-to-word floating button
      UpdateToast.vue        — SW update notification
    composables/
      useReadingBookmark.ts  — Paragraph bookmark (localStorage)
      useUnderlinkBacklink.ts — Underlined word ↔ FAB state
    config/
      storageKeys.ts         — Centralized localStorage key constants
```

## Design Principles

- **Feature-based modules**: each feature owns its views, components, and composables
- **Shared**: cross-feature components and composables only
- **App**: entry, router, root shell
- Component naming follows Vue3 `<script setup lang="ts">` style
