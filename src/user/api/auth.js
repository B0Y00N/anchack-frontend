import axios from 'axios'

console.log('API BASE URL:', import.meta.env.VITE_API_BASE_URL)

const api = axios.create({
  // baseURL: 'http://localhost:8080/kakao-login-backend', // WAS 배포 컨텍스트 경로에 맞게 수정
  baseURL: import.meta.env.VITE_API_BASE_URL,
  withCredentials: true, // 세션 쿠키 주고받기 위해 필수
})

// 카카오 인가 코드를 백엔드로 전달 -> 로그인 처리
export function loginWithKakao(code) {
  return api.post('/api/auth/kakao/callback', { code })
}

// 현재 로그인된 사용자 정보 조회
export function fetchMe() {
  return api.get('/api/auth/me')
}

// 로그아웃 (세션 무효화)
export function logout() {
  return api.post('/api/auth/logout')
}
