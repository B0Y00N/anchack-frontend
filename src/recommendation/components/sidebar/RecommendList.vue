<script setup>
import { computed, ref, watch } from "vue";
import { AlertCircle, Check, BookOpen, RefreshCw, TrendingUp } from "lucide-vue-next";
import NeighborhoodCard from "./NeighborhoodCard.vue";
import { RELAXATION_HINTS } from "../../../common/utils/mockData";
import { useAuthStore } from "../../../user/stores/useAuthStore";

const authStore = useAuthStore();

const props = defineProps({
  neighborhoods: { type: Array, required: true },
  compareList: { type: Array, required: true },
  savedNeighborhoods: { type: Array, required: true },
  conditionSaved: { type: Boolean, default: false },
  // 예산순 정렬에 쓸 필드(월세/전세)를 고르는 데 필요 - 조건 입력에서 고른 값 그대로("월세"|"전세")
  rentType: { type: String, default: "월세" },
  // admin-dongs/batch(월세 시세/치안 점수) 로딩 상태. 예산순/치안순은 이 데이터가 있어야 정렬 가능
  detailsStatus: { type: String, default: "idle" },
});
const emit = defineEmits(["detail", "compare", "toggle-save", "go-compare", "save-condition-click", "show-saved-list"]);

// destAddress를 안 넣은 검색(구 단위 검색)이면 recommendations 전체가 commuteTime=null로
// 온다 - 이 경우 통근시간순은 정렬할 값 자체가 없다.
const hasCommuteTime = computed(() => props.neighborhoods.some((n) => n.commuteTime != null));
const detailsReady = computed(() => props.detailsStatus === "success");

const FILTER_OPTIONS = [
  { key: "score", label: "추천순" },
  { key: "commute", label: "통근시간순" },
  { key: "budget", label: "예산순" },
  { key: "safety", label: "치안순" },
];
const filters = computed(() =>
  FILTER_OPTIONS.map((f) => {
    if (f.key === "commute" && !hasCommuteTime.value) {
      return { ...f, disabled: true, tooltip: "통근지가 입력되지 않았어요" };
    }
    if ((f.key === "budget" || f.key === "safety") && !detailsReady.value) {
      return { ...f, disabled: true, tooltip: "정보를 불러오는 중이에요" };
    }
    return { ...f, disabled: false, tooltip: "" };
  }),
);

const activeFilter = ref("score");
function selectFilter(f) {
  if (f.disabled) return;
  activeFilter.value = f.key;
}

// 새 검색을 시작하면 detailsReady/hasCommuteTime이 다시 false가 되면서 지금 선택돼
// 있던 필터가 비활성화될 수 있다(예: 치안순 보다가 재검색). 그대로 두면 아직 없는
// 필드로 계속 정렬하면서 비활성 버튼이 선택된 것처럼 보이므로 추천순으로 되돌린다.
watch(filters, (fs) => {
  const active = fs.find((f) => f.key === activeFilter.value);
  if (active?.disabled) activeFilter.value = "score";
});

// 필터 버튼 줄이 overflow-x-auto라 툴팁을 그 안에서 absolute로 띄우면 스크롤
// 컨테이너의 페인트/쌓임 순서에 갇혀 아래 카드 목록에 가려진다. body로 순간이동시켜서
// 어떤 부모의 overflow/z-index와도 무관하게 항상 맨 위에 뜨게 한다.
const hoveredTooltip = ref(null);
const tooltipPos = ref({ x: 0, y: 0 });
function onFilterHover(f, event) {
  if (!f.disabled || !f.tooltip) {
    hoveredTooltip.value = null;
    return;
  }
  hoveredTooltip.value = f.tooltip;
  const rect = event.currentTarget.getBoundingClientRect();
  tooltipPos.value = { x: rect.left + rect.width / 2, y: rect.bottom + 8 };
}

// null(값이 없는 동)은 항상 뒤로 보낸다.
function compareNullable(a, b, ascending) {
  if (a == null && b == null) return 0;
  if (a == null) return 1;
  if (b == null) return -1;
  return ascending ? a - b : b - a;
}

const sortedNeighborhoods = computed(() => {
  const list = [...props.neighborhoods];
  switch (activeFilter.value) {
    case "commute":
      return list.sort((a, b) => compareNullable(a.commuteTime, b.commuteTime, true));
    case "budget": {
      const field = props.rentType === "전세" ? "deposit" : "monthly";
      return list.sort((a, b) => compareNullable(a[field], b[field], true));
    }
    case "safety":
      return list.sort((a, b) => compareNullable(a.safetyScore, b.safetyScore, false));
    case "score":
    default:
      return list.sort((a, b) => compareNullable(a.score, b.score, false));
  }
});

// 비교 대상은 현재 목록에 있는 동 이름으로만 표시한다.
const compareNames = computed(() =>
  props.compareList
    .map((id) => props.neighborhoods.find((n) => n.id === id)?.dongName)
    .filter(Boolean)
    .join(", "),
);
</script>

