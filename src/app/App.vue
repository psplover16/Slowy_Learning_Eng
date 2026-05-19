<template>
  <div class="min-h-screen bg-paper text-ink">
    <NavBar />
    <RouterView />
    <UpdateToast />
  </div>
</template>

<script setup lang="ts">
import NavBar from '../shared/components/NavBar.vue'
import UpdateToast from '../shared/components/UpdateToast.vue'
</script>
