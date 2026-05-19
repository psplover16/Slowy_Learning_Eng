<template>
  <nav
    class="sticky top-0 z-50 bg-paper-2 border-b border-line pt-safe-top"
  >
    <div class="max-w-3xl mx-auto flex items-center gap-2 px-4 py-2">
      <RouterLink
        to="/"
        custom
        v-slot="{ navigate, href, isActive }"
      >
        <a
          :href="href"
          data-testid="nav-home"
          @click="navigate"
          :class="[
            'px-4 py-1.5 rounded text-sm font-medium transition-colors',
            isActive
              ? 'bg-terracotta text-white'
              : 'bg-paper text-ink hover:bg-line',
          ]"
        >首頁</a>
      </RouterLink>

      <RouterLink
        to="/grammar"
        custom
        v-slot="{ navigate, href, isActive }"
      >
        <a
          :href="href"
          data-testid="nav-grammar"
          @click="navigate"
          :class="[
            'px-4 py-1.5 rounded text-sm font-medium transition-colors',
            isActive
              ? 'bg-terracotta text-white'
              : 'bg-paper text-ink hover:bg-line',
          ]"
        >文法</a>
      </RouterLink>
    </div>
  </nav>
</template>

<script setup lang="ts">
</script>
