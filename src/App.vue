<script setup>
import { onMounted } from 'vue'
import TheHeader from './common/components/TheHeader.vue'
import { useAuthStore } from './user/stores/useAuthStore'

// accessToken은 localStorage에 남아있어도 useAuthStore().user는 메모리 상태라
// 새로고침/새 탭마다 비어있었다. 앱이 처음 뜰 때 한 번 복구해줘야
// "로그인이 계속 풀린다"는 문제(실제로는 토큰이 아니라 user 상태만 사라진 것)가 없다.
const authStore = useAuthStore()
onMounted(() => {
  authStore.loadUser().catch(() => {
    // 토큰이 없거나 만료된 정상적인 경우도 포함되므로 별도 처리 없이 로그아웃 상태로 둔다.
  })
})
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
