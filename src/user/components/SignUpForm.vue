<script setup>
import { useRouter } from 'vue-router'
import SproutLogo from '../../common/components/SproutLogo.vue'
import { startKakaoOAuth } from '@/user/utils/kakaoOAuth'

const router = useRouter()

// 일반 이메일/비밀번호 회원가입 API 구현 후 사용한다.
// const fields = [
//   { label: "이름", placeholder: "홍길동", type: "text" },
//   { label: "이메일", placeholder: "example@email.com", type: "email" },
//   { label: "비밀번호", placeholder: "8자 이상 입력", type: "password" },
// ];
</script>

<template>
  <div class="min-h-screen bg-background pt-[60px] flex items-center justify-center px-6">
    <div class="w-full max-w-[440px]">
      <div class="text-center mb-8">
        <div class="flex justify-center mb-4"><SproutLogo :size="48" /></div>
        <h1 class="text-2xl font-bold text-foreground mb-1">안착에 오신 것을 환영해요</h1>
      </div>
      <div class="bg-card border border-border rounded-2xl p-8 shadow-sm">
        <div>
          <!--
            일반 이메일/비밀번호 회원가입 API 구현 후 활성화한다.

            <div class="space-y-4">
              <div v-for="f in fields" :key="f.label">
                <label class="block text-sm font-semibold text-foreground mb-1.5">{{ f.label }}</label>
                <input :type="f.type" :placeholder="f.placeholder" class="w-full bg-muted rounded-xl px-4 py-3 text-sm border-0 outline-none focus:ring-2 focus:ring-primary/30" />
              </div>
              <button type="button" @click="router.push('/login')" class="w-full mt-2 bg-primary text-primary-foreground font-bold py-3.5 rounded-xl hover:bg-primary/90 transition-colors">가입 완료</button>
            </div>
          -->

          <p class="mb-4 text-center text-sm text-muted-foreground">
            카카오 계정으로 간편하게 가입하고 시작하세요.
          </p>
          <button
            type="button"
            @click="startKakaoOAuth"
            class="w-full mt-3 bg-[#FEE500] text-[#191919] font-bold py-3.5 rounded-xl hover:bg-[#F6DC00] transition-colors flex items-center justify-center gap-2"
          >
            <span
              class="flex h-5 w-5 items-center justify-center rounded-full bg-[#191919] text-[11px] font-black text-[#FEE500]"
              >K</span
            >카카오로 회원가입
          </button>
        </div>
        <p class="text-center text-sm text-muted-foreground mt-5">
          이미 계정이 있으신가요?
          <button @click="router.push('/login')" class="text-primary font-semibold hover:underline">
            로그인
          </button>
        </p>
      </div>
    </div>
  </div>
</template>
