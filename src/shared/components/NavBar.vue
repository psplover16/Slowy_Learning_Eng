<template>
  <nav class="sticky top-0 z-50 bg-paper-2 border-b border-line pt-safe-top">
    <div class="max-w-3xl mx-auto flex items-center gap-2 px-4 py-2">
      <RouterLink to="/" custom v-slot="{ navigate, href, isActive }">
        <a
          :href="href"
          data-testid="nav-home"
          @click="navigate"
          :class="[
            'px-4 py-1.5 rounded text-sm font-medium transition-colors',
            isActive ? 'bg-terracotta text-white' : 'bg-paper text-ink hover:bg-line',
          ]"
        >首頁</a>
      </RouterLink>

      <div ref="dropdownContainer" class="relative">
        <button
          data-testid="nav-content-trigger"
          type="button"
          aria-haspopup="menu"
          :aria-expanded="isOpen"
          @click="toggleOpen"
          :class="[
            'px-4 py-1.5 rounded text-sm font-medium transition-colors',
            isAnyChapterActive
              ? 'bg-terracotta text-white'
              : 'bg-paper text-ink hover:bg-line',
          ]"
        >內容 ▾</button>

        <Transition name="menu">
          <div
            v-if="isOpen"
            data-testid="nav-content-menu"
            role="menu"
            class="absolute top-full left-0 mt-1 w-max max-w-[calc(100vw-8rem)] max-h-[min(80vh,48rem)] overflow-y-auto bg-paper-3 border border-line rounded-lg shadow-lg py-1 z-50 overscroll-contain"
          >
            <button
              v-for="chapter in chapters"
              :key="chapter.id"
              type="button"
              role="menuitem"
              :data-testid="`nav-content-${chapter.id}`"
              @click="selectChapter(chapter)"
              class="block w-full text-left px-4 py-2 text-sm text-ink hover:bg-paper-2 transition-colors"
            >
              {{ chapter.titleZh }}
              <span class="text-ink-faint text-xs ml-2">({{ chapter.shortLabel }})</span>
            </button>
          </div>
        </Transition>
      </div>

      <div ref="missHoneyContainer" class="relative">
        <button
          data-testid="nav-misshoney-trigger"
          type="button"
          aria-haspopup="menu"
          :aria-expanded="isMissHoneyOpen"
          @click="toggleMissHoney"
          :class="[
            'px-4 py-1.5 rounded text-sm font-medium transition-colors',
            isAnyMissHoneyActive
              ? 'bg-terracotta text-white'
              : 'bg-paper text-ink hover:bg-line',
          ]"
        >MissHoney ▾</button>

        <Transition name="menu">
          <div
            v-if="isMissHoneyOpen"
            data-testid="nav-misshoney-menu"
            role="menu"
            class="absolute top-full left-0 mt-1 w-max max-w-[calc(100vw-11rem)] bg-paper-3 border border-line rounded-lg shadow-lg py-1 z-50"
          >
            <button
              v-for="pl in playlists"
              :key="pl.id"
              type="button"
              role="menuitem"
              :data-testid="`nav-misshoney-${pl.id}`"
              @click="selectPlaylist(pl)"
              class="block w-full text-left px-4 py-2 text-sm text-ink hover:bg-paper-2 transition-colors"
            >
              {{ pl.shortLabel }}
              <span class="text-ink-faint text-xs ml-2">{{ pl.titleZh }}</span>
            </button>
          </div>
        </Transition>
      </div>

      <RouterLink to="/grammar" custom v-slot="{ navigate, href, isActive }">
        <a
          :href="href"
          data-testid="nav-grammar"
          @click="navigate"
          :class="[
            'px-4 py-1.5 rounded text-sm font-medium transition-colors',
            isActive ? 'bg-terracotta text-white' : 'bg-paper text-ink hover:bg-line',
          ]"
        >文法</a>
      </RouterLink>
    </div>
  </nav>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { chapters, type ChapterEntry } from '../config/chapters'
import { playlists } from '../config/playlists'

const router = useRouter()
const route = useRoute()

const isOpen = ref(false)
const dropdownContainer = ref<HTMLElement | null>(null)
const isMissHoneyOpen = ref(false)
const missHoneyContainer = ref<HTMLElement | null>(null)

const isAnyChapterActive = computed(() =>
  chapters.some((c) => c.path === route.path),
)

const isAnyMissHoneyActive = computed(() =>
  playlists.some((p) => p.path === route.path || route.path.startsWith(p.path + '/')),
)

function toggleOpen() {
  isOpen.value = !isOpen.value
  if (isOpen.value) isMissHoneyOpen.value = false
}

function close() {
  isOpen.value = false
}

function toggleMissHoney() {
  isMissHoneyOpen.value = !isMissHoneyOpen.value
  if (isMissHoneyOpen.value) isOpen.value = false
}

function closeMissHoney() {
  isMissHoneyOpen.value = false
}

function selectChapter(chapter: ChapterEntry) {
  router.push(chapter.path)
  close()
}

function selectPlaylist(pl: typeof playlists[number]) {
  router.push(pl.path)
  closeMissHoney()
}

function onDocClick(event: MouseEvent) {
  const target = event.target as Node
  if (isOpen.value) {
    const container = dropdownContainer.value
    if (container && !container.contains(target)) close()
  }
  if (isMissHoneyOpen.value) {
    const mhContainer = missHoneyContainer.value
    if (mhContainer && !mhContainer.contains(target)) closeMissHoney()
  }
}

function onKeyDown(event: KeyboardEvent) {
  if (event.key === 'Escape') {
    close()
    closeMissHoney()
  }
}

onMounted(() => {
  document.addEventListener('click', onDocClick)
  document.addEventListener('keydown', onKeyDown)
})

onUnmounted(() => {
  document.removeEventListener('click', onDocClick)
  document.removeEventListener('keydown', onKeyDown)
})
</script>

<style scoped>
.menu-enter-active,
.menu-leave-active {
  transition: opacity 0.15s, transform 0.15s;
}
.menu-enter-from,
.menu-leave-to {
  opacity: 0;
  transform: translateY(-4px);
}
</style>
