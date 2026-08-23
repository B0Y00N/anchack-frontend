<script setup>
import { ref, onMounted, onUnmounted, watch } from "vue";
import { Loader2, Check, AlertCircle } from "lucide-vue-next";

const props = defineProps({
  status: { type: String, default: "loading" }, // idle | loading | success | error
  errorMessage: { type: String, default: "" },
  backLabel: { type: String, default: "이전 단계로" },
});
const emit = defineEmits(["done", "retry", "back"]);

// 백엔드 필터링 실제 순서(필수 시설 → 예산/주거유형 → 통근, API_USER_CONDITIONS_REVISION_REQUEST.md
// P3 참고)에 맞춘 문구. 실시간 진행 상황을 아는 게 아니라(응답이 한 번에 옴) 고정 딜레이로
// 흉내내는 연출이라 실제 개수는 안 보여준다 - 진짜 단계별 개수는 응답이 온 뒤 SearchFunnel.vue가
// filterFunnel로 보여준다.
const steps = [
  "필수 조건에 맞는 동네를 확인하고 있어요",
  "예산 범위에 맞는 동네를 고르고 있어요",
  "출퇴근 가능한 동네로 좁히고 있어요",
  "조건에 딱 맞는 순서로 정리하고 있어요",
];
const progress = ref(0);
const completed = ref(false);
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
  if (p >= steps.length && status === "success" && !completed.value) {
    completed.value = true;
    timeout = setTimeout(() => emit("done"), 700);
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
      <div class="text-center mb-8">
        <div
          :class="`w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-5 shadow-sm transition-colors duration-300 ${
            completed ? 'bg-primary text-white' : 'bg-secondary text-primary'
          }`"
        >
          <Check v-if="completed" :size="28" class="animate-[pop_.32s_ease-out]" />
          <Loader2 v-else class="animate-spin will-change-transform" :size="28" />
        </div>
        <h1 class="text-lg font-bold text-foreground tracking-tight">나에게 맞는 동을 찾고 있어요</h1>
      </div>

      <div class="space-y-3">
        <div
          v-for="(step, i) in steps"
          :key="i"
          :class="`flex items-center gap-3 px-5 py-4 rounded-xl border transition duration-300 ${i < progress ? 'bg-secondary border-primary/20' : i === progress ? 'bg-card border-primary/30 shadow-sm' : 'bg-card border-border'}`"
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

<style scoped>
@keyframes pop {
  0% {
    transform: scale(0.75);
  }
  75% {
    transform: scale(1.08);
  }
  100% {
    transform: scale(1);
  }
}

@media (prefers-reduced-motion: reduce) {
  * {
    animation-duration: 0.01ms !important;
    transition-duration: 0.01ms !important;
  }
}
</style>
