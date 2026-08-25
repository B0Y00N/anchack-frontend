<script setup>
import { ChevronLeft, Home, Heart, RefreshCw, Star } from "lucide-vue-next";
import { formatOneDecimal } from "../../../common/utils/formatNumber";

const props = defineProps({
  n: { type: Object, required: true },
  isSaved: { type: Boolean, default: false },
  inCompare: { type: Boolean, default: false },
});
const emit = defineEmits(["back", "listings", "toggle-save", "compare"]);
</script>

<template>
  <div>
    <button @click="emit('back')" class="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-primary mb-6 font-medium"><ChevronLeft :size="16" /> 추천 결과로 돌아가기</button>
    <div class="flex items-start justify-between mb-8">
      <div>
        <h1 class="text-4xl font-bold text-foreground mb-1">{{ n.guName }} {{ n.dongName }}</h1>
        <div class="flex items-center gap-3">
          <p class="text-xl font-bold text-primary">적합도 {{ formatOneDecimal(n.score) }}점</p>
          <div class="flex items-center gap-1">
            <Star v-for="i in 5" :key="i" :size="14" :class="i - 1 < Math.round(n.score / 20) ? 'text-primary fill-primary' : 'text-muted-foreground'" />
          </div>
        </div>
      </div>
      <div class="flex gap-3">
        <button @click="emit('listings')" class="flex items-center gap-2 px-5 py-2.5 bg-primary text-primary-foreground rounded-full text-sm font-semibold hover:bg-primary/90 shadow-sm"><Home :size="15" /> 매물 찾기</button>
        <button
          @click="emit('toggle-save')"
          :class="`flex items-center gap-2 px-4 py-2.5 rounded-full text-sm font-medium border transition-all ${isSaved ? 'bg-primary/10 text-primary border-primary/30' : 'border-border hover:bg-secondary'}`"
        >
          <Heart :size="14" :class="isSaved ? 'fill-primary text-primary' : ''" /> {{ isSaved ? "저장됨" : "관심 동네 저장" }}
        </button>
        <button
          @click="emit('compare')"
          :class="`flex items-center gap-2 px-4 py-2.5 rounded-full text-sm font-semibold border ${inCompare ? 'bg-primary text-primary-foreground border-primary' : 'border-border hover:bg-secondary'}`"
        >
          <RefreshCw :size="14" /> 비교 담기
        </button>
      </div>
    </div>
  </div>
</template>
