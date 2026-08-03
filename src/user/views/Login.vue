<template>
  <div class="login-wrap">
    <h1>카카오 로그인 데모</h1>
    <button class="kakao-btn" @click="goKakaoLogin">
      <span class="kakao-icon">💬</span>
      카카오 계정으로 로그인
    </button>
  </div>
</template>

<script setup>
// 카카오 개발자 콘솔(https://developers.kakao.com) 에서 발급받은 REST API 키
// const KAKAO_CLIENT_ID = 'YOUR_KAKAO_REST_API_KEY'
const KAKAO_CLIENT_ID = import.meta.env.VITE_KAKAO_CLIENT_ID
// 카카오 콘솔에 등록한 Redirect URI와 반드시 동일해야 함
const REDIRECT_URI = import.meta.env.VITE_KAKAO_REDIRECT_URI

function goKakaoLogin() {
  const url =
    `https://kauth.kakao.com/oauth/authorize` +
    `?client_id=${KAKAO_CLIENT_ID}` +
    `&redirect_uri=${encodeURIComponent(REDIRECT_URI)}` +
    `&response_type=code`
  // + '&prompt=login'

  window.location.href = url
}
</script>

<style scoped>
.login-wrap {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100vh;
  gap: 24px;
}

h1 {
  font-size: 22px;
  color: #333;
}

.kakao-btn {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 24px;
  font-size: 16px;
  font-weight: bold;
  color: #191919;
  background-color: #fee500;
  border: none;
  border-radius: 8px;
  cursor: pointer;
}

.kakao-btn:hover {
  background-color: #fdd800;
}

.kakao-icon {
  font-size: 18px;
}
</style>
