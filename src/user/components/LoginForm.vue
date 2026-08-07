<script setup>
import { useRouter } from "vue-router";
import SproutLogo from "../../common/components/SproutLogo.vue";
import { useAuthStore } from "../stores/useAuthStore";

const router = useRouter();
const auth = useAuthStore();

// 카카오 개발자 콘솔에서 발급받은 REST API 키
const KAKAO_CLIENT_ID = import.meta.env.VITE_KAKAO_CLIENT_ID;

// 카카오 개발자 콘솔에 등록한 Redirect URI
const REDIRECT_URI = import.meta.env.VITE_KAKAO_REDIRECT_URI;

function login() {
  auth.login({ social: false });
  router.push("/");
}

function kakaoLogin() {
  console.log("KAKAO_CLIENT_ID:", KAKAO_CLIENT_ID);
  console.log("REDIRECT_URI:", REDIRECT_URI);

  const url =
    `https://kauth.kakao.com/oauth/authorize` +
    `?client_id=${KAKAO_CLIENT_ID}` +
    `&redirect_uri=${encodeURIComponent(REDIRECT_URI)}` +
    `&response_type=code`
    // 재로그인 안하려면 아래 주석
    + `&prompt=login`;
  ;

  console.log("카카오 요청 URL:", url);

  window.location.href = url;
}
</script>

<template>
  <div
    class="min-h-screen bg-background pt-[60px] flex items-center justify-center px-6"
  >
    <div class="w-full max-w-[420px]">
      <div class="text-center mb-8">
        <div class="flex justify-center mb-4">
          <SproutLogo :size="48" />
        </div>

        <h1 class="text-2xl font-bold text-foreground mb-1">
          다시 만나서 반가워요
        </h1>
      </div>

      <div class="bg-card border border-border rounded-2xl p-8 shadow-sm">
<!--        <div class="space-y-4 mb-6">-->
<!--          <div>-->
<!--            <label class="block text-sm font-semibold text-foreground mb-1.5">-->
<!--              이메일-->
<!--            </label>-->

<!--            <input-->
<!--              type="email"-->
<!--              placeholder="example@email.com"-->
<!--              class="w-full bg-muted rounded-xl px-4 py-3 text-sm border-0 outline-none focus:ring-2 focus:ring-primary/30"-->
<!--            />-->
<!--          </div>-->

<!--          <div>-->
<!--            <label class="block text-sm font-semibold text-foreground mb-1.5">-->
<!--              비밀번호-->
<!--            </label>-->

<!--            <input-->
<!--              type="password"-->
<!--              placeholder="비밀번호를 입력하세요"-->
<!--              class="w-full bg-muted rounded-xl px-4 py-3 text-sm border-0 outline-none focus:ring-2 focus:ring-primary/30"-->
<!--            />-->
<!--          </div>-->
<!--        </div>-->

<!--        <button-->
<!--          type="button"-->
<!--          class="w-full bg-primary text-primary-foreground font-bold py-3.5 rounded-xl hover:bg-primary/90 transition-colors"-->
<!--          @click="login"-->
<!--        >-->
<!--          로그인-->
<!--        </button>-->

        <button
          type="button"
          class="mt-3 w-full bg-[#FEE500] text-[#191919] font-bold py-3.5 rounded-xl hover:bg-[#F6DC00] transition-colors flex items-center justify-center gap-2"
          @click="kakaoLogin"
        >
          <span
            class="flex h-5 w-5 items-center justify-center rounded-full bg-[#191919] text-[11px] font-black text-[#FEE500]"
          >
            K
          </span>
          카카오로 로그인
        </button>

<!--        <p class="text-center text-sm text-muted-foreground mt-5">-->
<!--          아직 회원이 아니신가요?-->

<!--          <button-->
<!--            type="button"-->
<!--            class="text-primary font-semibold hover:underline"-->
<!--            @click="router.push('/signup')"-->
<!--          >-->
<!--            회원가입-->
<!--          </button>-->
<!--        </p>-->
      </div>
    </div>
  </div>
</template>
