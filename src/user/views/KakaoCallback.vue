<template>
  <div class="callback-wrap">
    <p v-if="isLoading">
      카카오 로그인 처리 중입니다...
    </p>

    <div v-else-if="errorMessage" class="error-box">
      <p>{{ errorMessage }}</p>

      <button type="button" @click="goLogin">
        로그인 화면으로 이동
      </button>

      <button type="button" @click="goHome">
        홈으로 이동
      </button>
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

function goHome() {
  router.replace("/");
}

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
  const kakaoErrorDescription =
    route.query.error_description;

  // 카카오 로그인 화면에서 취소한 경우
  if (kakaoError) {
    errorMessage.value =
      kakaoErrorDescription ||
      "카카오 로그인이 취소되었습니다.";

    isLoading.value = false;
    return;
  }

  // 인가 코드가 없는 경우
  if (!code || typeof code !== "string") {
    errorMessage.value =
      "카카오 인가 코드가 없습니다.";

    isLoading.value = false;
    return;
  }

  try {
    console.log("카카오 인가 코드 확인 완료");

    // 인가 코드를 백엔드로 전달
    const response = await loginWithKakao(code);

    console.log(
      "카카오 로그인 응답:",
      response.data,
    );

    const responseData = response.data;

    const accessToken =
      responseData?.accessToken ||
      responseData?.access_token;

    const tokenType =
      responseData?.tokenType ||
      responseData?.token_type ||
      "Bearer";

    const loginUser =
      responseData?.user;

    if (!accessToken) {
      throw new Error(
        "서버 응답에 JWT가 없습니다.",
      );
    }

    if (!loginUser) {
      throw new Error(
        "서버 응답에 사용자 정보가 없습니다.",
      );
    }

    // 기존 토큰이 있다면 새 토큰으로 교체
    localStorage.setItem(
      "accessToken",
      accessToken,
    );

    localStorage.setItem(
      "tokenType",
      tokenType,
    );

    // 로그인한 카카오 회원 정보를 Store에 저장
    authStore.setUser(loginUser);

    console.log("JWT 저장 완료");
    console.log(
      "로그인 사용자 저장 완료:",
      authStore.user,
    );

    // 로그인 완료 후 접근하려던 페이지로 복귀
    await router.replace(getLoginRedirect());
  } catch (error) {
    console.error(
      "카카오 로그인 실패:",
      error,
    );

    console.error(
      "응답 상태:",
      error.response?.status,
    );

    console.error(
      "응답 내용:",
      error.response?.data,
    );

    // 로그인 처리 중 저장된 불완전한 정보 제거
    authStore.clearUser();

    if (!error.response) {
      errorMessage.value =
        error.message ||
        "백엔드 서버에 연결할 수 없습니다.";
    } else if (error.response.status === 400) {
      errorMessage.value =
        error.response.data?.message ||
        "카카오 인가 코드가 유효하지 않습니다.";
    } else if (error.response.status === 401) {
      errorMessage.value =
        error.response.data?.message ||
        "카카오 인증에 실패했습니다.";
    } else if (error.response.status >= 500) {
      errorMessage.value =
        error.response.data?.message ||
        "서버에서 로그인 처리 중 오류가 발생했습니다.";
    } else {
      errorMessage.value =
        error.response.data?.message ||
        error.message ||
        "카카오 로그인 처리 중 오류가 발생했습니다.";
    }
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