<template>
  <div class="w-[430px] flex-shrink-0 flex flex-col border-r border-border bg-background">
    <div class="px-6 pt-6 pb-4 border-b border-border">
      <div v-if="neighborhoods.length === 0" class="flex items-center gap-2 text-amber-600"><AlertCircle :size="18" /><h2 class="text-lg font-bold">검색 결과 0건</h2></div>
      <template v-else>
        <h2 class="text-xl font-bold text-foreground mb-1.5">{{ authStore.user?.nickname || "회원" }}님에게 잘 맞는 동네 {{ neighborhoods.length }}곳을 찾았어요</h2>
        <p class="text-sm text-muted-foreground">추천 이유와 아쉬운 점을 함께 비교해보세요.</p>
      </template>

      <div v-if="neighborhoods.length > 0" class="mt-3 flex items-center gap-2">
        <button v-if="!conditionSaved" @click="emit('save-condition-click')" class="flex items-center gap-1.5 text-xs font-semibold text-muted-foreground border border-border px-3 py-1.5 rounded-full hover:bg-secondary hover:text-primary transition-colors">
          <Check :size="12" /> 이 조건 저장하기
        </button>
        <template v-else>
          <span class="flex items-center gap-1 text-xs font-semibold text-emerald-600"><Check :size="12" /> 저장 완료</span>
          <button @click="emit('show-saved-list')" class="flex items-center gap-1.5 text-xs font-semibold text-primary border border-primary/30 bg-secondary px-3 py-1.5 rounded-full hover:bg-primary hover:text-primary-foreground transition-colors">
            <BookOpen :size="12" /> 저장된 조건 확인
          </button>
        </template>
      </div>
    </div>

    <div v-if="neighborhoods.length > 0" class="px-5 py-3 flex gap-2 overflow-x-auto border-b border-border [&::-webkit-scrollbar]:hidden">
      <div
        v-for="f in filters"
        :key="f.key"
        class="flex-shrink-0"
        @mouseenter="onFilterHover(f, $event)"
        @mouseleave="hoveredTooltip = null"
      >
        <button
          :disabled="f.disabled"
          @click="selectFilter(f)"
          :class="`px-3 py-1.5 rounded-full text-xs font-semibold border whitespace-nowrap ${
            f.disabled
              ? 'pointer-events-none bg-muted text-muted-foreground/50 border-border cursor-not-allowed'
              : f.key === activeFilter
                ? 'bg-primary text-primary-foreground border-primary'
                : 'bg-white border-border hover:bg-secondary'
          }`"
        >
          {{ f.key === activeFilter ? "✓ " : "" }}{{ f.label }}
        </button>
      </div>
    </div>

    <Teleport to="body">
      <div
        v-if="hoveredTooltip"
        class="fixed z-[200] -translate-x-1/2 pointer-events-none whitespace-nowrap rounded-lg bg-foreground px-3 py-2 text-center text-xs text-white shadow-lg"
        :style="{ left: tooltipPos.x + 'px', top: tooltipPos.y + 'px' }"
      >
        {{ hoveredTooltip }}
      </div>
    </Teleport>

    <div v-if="compareList.length >= 2 && neighborhoods.length > 0" class="px-5 py-3 bg-secondary flex items-center justify-between border-b border-primary/15">
      <div class="flex items-center gap-2 min-w-0"><RefreshCw :size="13" class="text-primary flex-shrink-0" /><span class="text-sm font-medium text-primary truncate">{{ compareNames }} 비교 중</span></div>
      <button @click="emit('go-compare')" class="ml-3 flex-shrink-0 text-xs font-bold text-primary bg-white px-3 py-1.5 rounded-full border border-primary/25 hover:bg-primary hover:text-white">비교 보기 →</button>
    </div>

    <div class="flex-1 overflow-y-auto [&::-webkit-scrollbar]:hidden">
      <div v-if="neighborhoods.length === 0" class="p-4">
        <div class="bg-amber-50 border border-amber-200 rounded-2xl p-5">
          <p class="text-sm font-semibold text-amber-800 mb-3">조건을 완화하면 동네를 찾을 수 있어요</p>
          <div class="space-y-3">
            <div v-for="(h, i) in RELAXATION_HINTS" :key="i" class="flex items-center justify-between bg-white rounded-xl px-4 py-3 border border-amber-100">
              <p class="text-xs text-foreground/80 flex-1">{{ h.condition }}</p>
              <span class="ml-3 flex-shrink-0 bg-primary text-primary-foreground text-xs font-bold px-2.5 py-1 rounded-full">+{{ h.add }}곳</span>
            </div>
          </div>
        </div>
      </div>

      <div v-else class="p-4 space-y-3">
        <TransitionGroup name="card-sort" tag="div" class="space-y-3 relative">
          <NeighborhoodCard
            v-for="(n, i) in sortedNeighborhoods"
            :key="n.id"
            :n="n"
            :rank="i + 1"
            :compare-list="compareList"
            :is-saved="savedNeighborhoods.includes(n.id)"
            @detail="emit('detail', n.id)"
            @compare="emit('compare', n.id)"
            @toggle-save="emit('toggle-save', n.id)"
          />
        </TransitionGroup>
        <div class="bg-card border border-border rounded-2xl p-5">
          <div class="flex items-center gap-2 mb-3"><TrendingUp :size="15" class="text-primary" /><p class="text-sm font-semibold text-foreground">조건을 완화하면 더 많은 동네가 있어요</p></div>
          <div class="space-y-2">
            <div v-for="(h, i) in RELAXATION_HINTS" :key="i" class="flex items-center justify-between bg-secondary rounded-xl px-3 py-2.5">
              <p class="text-xs text-foreground/75">{{ h.condition }}</p>
              <span class="ml-2 bg-primary/10 text-primary text-xs font-bold px-2 py-0.5 rounded-full">+{{ h.add }}곳</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* 정렬 기준이 바뀔 때 카드가 새 위치로 스르륵 미끄러지도록(FLIP) */
.card-sort-move {
  transition: transform 0.35s ease;
}
.card-sort-enter-active,
.card-sort-leave-active {
  transition:
    opacity 0.2s ease,
    transform 0.2s ease;
}
.card-sort-enter-from,
.card-sort-leave-to {
  opacity: 0;
  transform: translateY(8px);
}
/* 카드가 빠지는 동안 남은 카드들이 문서 흐름을 기준으로 바로 자리를 채우도록 */
.card-sort-leave-active {
  position: absolute;
  width: 100%;
}
</style>
