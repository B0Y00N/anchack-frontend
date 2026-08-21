<script setup>
import { Heart, MapPin, Store, Hospital, Trees, Trash2 } from "lucide-vue-next";
import RadialGauge from "../../common/components/RadialGauge.vue";

defineProps({
  // GET /api/admin-dongs/batch 응답 배열 그대로(adminDongId/guName/dongName/deposit/monthly/
  // safetyScore/convenience/hospitals/parks 등). API_USER_CONDITIONS_REVISION_REQUEST.md P1-b 참고.
  neighborhoods: { type: Array, required: true },
});
const emit = defineEmits(["navigate", "remove"]);

// 안전 종합 점수는 426개 동 전체를 대상으로 한 Z-score를 "50 + 10*z"로 옮긴 값
// (백엔드 계산식 기준)이라 이론상 표준편차가 10점 근방이어야 하지만, 실제 배치
// API로 426개 전체를 떠서 확인해보니(2025-08-20 기준 admin-dongs/batch 전수 조사)
// 평균 50.00 / 표준편차 4.64 / 최댓값 62.46로 훨씬 좁게 몰려 있었다. 평균 ±
// 1표준편차(≈4.6, 반올림해 5)를 경계로 잡으면 대략 13%/75%/12%로 정규분포에서
// 기대하는 비율에 가깝게 나뉜다.
//
// [PR 리뷰 반영] 표준편차가 작아서(4.6점) 두 구간 사이의 실질 격차가 크지 않은데,
// "안전/주의" 같은 절대 판정 라벨을 쓰면 사용자가 "주의"를 실제로 위험한 동네로
// 오해할 수 있다(안착은 거주지를 정하는 서비스라 이 오해가 실제 선택을 바꿈).
// 그래서 라벨을 "서울 평균 대비 상대적으로 어디쯤인지"로 바꿨다. 이 45/55 기준
// 자체도 위 스냅샷 시점 데이터에 맞춘 하드코딩이라, 지표를 재수집하면 다시 실측해서
// 맞춰야 한다 - 백엔드가 나중에 백분위를 내려주면 이 상수 대신 그 값을 쓸 예정.
const SAFETY_SCORE_HIGH_THRESHOLD = 55;
const SAFETY_SCORE_LOW_THRESHOLD = 45;

function safetyColor(score) {
  if (score == null) return "#9CA3AF";
  if (score >= SAFETY_SCORE_HIGH_THRESHOLD) return "#2D7A4F";
  if (score >= SAFETY_SCORE_LOW_THRESHOLD) return "#D97706";
  return "#E11D48";
}
function safetyLabel(score) {
  if (score == null) return "정보 없음";
  if (score >= SAFETY_SCORE_HIGH_THRESHOLD) return "서울 평균 이상";
  if (score >= SAFETY_SCORE_LOW_THRESHOLD) return "평균 수준";
  return "서울 평균 이하";
}

const INFRA_ITEMS = [
  { key: "convenience", label: "편의점", icon: Store, threshold: 7 },
  { key: "hospitals", label: "병원", icon: Hospital, threshold: 3 },
  { key: "parks", label: "공원", icon: Trees, threshold: 2 },
];
</script>

