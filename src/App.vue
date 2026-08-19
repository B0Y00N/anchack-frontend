<script setup>
import TheHeader from './common/components/TheHeader.vue'
</script>

<template>
  <div
    class="min-h-screen bg-background"
    style="font-family: 'Noto Sans KR', sans-serif"
  >
    <TheHeader />

    <main class="relative">
      <router-view v-slot="{ Component }">
        <transition name="page-fade">
          <component :is="Component" />
        </transition>
      </router-view>
    </main>
  </div>
</template>

<style>
* {
  box-sizing: border-box;
}

body {
  margin: 0;
  font-family:
    'Pretendard',
    'Apple SD Gothic Neo',
    -apple-system,
    sans-serif;
  background: #f5f5f5;
}

.page-fade-enter-active,
.page-fade-leave-active {
  transition:
    opacity 0.22s ease,
    transform 0.22s ease;
}

.page-fade-enter-from {
  opacity: 0;
  transform: translateY(8px);
}

.page-fade-leave-to {
  opacity: 0;
  transform: translateY(-8px);
}

/* 나가는 페이지가 레이아웃을 밀지 않도록 문서 흐름에서 제거 */
.page-fade-leave-active {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
}
</style>
