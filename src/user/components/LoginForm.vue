<script setup>
import SproutLogo from "../../common/components/SproutLogo.vue";
import { startKakaoOAuth } from "@/user/utils/kakaoOAuth";
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

        <button
          type="button"
          class="mt-3 w-full bg-[#FEE500] text-[#191919] font-bold py-3.5 rounded-xl hover:bg-[#F6DC00] transition-colors flex items-center justify-center gap-2"
          @click="startKakaoOAuth"
        >
          <span
            class="flex h-5 w-5 items-center justify-center rounded-full bg-[#191919] text-[11px] font-black text-[#FEE500]"
          >
            K
          </span>
          카카오로 로그인
        </button>

      </div>
    </div>
  </div>
</template>
