<template>
  <div
    v-if="mp3Src"
    data-testid="mp3-player"
    class="sticky top-0 z-40 bg-paper-3 border-b border-line shadow-sm px-4 py-2"
  >
    <audio
      ref="audioRef"
      :src="mp3Src"
      loop
      class="hidden"
      @timeupdate="onTimeUpdate"
      @loadedmetadata="onLoadedMetadata"
    />

    <div class="max-w-3xl mx-auto space-y-2">
      <!-- Timeline -->
      <input
        type="range"
        class="w-full accent-terracotta"
        :max="duration || 100"
        :value="currentTime"
        @input="seek"
      />

      <div class="flex items-center gap-3">
        <!-- Play / Pause -->
        <button
          data-testid="btn-play"
          class="text-ink hover:text-terracotta transition-colors"
          :aria-label="playing ? '暫停' : '播放'"
          @click="togglePlay"
        >
          <span v-if="playing">⏸</span>
          <span v-else>▶</span>
        </button>

        <!-- +5s -->
        <button
          data-testid="btn-skip5"
          class="text-xs text-ink-soft hover:text-ink transition-colors"
          aria-label="快進 5 秒"
          @click="skip(5)"
        >+5s</button>

        <!-- +10s -->
        <button
          data-testid="btn-skip10"
          class="text-xs text-ink-soft hover:text-ink transition-colors"
          aria-label="快進 10 秒"
          @click="skip(10)"
        >+10s</button>

        <!-- Time display -->
        <span class="text-xs text-ink-faint ml-auto font-newsreader tabular-nums">
          {{ formatTime(currentTime) }} / {{ formatTime(duration) }}
        </span>

        <!-- Volume -->
        <input
          type="range"
          class="w-20 accent-terracotta"
          min="0"
          max="1"
          step="0.05"
          :value="volume"
          aria-label="音量"
          @input="setVolume"
        />

        <!-- Loop toggle -->
        <button
          :class="['text-xs transition-colors', loopOn ? 'text-terracotta' : 'text-ink-faint']"
          aria-label="循環播放"
          @click="toggleLoop"
        >🔁</button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'

const props = defineProps<{ mp3Src: string | null }>()

const audioRef = ref<HTMLAudioElement | null>(null)
const playing = ref(false)
const currentTime = ref(0)
const duration = ref(0)
const volume = ref(1)
const loopOn = ref(true)

watch(() => props.mp3Src, () => {
  playing.value = false
  currentTime.value = 0
})

function togglePlay() {
  const audio = audioRef.value
  if (!audio) return
  if (playing.value) {
    audio.pause()
  } else {
    audio.play()
  }
  playing.value = !playing.value
}

function skip(seconds: number) {
  const audio = audioRef.value
  if (!audio) return
  audio.currentTime = Math.min(audio.currentTime + seconds, audio.duration || 0)
}

function seek(e: Event) {
  const audio = audioRef.value
  if (!audio) return
  audio.currentTime = Number((e.target as HTMLInputElement).value)
}

function setVolume(e: Event) {
  const v = Number((e.target as HTMLInputElement).value)
  volume.value = v
  if (audioRef.value) audioRef.value.volume = v
}

function toggleLoop() {
  loopOn.value = !loopOn.value
  if (audioRef.value) audioRef.value.loop = loopOn.value
}

function onTimeUpdate() {
  if (audioRef.value) currentTime.value = audioRef.value.currentTime
}

function onLoadedMetadata() {
  if (audioRef.value) duration.value = audioRef.value.duration
}

function formatTime(s: number): string {
  const m = Math.floor(s / 60)
  const sec = Math.floor(s % 60)
  return `${m.toString().padStart(2, '0')}:${sec.toString().padStart(2, '0')}`
}
</script>
