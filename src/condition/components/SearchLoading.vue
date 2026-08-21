<script setup>
import { ref, onMounted, onUnmounted, watch } from "vue";
import { Loader2, Check, AlertCircle } from "lucide-vue-next";

const props = defineProps({
  status: { type: String, default: "loading" }, // idle | loading | success | error
  errorMessage: { type: String, default: "" },
  backLabel: { type: String, default: "이전 단계로" },
});
const emit = defineEmits(["done", "retry", "back"]);

const steps = ["목적지까지 통근 가능한 동네를 찾고 있어요", "예산 범위와 동네 시세를 비교하고 있어요", "원하는 생활시설을 확인하고 있어요", "생활방식에 맞는 동네를 분석하고 있어요"];
const progress = ref(0);
let interval, timeout;

// 실제 API가 더 빨리 끝나도 최소 이 정도는 스텝 연출을 보여준다.
onMounted(() => {
  interval = setInterval(() => {
    progress.value = progress.value >= steps.length ? (clearInterval(interval), progress.value) : progress.value + 1;
  }, 700);
});
onUnmounted(() => {
  clearInterval(interval);
  clearTimeout(timeout);
});

watch([progress, () => props.status], ([p, status]) => {
  if (p >= steps.length && status === "success") {
    timeout = setTimeout(() => emit("done"), 500);
  }
});
</script>

<template>
  <div class="min-h-screen bg-background flex items-center justify-center pt-[60px]">
    <div v-if="status === 'error'" class="w-full max-w-[420px] px-6 text-center">
      <div class="w-16 h-16 bg-amber-50 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-sm">
        <AlertCircle class="text-amber-600" :size="30" />
      </div>
      <p class="text-sm font-semibold text-foreground mb-1">동네를 찾지 못했어요</p>
      <p class="text-sm text-muted-foreground mb-6">{{ errorMessage }}</p>
      <div class="flex justify-center gap-2.5">
        <button @click="emit('back')" class="px-5 py-2.5 rounded-full text-sm font-semibold text-muted-foreground border border-border hover:bg-secondary">{{ backLabel }}</button>
        <button @click="emit('retry')" class="px-5 py-2.5 rounded-full text-sm font-semibold bg-primary text-primary-foreground hover:bg-primary/90">다시 시도</button>
      </div>
    </div>

    <div v-else class="w-full max-w-[420px] px-6">
      <div class="w-16 h-16 bg-secondary rounded-2xl flex items-center justify-center mx-auto mb-10 shadow-sm">
        <Loader2 class="text-primary animate-spin" :size="30" />
      </div>
      <div class="space-y-3">
        <div
          v-for="(step, i) in steps"
          :key="i"
          :class="`flex items-center gap-3 px-5 py-4 rounded-xl border transition-all duration-300 ${i < progress ? 'bg-secondary border-primary/20' : i === progress ? 'bg-card border-primary/30 shadow-sm' : 'bg-card border-border'}`"
        >
          <div :class="`w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 ${i < progress ? 'bg-primary' : i === progress ? 'border-2 border-primary' : 'border-2 border-muted-foreground/25'}`">
            <Check v-if="i < progress" :size="11" class="text-white" />
            <div v-else-if="i === progress" class="w-1.5 h-1.5 bg-primary rounded-full animate-pulse" />
          </div>
          <span :class="`text-sm ${i >= progress ? 'text-muted-foreground' : 'text-foreground'}`">{{ step }}</span>
        </div>
      </div>
    </div>
  </div>
</template>
