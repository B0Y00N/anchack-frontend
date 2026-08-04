<script setup>
import { Search, MapPin, BarChart2 } from "lucide-vue-next";

const steps = [
  { step: "STEP 1", icon: Search, title: "목적지와 예산 입력", desc: "출근지, 예산, 주거 유형과 생활 우선순위를 입력해요." },
  { step: "STEP 2", icon: MapPin, title: "나에게 맞는 동네 추천", desc: "조건을 분석해서 최적의 동네를 점수와 이유와 함께 알려드려요." },
  { step: "STEP 3", icon: BarChart2, title: "추천 이유와 단점 비교", desc: "장단점을 투명하게 공개하고 동네별 지표를 한눈에 비교해요." },
];
</script>

<template>
  <section class="py-24 px-8 border-t border-border bg-background">
    <div class="max-w-5xl mx-auto">
      <h2 class="text-3xl font-bold text-center text-foreground mb-14">이렇게 동네를 찾아드려요</h2>
      <div class="grid grid-cols-3 gap-16">
        <div v-for="s in steps" :key="s.step" class="text-center">
          <div class="w-16 h-16 bg-secondary rounded-2xl flex items-center justify-center mx-auto mb-5 text-primary"><component :is="s.icon" :size="24" /></div>
          <div class="text-xs font-bold text-primary tracking-widest mb-2">{{ s.step }}</div>
          <h3 class="text-lg font-bold text-foreground mb-2">{{ s.title }}</h3>
          <p class="text-sm text-muted-foreground leading-relaxed">{{ s.desc }}</p>
        </div>
      </div>
    </div>
  </section>
</template>
