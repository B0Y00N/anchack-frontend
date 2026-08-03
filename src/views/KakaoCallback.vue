<template>
  <div class="callback-wrap">
    <p v-if="!error">카카오 로그인 처리 중입니다...</p>

    <div v-else class="error-box">
      <p class="error">{{ error }}</p>
      <router-link to="/login">
        로그인 화면으로 돌아가기
      </router-link>
    </div>
  </div>
</template>

<script setup>
import { onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { loginWithKakao } from '../api/auth'

const route = useRoute()
const router = useRouter()
const error = ref('')

onMounted(async () => {
  const code = route.query.code

  console.log('카카오 인가 코드:', code)

  if (!code || typeof code !== 'string') {
    error.value = '카카오 인가 코드가 없습니다.'
    return
  }

  try {
    const response = await loginWithKakao(code)

    console.log('카카오 로그인 성공:', response)

    router.replace('/profile')
  } catch (e) {
    console.error('카카오 로그인 실패:', e)
    console.error('응답 상태:', e.response?.status)
    console.error('응답 데이터:', e.response?.data)
    console.error('요청 URL:', e.config?.url)
    console.error('요청 데이터:', e.config?.data)

    const serverMessage =
      typeof e.response?.data === 'string'
        ? e.response.data
        : e.response?.data?.message

    error.value =
      serverMessage ||
      `로그인 처리 중 오류가 발생했습니다. 상태 코드: ${
        e.response?.status ?? '알 수 없음'
      }`
  }
})
</script>