<template>
  <div>
    <h2 class="text-lg font-bold text-foreground mb-5">관심 동네</h2>

    <div v-if="neighborhoods.length === 0" class="text-center py-20 bg-card border border-border rounded-2xl">
      <Heart :size="40" class="mx-auto mb-4 text-muted-foreground/40" />
      <p class="font-semibold text-foreground mb-1">아직 저장한 관심 동네가 없어요</p>
      <p class="text-sm text-muted-foreground mb-6">동네 상세 페이지에서 관심 동네를 저장해보세요.</p>
      <button @click="emit('navigate')" class="bg-primary text-primary-foreground font-semibold px-6 py-2.5 rounded-full text-sm hover:bg-primary/90">
        동네 찾으러 가기
      </button>
    </div>

    <TransitionGroup v-else tag="div" name="card-remove" class="grid grid-cols-2 gap-4">
      <div
        v-for="n in neighborhoods"
        :key="n.adminDongId"
        class="bg-card border border-border rounded-2xl p-5 hover:border-primary/30 hover:shadow-md hover:-translate-y-0.5 transition-all duration-200"
      >
        <div class="flex items-start justify-between mb-4">
          <div class="flex items-center gap-2">
            <div class="w-8 h-8 rounded-full bg-secondary flex items-center justify-center flex-shrink-0">
              <MapPin :size="15" class="text-primary" />
            </div>
            <div>
              <h3 class="font-bold text-foreground">{{ n.guName }} {{ n.dongName }}</h3>
              <p class="text-xs text-primary font-semibold mt-0.5">
                <template v-if="n.deposit != null && n.monthly != null">보증금 {{ n.deposit }}만원 · 월세 {{ n.monthly }}만원</template>
                <template v-else-if="n.monthly != null">월세 {{ n.monthly }}만원</template>
                <template v-else-if="n.deposit != null">전세 {{ n.deposit }}만원</template>
                <template v-else>시세 정보 없음</template>
              </p>
            </div>
          </div>
          <button
            @click.stop="emit('remove', n.adminDongId)"
            aria-label="관심 동네에서 삭제"
            class="p-2 -m-1 rounded-full flex-shrink-0 text-muted-foreground hover:text-rose-600 hover:bg-rose-50 transition-colors"
          >
            <Trash2 :size="16" />
          </button>
        </div>

        <div class="flex items-center gap-4 mb-4 pb-4 border-b border-border/70">
          <RadialGauge
            v-if="n.safetyScore != null"
            label="안전 종합"
            :value="Math.round(n.safetyScore)"
            :color="safetyColor(n.safetyScore)"
            :size="60"
            :thickness="7"
          />
          <!-- safetyScore가 없을 때 RadialGauge에 0을 넘기면 게이지는 텅 빈 원으로,
               라벨은 "정보 없음"으로 서로 다른 얘기를 해서(PR 리뷰 지적) 중립
               placeholder로 대체한다. -->
          <div v-else class="flex flex-col items-center gap-2 flex-shrink-0" style="width: 60px">
            <div class="w-[60px] h-[60px] rounded-full border-[7px] border-muted flex items-center justify-center">
              <span class="text-[10px] text-muted-foreground text-center leading-tight">정보<br />없음</span>
            </div>
            <span class="text-xs text-muted-foreground text-center">안전 종합</span>
          </div>
          <div class="flex-1">
            <div class="flex items-center gap-1.5 mb-2">
              <span
                class="inline-block text-xs font-semibold px-2 py-0.5 rounded-full"
                :style="{ color: safetyColor(n.safetyScore), backgroundColor: safetyColor(n.safetyScore) + '1A' }"
              >
                치안 {{ safetyLabel(n.safetyScore) }}
              </span>
              <span class="text-[10px] text-muted-foreground">전체 동 평균은 50점이에요</span>
            </div>
            <div class="grid grid-cols-3 gap-2">
              <div
                v-for="item in INFRA_ITEMS"
                :key="item.key"
                :class="`rounded-xl p-2 text-center border ${
                  (n[item.key] ?? 0) >= item.threshold ? 'bg-secondary border-primary/20' : 'bg-muted border-transparent'
                }`"
              >
                <component
                  :is="item.icon"
                  :size="15"
                  :stroke-width="1.8"
                  :class="`mx-auto mb-1 ${(n[item.key] ?? 0) >= item.threshold ? 'text-primary' : 'text-muted-foreground'}`"
                />
                <p class="text-xs font-bold text-foreground">{{ n[item.key] ?? "-" }}</p>
                <p class="text-[10px] text-muted-foreground">{{ item.label }}</p>
              </div>
            </div>
          </div>
        </div>

        <button
          @click="emit('navigate', n.guName, n.dongName)"
          class="w-full text-xs font-semibold text-primary border border-primary/25 py-2 rounded-xl hover:bg-secondary"
        >
          둘러보기
        </button>
      </div>
    </TransitionGroup>
  </div>
</template>

<style scoped>
.card-remove-move {
  transition: transform 0.3s ease;
}
.card-remove-enter-active {
  transition:
    opacity 0.25s ease,
    transform 0.25s ease;
}
.card-remove-enter-from {
  opacity: 0;
  transform: translateY(8px);
}
.card-remove-leave-active {
  transition:
    opacity 0.25s ease,
    transform 0.25s ease;
}
.card-remove-leave-to {
  opacity: 0;
  transform: scale(0.92);
}
</style>
