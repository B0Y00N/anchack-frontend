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
  <div class="min-h-screen bg-background" style="font-family: 'Noto Sans KR', sans-serif">
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
/* out-in을 쓰지 않고 겹쳐서 크로스페이드하되, 나가는 페이지는 문서
   흐름에서 빼서(absolute) 들어오는 페이지의 레이아웃을 밀지 않게 한다.
   -> out-in 방식의 "완료 신호를 기다리다 멈추는" 버그를 원천적으로
   피하면서도, 두 페이지가 겹치는 순간 레이아웃이 깨지지 않는다. */
.page-fade-leave-active {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
}
</style>
