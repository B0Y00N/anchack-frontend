<script setup>
import TheHeader from "./components/common/TheHeader.vue";
</script>

<template>
  <div class="min-h-screen bg-background" style="font-family: 'Noto Sans KR', sans-serif">
    <TheHeader />
    <router-view />
  </div>
</template>
