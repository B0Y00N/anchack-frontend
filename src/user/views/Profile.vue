<template>
  <div class="profile-wrap" v-if="user">
    <img
      v-if="user.profileImage"
      :src="user.profileImage"
      alt="프로필 이미지"
      class="profile-img"
    />
    <h2>{{ user.nickname || '이름 없음' }}님 환영합니다!</h2>
    <p v-if="user.email">{{ user.email }}</p>
    <button class="logout-btn" @click="handleLogout">로그아웃</button>
  </div>
  <div class="profile-wrap" v-else>
    <p>로그인 정보를 불러오는 중입니다...</p>
  </div>
</template>

<script setup>
import { onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { fetchMe, logout } from '../api/auth'

const user = ref(null)
const router = useRouter()

onMounted(async () => {
  try {
    const res = await fetchMe()

    // 로그인 안 된 상태면 백엔드가 204 No Content를 반환 (res.data는 비어 있음)
    if (!res.data) {
      router.replace('/login')
      return
    }

    user.value = res.data
  } catch (e) {
    console.error('로그인 정보 조회 실패:', e)
    router.replace('/login')
  }
})

async function handleLogout() {
  try {
    await logout()
  } finally {
    router.replace('/')
  }
}
</script>
