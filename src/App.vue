<script setup>
import { onMounted } from "vue";

import TheHeader from "./common/components/TheHeader.vue";
import { useAuthStore } from "@/user/stores/useAuthStore";

const authStore = useAuthStore();

// 새로고침 또는 앱 재접속 시 로그인 사용자 정보 복구
onMounted(async () => {
  const accessToken = localStorage.getItem("accessToken");

  if (!accessToken) {
    return;
  }

  try {
    await authStore.loadUser();
  } catch (error) {
    console.error(
      "로그인 사용자 정보를 불러오지 못했습니다.",
      error,
    );
  }
});
</script>

<template>
  <div
    class="min-h-screen bg-background"
    style="
      font-family: 'Noto Sans KR', sans-serif;
    "
  >
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
  font-family:
    "Pretendard",
    "Apple SD Gothic Neo",
    -apple-system,
    sans-serif;
  background: #f5f5f5;
}
</style>
