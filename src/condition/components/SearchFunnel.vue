<script setup>
import { computed, onMounted, onUnmounted, ref } from "vue";
import { Sparkles, ChevronRight } from "lucide-vue-next";

// useRecommendationStore.filterFunnel 그대로: [{ stage, label?, count }]. 백엔드가 label을 안 주면
// STAGE_LABEL로 매핑한다(API_USER_CONDITIONS_REVISION_REQUEST.md P3 참고). 후보가 0개가 돼서
// 건너뛴 단계는 배열에 아예 없다 - 그래서 있는 것만 그대로 순서대로 그리면 된다.
const props = defineProps({
  funnel: { type: Array, required: true },
});
const emit = defineEmits(["done"]);

const STAGE_LABEL = {
  TOTAL: "검색 대상",
  ESSENTIAL: "필수 시설 조건 충족",
  BUDGET: "예산 조건 충족",
  COMMUTE: "출퇴근 가능",
  FINAL: "BEST",
};

const totalCount = computed(() => props.funnel[0]?.count ?? 0);
const finalCount = computed(() => props.funnel[props.funnel.length - 1]?.count ?? 0);

// 작은 개수도 눈에 보이게 sqrt 스케일로 바 너비를 잡는다(9%를 최저치로 둠).
function barWidth(count) {
  if (!totalCount.value) return 9;
  return Math.max(9, Math.round(Math.sqrt(count / totalCount.value) * 100));
}

// revealedCount: 카드가 DOM에 나타나는 시점(transition-group enter). filledCount: 그 카드의
// 바가 목표 너비로 차오르는 시점. 이 둘을 같은 틱에서 같이 바꾸면, 새로 마운트되는 요소는
// width가 "0%였다가 목표치로 바뀌는" 게 아니라 애초에 목표치로 태어나버려서 CSS
// transition이 애니메이션할 대상이 없다(브라우저 입장에서 값이 "변한" 적이 없음). 카드가
// 먼저 0% 너비로 나타난 뒤, 한 틱 뒤에 목표 너비로 바꿔줘야 실제로 차오르는 게 보인다.
//
// [수정] 단계 간 간격이 420ms라 전체가 너무 빨리 지나가서(사용자 피드백), 로딩 화면의
// 스텝 카드 템포(700ms)와 맞춰 STAGE_INTERVAL을 늘렸다. 바가 다 채워지는 것도 기다렸다가
// CTA를 보여주도록 지연 시간도 다시 계산했다.
const STAGE_INTERVAL = 700; // 단계가 하나씩 나타나는 간격(ms)
const FILL_DELAY = 150; // 카드가 나타난 뒤 바가 차오르기 시작하기까지(ms)
const BAR_TRANSITION = 800; // 바가 목표 너비까지 차오르는 데 걸리는 시간(ms) - CSS duration과 맞춰야 함

const revealedCount = ref(0);
const filledCount = ref(0);
const ctaVisible = ref(false);
let timers = [];

function schedule(fn, ms) {
  timers.push(setTimeout(fn, ms));
}

onMounted(() => {
  props.funnel.forEach((_, index) => {
    schedule(() => {
      revealedCount.value = index + 1;
    }, STAGE_INTERVAL * (index + 1));
    schedule(() => {
      filledCount.value = index + 1;
    }, STAGE_INTERVAL * (index + 1) + FILL_DELAY);
  });
  // 마지막 단계의 바가 실제로 다 차오른 뒤에야 CTA를 보여준다.
  schedule(() => {
    ctaVisible.value = true;
  }, STAGE_INTERVAL * props.funnel.length + FILL_DELAY + BAR_TRANSITION + 400);
});
onUnmounted(() => {
  timers.forEach(clearTimeout);
});
</script>

<template>
  <div class="min-h-screen bg-background flex items-center justify-center pt-[60px] px-6">
    <div class="w-full max-w-[440px]">
      <div class="text-center mb-8">
        <div class="w-16 h-16 rounded-2xl bg-secondary flex items-center justify-center mx-auto mb-5 text-primary shadow-sm">
          <Sparkles :size="26" />
        </div>
        <h1 class="text-xl font-bold text-foreground tracking-tight">조건에 맞는 동네를 추렸어요</h1>
        <p class="text-sm text-muted-foreground mt-2">
          {{ totalCount.toLocaleString() }}개 동에서 {{ finalCount }}개까지 좁혔어요
        </p>
      </div>

      <div class="grid gap-4">
        <transition-group name="funnel-stage">
          <div v-for="(stage, index) in funnel.slice(0, revealedCount)" :key="stage.stage">
            <div class="flex items-baseline justify-between gap-4 mb-1.5">
              <span
                :class="`text-sm font-bold ${stage.stage === 'FINAL' ? 'text-primary' : 'text-foreground'}`"
              >
                {{ stage.label || STAGE_LABEL[stage.stage] || stage.stage }}
              </span>
              <span
                :class="`font-extrabold tabular-nums tracking-tight ${
                  stage.stage === 'FINAL' ? 'text-[26px] text-primary' : 'text-lg text-foreground'
                }`"
              >
                {{ stage.count.toLocaleString() }}<small class="text-xs font-semibold text-muted-foreground ml-0.5">개</small>
              </span>
            </div>
            <div class="h-[10px] rounded-full bg-muted overflow-hidden">
              <div
                :class="`h-full rounded-full transition-[width] duration-[800ms] ease-out ${
                  stage.stage === 'FINAL' ? 'bg-primary' : 'bg-primary/45'
                }`"
                :style="{ width: index < filledCount ? barWidth(stage.count) + '%' : '0%' }"
              ></div>
            </div>
          </div>
        </transition-group>
      </div>

      <div
        :class="`mt-8 text-center transition-all duration-300 ${
          ctaVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2 pointer-events-none'
        }`"
      >
        <p class="text-[17px] font-extrabold text-foreground mb-4 leading-relaxed">
          조건에 가장 잘 맞는<br />{{ finalCount }}개의 동을 찾았어요
        </p>
        <button
          @click="emit('done')"
          class="w-full bg-primary text-primary-foreground font-bold py-3.5 rounded-full text-[15px] hover:bg-primary/90 transition-colors"
        >
          추천 결과 보기 <ChevronRight :size="15" class="inline -mt-0.5" />
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.funnel-stage-enter-active {
  transition:
    opacity 0.42s ease,
    transform 0.42s ease;
}
.funnel-stage-enter-from {
  opacity: 0;
  transform: translateY(8px);
}

@media (prefers-reduced-motion: reduce) {
  * {
    transition-duration: 0.01ms !important;
    animation-duration: 0.01ms !important;
  }
}
</style>
