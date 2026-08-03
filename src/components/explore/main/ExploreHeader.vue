<script setup>
import { ChevronLeft, Users, Star, Heart, Home, MessageSquare } from "lucide-vue-next";

const props = defineProps({
  district: { type: String, required: true },
  dong: { type: String, required: true },
  population: { type: Number, required: true },
  avgOverall: { type: Number, default: 0 },
  reviewCount: { type: Number, default: 0 },
  isSaved: { type: Boolean, default: false },
});
const emit = defineEmits(["back", "toggle-save", "listings", "write-review"]);
</script>

<template>
  <div class="max-w-5xl mx-auto px-8 py-5">
    <div class="flex items-center gap-2 mb-3 text-sm text-muted-foreground">
      <button @click="emit('back')" class="hover:text-primary flex items-center gap-1"><ChevronLeft :size="15" /> 동네 둘러보기</button>
      <span>/</span><span class="text-foreground font-medium">{{ district }}</span><span>/</span><span class="text-primary font-semibold">{{ dong }}</span>
    </div>
    <div class="flex items-end justify-between">
      <div>
        <span class="text-xs font-bold text-primary bg-secondary px-2.5 py-1 rounded-full">{{ district }}</span>
        <h1 class="text-3xl font-bold text-foreground mt-1">{{ dong }}</h1>
        <div class="flex items-center gap-4 mt-2">
          <span class="text-sm text-muted-foreground flex items-center gap-1.5"><Users :size="13" /> 약 {{ population.toLocaleString() }}명</span>
          <span v-if="reviewCount > 0" class="text-sm text-muted-foreground flex items-center gap-1.5"><Star :size="13" class="text-amber-400 fill-amber-400" /> {{ avgOverall.toFixed(1) }} ({{ reviewCount }}개)</span>
        </div>
      </div>
      <div class="flex gap-2.5">
        <button
          @click="emit('toggle-save')"
          :class="`flex items-center gap-2 px-4 py-2.5 rounded-full text-sm font-medium border transition-all ${isSaved ? 'bg-primary/10 text-primary border-primary/30' : 'border-border hover:bg-secondary'}`"
        >
          <Heart :size="14" :class="isSaved ? 'fill-primary text-primary' : ''" />{{ isSaved ? "저장됨" : "저장" }}
        </button>
        <button @click="emit('listings')" class="flex items-center gap-2 px-4 py-2.5 rounded-full text-sm font-medium border border-border hover:bg-secondary transition-all">
          <Home :size="14" /> 매물 찾기
        </button>
        <button @click="emit('write-review')" class="flex items-center gap-2 bg-primary text-primary-foreground px-5 py-2.5 rounded-full text-sm font-semibold hover:bg-primary/90 shadow-sm">
          <MessageSquare :size="15" /> 리뷰 작성
        </button>
      </div>
    </div>
  </div>
</template>
