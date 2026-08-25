<script setup>
import { Search, Map, ArrowRight, Check } from "lucide-vue-next";

defineEmits(["start", "navigate"]);

const searchFeatures = ["목적지 기반 통근시간 필터링", "예산·주거유형 매칭", "생활 우선순위 분석", "동네 비교 매트릭스"];
const exploreFeatures = ["서울 25구 인터랙티브 지도", "행정동 단위 생활 정보", "치안·교통·인프라 점수", "실거주민 리뷰 & 별점"];
</script>

<template>
  <section class="py-24 px-8 bg-white border-t border-border">
    <div class="max-w-5xl mx-auto">
      <h2 class="text-3xl font-bold text-center text-foreground mb-3">안착의 두 가지 서비스</h2>
      <p class="text-center text-muted-foreground mb-14">목적에 맞는 서비스를 골라서 시작해보세요</p>
      <div class="grid grid-cols-2 gap-8">
        <div class="bg-primary rounded-3xl p-10 text-white relative overflow-hidden">
          <div class="absolute top-0 right-0 w-48 h-48 bg-white/5 rounded-full -translate-y-16 translate-x-16" />
          <div class="relative z-10">
            <div class="w-14 h-14 bg-white/20 rounded-2xl flex items-center justify-center mb-6"><Search :size="26" /></div>
            <h3 class="text-2xl font-bold mb-3">내게 맞는 동네 찾기</h3>
            <p class="text-white/80 text-sm leading-relaxed mb-8">목적지, 예산, 생활방식을 입력하면 최적화된 동네를 추천하고 상세 이유와 단점까지 투명하게 공개해요.</p>
            <div class="space-y-2 mb-8">
              <div v-for="f in searchFeatures" :key="f" class="flex items-center gap-2 text-sm text-white/90"><Check :size="13" class="text-white/60 flex-shrink-0" /> {{ f }}</div>
            </div>
            <button @click="$emit('start')" class="flex items-center gap-2 bg-white text-primary font-bold px-7 py-3 rounded-full hover:bg-secondary shadow-sm">시작하기 <ArrowRight :size="16" /></button>
          </div>
        </div>
        <div class="bg-card border-2 border-border rounded-3xl p-10 relative overflow-hidden hover:border-primary/30 transition-colors">
          <div class="absolute top-0 right-0 w-48 h-48 bg-secondary/50 rounded-full -translate-y-16 translate-x-16" />
          <div class="relative z-10">
            <div class="w-14 h-14 bg-secondary rounded-2xl flex items-center justify-center mb-6 text-primary"><Map :size="26" /></div>
            <h3 class="text-2xl font-bold text-foreground mb-3">동네 둘러보기</h3>
            <p class="text-muted-foreground text-sm leading-relaxed mb-8">서울 지도에서 궁금한 구·동을 직접 클릭해 인프라, 치안, 교통 정보와 실거주민의 생생한 리뷰를 확인해요.</p>
            <div class="space-y-2 mb-8">
              <div v-for="f in exploreFeatures" :key="f" class="flex items-center gap-2 text-sm text-foreground/80"><Check :size="13" class="text-primary flex-shrink-0" /> {{ f }}</div>
            </div>
            <button @click="$emit('navigate', 'explore')" class="flex items-center gap-2 bg-primary text-primary-foreground font-bold px-7 py-3 rounded-full hover:bg-primary/90 shadow-sm">둘러보기 <ArrowRight :size="16" /></button>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>
