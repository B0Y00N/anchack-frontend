<script setup>
import { ArrowRight, Map } from "lucide-vue-next";
import SproutLogo from "../common/SproutLogo.vue";

defineEmits(["start", "navigate"]);
</script>

<template>
  <section class="pt-[60px] min-h-[88vh] flex flex-col items-center justify-center text-center px-8 relative overflow-hidden">
    <div class="absolute inset-0 pointer-events-none">
      <div class="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[600px] bg-primary/5 rounded-full blur-3xl" />
      <div class="absolute top-32 left-10 w-48 h-48 bg-secondary rounded-full blur-2xl opacity-60" />
    </div>
    <div class="relative z-10 max-w-3xl">
      <div class="inline-flex items-center gap-2 bg-secondary text-primary text-xs font-bold px-3.5 py-1.5 rounded-full mb-9 border border-primary/15">
        <SproutLogo :size="16" /> 사회초년생을 위한 맞춤 동네 추천 서비스
      </div>
      <h1 class="text-[56px] font-bold text-foreground leading-[1.18] mb-6 tracking-tight">
        낯선 동네,<br /><span class="text-primary">어디에 살아야 할지</span> 모르겠다면
      </h1>
      <p class="text-[17px] text-muted-foreground leading-relaxed mb-11 max-w-[500px] mx-auto">
        목적지와 예산, 생활방식을 알려주면 나에게 맞는 동네와<br />추천 이유, 미리 알아둘 단점까지 함께 보여드려요.
      </p>
      <div class="flex items-center justify-center gap-4">
        <button @click="$emit('start')" class="flex items-center gap-2.5 bg-primary text-primary-foreground font-bold px-9 py-4 rounded-full hover:bg-primary/90 shadow-lg shadow-primary/20 text-base">
          내게 맞는 동네 찾기 <ArrowRight :size="18" />
        </button>
        <button @click="$emit('navigate', 'explore')" class="flex items-center gap-2.5 px-9 py-4 rounded-full border border-border text-foreground font-semibold hover:bg-secondary text-base bg-white">
          <Map :size="17" /> 동네 둘러보기
        </button>
      </div>
    </div>
  </section>
</template>
