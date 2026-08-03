<script setup>
import TheHeader from "./components/common/TheHeader.vue";
</script>

<template>
  <div class="min-h-screen bg-background" style="font-family: 'Noto Sans KR', sans-serif">
    <TheHeader />
    <router-view />
  </div>
</template>

<style>
* {
  box-sizing: border-box;
}
body {
  margin: 0;
  font-family: 'Pretendard', 'Apple SD Gothic Neo', -apple-system, sans-serif;
  background: #f5f5f5;
}
</style>

