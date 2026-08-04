<script setup>
import { ChevronLeft } from "lucide-vue-next";
import SearchProgressBar from "./SearchProgressBar.vue";

const STEP_LABELS = ["어디로 이동해야 하나요?", "동네를 고를 때 무엇이 중요한가요?", "예산은 어느 정도인가요?", "어떤 집을 찾고 있나요?", "입력한 조건을 확인해주세요"];

const props = defineProps({
  step: { type: Number, required: true },
  title: { type: String, required: true },
  subtitle: { type: String, default: "" },
  canNext: { type: Boolean, default: true },
  hasPrev: { type: Boolean, default: false },
});
const emit = defineEmits(["next", "prev"]);
</script>

<template>
  <div class="min-h-screen bg-background pt-[60px]">
    <div class="max-w-[800px] mx-auto px-8 py-10">
      <div class="mb-8">
        <SearchProgressBar :step="step" :total="5" />
        <div class="flex justify-between mt-2.5">
          <span class="text-sm font-semibold text-primary">{{ step }}/5 {{ STEP_LABELS[step - 1] }}</span>
          <span class="text-sm text-muted-foreground">약 1분이면 완료돼요</span>
        </div>
      </div>
      <h1 class="text-[28px] font-bold text-foreground leading-snug mb-2">{{ title }}</h1>
      <p v-if="subtitle" class="text-sm text-muted-foreground mb-7">{{ subtitle }}</p>
      <div v-else class="mb-7" />

      <slot />

      <div class="flex justify-between items-center mt-10">
        <button v-if="hasPrev" @click="emit('prev')" class="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground font-medium"><ChevronLeft :size="16" /> 이전</button>
        <div v-else />
        <button @click="emit('next')" :disabled="!canNext" class="bg-primary text-primary-foreground font-semibold px-9 py-3 rounded-full hover:bg-primary/90 disabled:opacity-40 disabled:cursor-not-allowed shadow-sm">다음</button>
      </div>
    </div>
  </div>
</template>
