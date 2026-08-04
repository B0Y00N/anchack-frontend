<script setup>
import { useRouter } from "vue-router";
import SproutLogo from "../../common/components/SproutLogo.vue";
import { useAuthStore } from "../stores/useAuthStore";

const router = useRouter();
const auth = useAuthStore();

function login() {
  auth.login({ social: false });
  router.push("/");
}
function kakaoLogin() {
  auth.login({ social: true });
  router.push("/");
}
</script>

<template>
  <div class="min-h-screen bg-background pt-[60px] flex items-center justify-center px-6">
    <div class="w-full max-w-[420px]">
      <div class="text-center mb-8">
        <div class="flex justify-center mb-4"><SproutLogo :size="48" /></div>
        <h1 class="text-2xl font-bold text-foreground mb-1">다시 만나서 반가워요</h1>
      </div>
      <div class="bg-card border border-border rounded-2xl p-8 shadow-sm">
        <div class="space-y-4 mb-6">
          <div>
            <label class="block text-sm font-semibold text-foreground mb-1.5">이메일</label>
            <input type="email" placeholder="example@email.com" class="w-full bg-muted rounded-xl px-4 py-3 text-sm border-0 outline-none focus:ring-2 focus:ring-primary/30" />
          </div>
          <div>
            <label class="block text-sm font-semibold text-foreground mb-1.5">비밀번호</label>
            <input type="password" placeholder="비밀번호를 입력하세요" class="w-full bg-muted rounded-xl px-4 py-3 text-sm border-0 outline-none focus:ring-2 focus:ring-primary/30" />
          </div>
        </div>
        <button @click="login" class="w-full bg-primary text-primary-foreground font-bold py-3.5 rounded-xl hover:bg-primary/90 transition-colors">로그인</button>
        <button @click="kakaoLogin" class="mt-3 w-full bg-[#FEE500] text-[#191919] font-bold py-3.5 rounded-xl hover:bg-[#F6DC00] transition-colors flex items-center justify-center gap-2">
          <span class="flex h-5 w-5 items-center justify-center rounded-full bg-[#191919] text-[11px] font-black text-[#FEE500]">K</span>카카오로 로그인
        </button>
        <p class="text-center text-sm text-muted-foreground mt-5">
          아직 회원이 아니신가요?
          <button @click="router.push('/signup')" class="text-primary font-semibold hover:underline">회원가입</button>
        </p>
      </div>
    </div>
  </div>
</template>
