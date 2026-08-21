<template>
  <div class="callback-wrap">
    <p v-if="isLoading">카카오 로그인 처리 중입니다...</p>

    <div v-else-if="errorMessage" class="error-box">
      <p>{{ errorMessage }}</p>

      <button type="button" @click="goLogin">로그인 화면으로 이동</button>
    </div>
  </div>
</template>

<script setup>
import { onMounted, ref } from "vue";
import { useRoute, useRouter } from "vue-router";
import { loginWithKakao } from "@/user/api/auth";
import { useAuthStore } from "@/user/stores/useAuthStore";

const route = useRoute();
const router = useRouter();
const authStore = useAuthStore();

const isLoading = ref(true);
const errorMessage = ref("");

function goLogin() {
  router.replace("/login");
}

function getLoginRedirect() {
  const redirect = sessionStorage.getItem("loginRedirect");
  sessionStorage.removeItem("loginRedirect");
  return redirect || "/";
}

onMounted(async () => {
  const code = route.query.code;
  const kakaoError = route.query.error;
  const kakaoErrorDescription = route.query.error_description;

  if (kakaoError) {
    errorMessage.value =
      typeof kakaoErrorDescription === "string"
        ? kakaoErrorDescription
        : "카카오 로그인이 취소되었습니다.";
    console.error("카카오 OAuth 실패:", kakaoError, errorMessage.value);
    isLoading.value = false;
    await router.replace("/login");
    return;
  }

  if (!code || typeof code !== "string") {
    errorMessage.value = "카카오 인가 코드가 없습니다.";
    console.error("카카오 로그인 실패:", errorMessage.value);
    isLoading.value = false;
    await router.replace("/login");
    return;
  }

  try {
    const response = await loginWithKakao(code);
    const { user, accessToken, tokenType = "Bearer" } = response.data;

    if (!accessToken) {
      throw new Error("서버 응답에 JWT가 없습니다.");
    }

    if (!user) {
      throw new Error("서버 응답에 사용자 정보가 없습니다.");
    }

    localStorage.setItem("accessToken", accessToken);
    localStorage.setItem("tokenType", tokenType);
    authStore.setUser(user);

    await router.replace(getLoginRedirect());
  } catch (error) {
    console.error("카카오 로그인 실패:", error);
    authStore.clearUser();

    if (!error.response) {
      errorMessage.value = error.message || "백엔드 서버에 연결할 수 없습니다.";
    } else if (error.response.status === 400) {
      errorMessage.value =
        error.response.data?.error?.message ||
        error.response.data?.message ||
        "카카오 인가 코드가 유효하지 않습니다.";
    } else if (error.response.status === 401) {
      errorMessage.value =
        error.response.data?.error?.message ||
        error.response.data?.message ||
        "카카오 인증에 실패했습니다.";
    } else if (error.response.status >= 500) {
      errorMessage.value =
        error.response.data?.error?.message ||
        error.response.data?.message ||
        "서버에서 로그인 처리 중 오류가 발생했습니다.";
    } else {
      errorMessage.value =
        error.response.data?.error?.message ||
        error.response.data?.message ||
        error.message ||
        "카카오 로그인 처리 중 오류가 발생했습니다.";
    }

    await router.replace("/login");
  } finally {
    isLoading.value = false;
  }
});
</script>

<style scoped>
.callback-wrap {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 24px;
  text-align: center;
}

.error-box {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.error-box p {
  color: #dc2626;
}

.error-box button {
  padding: 10px 16px;
  border-radius: 8px;
  cursor: pointer;
}
</style>
