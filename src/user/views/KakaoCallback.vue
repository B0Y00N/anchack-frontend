<template>
  <div class="callback-wrap">
    <p v-if="isLoading">카카오 로그인 처리 중입니다...</p>

    <div v-else-if="errorMessage" class="error-box">
      <p>{{ errorMessage }}</p>

      <button type="button" @click="goLogin">로그인 화면으로 이동</button>
      <button type="button" @click="goHome">홈으로 이동</button>
    </div>
  </div>
</template>

<script setup>
import { onMounted, ref } from "vue";
import { useRoute, useRouter } from "vue-router";
import { getErrorMessage } from "@/common/api/axios";
import { loginWithKakao } from "@/user/api/auth";
import { useAuthStore } from "@/user/stores/useAuthStore";
import { consumeKakaoOAuthState } from "@/user/utils/kakaoOAuth";

const route = useRoute();
const router = useRouter();
const authStore = useAuthStore();

const isLoading = ref(true);
const errorMessage = ref("");

function goLogin() {
  router.replace("/login");
}

function goHome() {
  router.replace("/");
}

function getLoginRedirect() {
  const redirect = sessionStorage.getItem("loginRedirect");
  sessionStorage.removeItem("loginRedirect");
  return redirect || "/";
}

onMounted(async () => {
  const code = route.query.code;
  const callbackState = route.query.state;
  const kakaoError = route.query.error;
  const kakaoErrorDescription = route.query.error_description;

  if (!consumeKakaoOAuthState(callbackState)) {
    errorMessage.value =
      "카카오 로그인 요청을 확인할 수 없습니다. 다시 로그인해 주세요.";
    console.error("카카오 로그인 실패: OAuth state가 일치하지 않습니다.");
    isLoading.value = false;
    return;
  }

  if (kakaoError) {
    errorMessage.value =
      typeof kakaoErrorDescription === "string"
        ? kakaoErrorDescription
        : "카카오 로그인이 취소되었습니다.";
    console.error("카카오 OAuth 실패:", kakaoError, errorMessage.value);
    isLoading.value = false;
    return;
  }

  if (!code || typeof code !== "string") {
    errorMessage.value = "카카오 인가 코드가 없습니다.";
    console.error("카카오 로그인 실패:", errorMessage.value);
    isLoading.value = false;
    return;
  }

  try {
    const response = await loginWithKakao(code);
    const { user, accessToken, tokenType = "Bearer" } = response.data;

    const responseErrorMessage = !accessToken
      ? "서버 응답에 JWT가 없습니다."
      : !user
        ? "서버 응답에 사용자 정보가 없습니다."
        : "";

    if (responseErrorMessage) {
      authStore.clearUser();
      errorMessage.value = responseErrorMessage;
      console.error("카카오 로그인 실패:", responseErrorMessage);
      return;
    }

    localStorage.setItem("accessToken", accessToken);
    localStorage.setItem("tokenType", tokenType);
    authStore.setUser(user);

    await router.replace(getLoginRedirect());
  } catch (error) {
    console.error("카카오 로그인 실패:", error);
    authStore.clearUser();

    const status = error.response?.status;
    let fallbackMessage = "카카오 로그인 처리 중 오류가 발생했습니다.";

    if (!error.response) {
      fallbackMessage = error.message || "백엔드 서버에 연결할 수 없습니다.";
    } else if (status === 400) {
      fallbackMessage = "카카오 인가 코드가 유효하지 않습니다.";
    } else if (status === 401) {
      fallbackMessage = "카카오 인증에 실패했습니다.";
    } else if (status >= 500) {
      fallbackMessage = "서버에서 로그인 처리 중 오류가 발생했습니다.";
    }

    errorMessage.value = getErrorMessage(error, fallbackMessage);
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
