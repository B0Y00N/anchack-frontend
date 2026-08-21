<script setup>
import { Trash2, MapPin, ChevronRight, Loader2, RefreshCw, Banknote, Ruler, Clock, Repeat } from "lucide-vue-next";
import { formatSavedDate } from "../utils/formatSavedDate";

// GET /user-conditions/saved 응답 그대로: [{ conditionId, title, rentalType, destAddress,
// commuteType, maxCommuteTime, maxTransferCount, minArea, maxDeposit, maxRent, createdAt,
// latest }]. latest=false면 조건 생성 이후 admin_dong 지표 등이 갱신돼 저장된 결과가
// 최신이 아닐 수 있다는 뜻 - "결과 보기"를 눌러보지 않아도 목록에서 바로 알 수 있다.
// 이 경우 캐시된 결과를 그냥 보여주는 대신("view-results") 실제로 재계산을
// 요청하는 다른 이벤트("recompute")를 emit한다 - MyPageView.vue가 recompute는
// 온보딩 로딩 화면(/search/loading)을 거쳐 처리한다.
defineProps({
  savedConditions: { type: Array, required: true },
  // 지금 "결과 보기"를 눌러서 불러오는 중인 조건의 id. 그 카드 버튼만 로딩 표시하고
  // 나머지는 그대로 둔다(온보딩 로딩 화면 없이 버튼 자체가 바로 로딩 상태를 보여줌).
  loadingConditionId: { type: Number, default: null },
});
const emit = defineEmits(["navigate", "delete", "view-results", "recompute"]);

const RENTAL_TYPE_LABEL = { MONTHLY: "월세", JEONSE: "전세" };
const COMMUTE_TYPE_LABEL = { PUBLIC_TRANSIT: "대중교통", CAR: "자가용" };

function moneyLabel(c) {
  const deposit = c.maxDeposit ? `보증금 ${c.maxDeposit.toLocaleString()}만원` : null;
  const rent = c.maxRent ? `월 ${c.maxRent}만원` : null;
  return [deposit, rent].filter(Boolean).join(" · ") || "-";
}
</script>

<template>
  <div>
    <h2 class="text-lg font-bold text-foreground mb-1">저장한 조건</h2>
    <p class="text-sm text-muted-foreground mb-5">저장한 조건의 결과를 다시 확인할 수 있어요.</p>

    <div v-if="savedConditions.length === 0" class="text-center py-20 bg-card border border-border rounded-2xl">
      <div class="text-4xl mb-4">📋</div>
      <p class="font-semibold text-foreground mb-1">저장한 조건이 없어요</p>
      <p class="text-sm text-muted-foreground mb-6">동네 찾기 결과 화면에서 조건을 저장할 수 있어요.</p>
      <button
        @click="emit('navigate', 'step1')"
        class="bg-primary text-primary-foreground font-semibold px-6 py-2.5 rounded-full text-sm hover:bg-primary/90"
      >
        동네 찾기 시작
      </button>
    </div>

    <div v-else class="space-y-7">
      <div
        v-for="c in savedConditions"
        :key="c.conditionId"
        class="bg-card border border-border rounded-[20px] shadow-sm p-5 hover:shadow-md hover:-translate-y-0.5 transition-all duration-200"
      >
        <div class="flex items-start justify-between gap-3">
          <div class="min-w-0 flex-1 flex items-center flex-wrap gap-2">
            <h3 class="font-extrabold text-foreground text-[17px] truncate max-w-[170px]" :title="c.title">
              {{ c.title || "제목 없는 조건" }}
            </h3>
            <span
              v-if="c.latest"
              class="inline-flex items-center gap-1.5 bg-secondary text-primary text-[11px] font-bold pl-1.5 pr-2.5 py-1 rounded-full whitespace-nowrap"
            >
              <span class="w-1.5 h-1.5 rounded-full bg-primary flex-shrink-0"></span> 데이터가 최신 상태예요
            </span>
            <span
              v-else
              class="inline-flex items-center gap-1.5 bg-amber-50 text-amber-700 text-[11px] font-bold pl-1.5 pr-2.5 py-1 rounded-full whitespace-nowrap"
            >
              <span class="w-1.5 h-1.5 rounded-full bg-amber-500 flex-shrink-0"></span> 데이터가 갱신되었어요
            </span>
          </div>
          <button
            @click="emit('delete', c.conditionId)"
            aria-label="저장된 조건 삭제"
            class="p-2 -m-1 rounded-lg text-muted-foreground/60 hover:text-rose-600 hover:bg-rose-50 transition-colors flex-shrink-0"
          >
            <Trash2 :size="15" />
          </button>
        </div>

        <p class="text-xs text-muted-foreground/70 font-medium mt-0.5 mb-3.5">{{ formatSavedDate(c.createdAt) }} 저장</p>

        <div v-if="c.destAddress" class="flex items-center gap-1.5 text-[13px] text-foreground/80 font-medium mb-3.5">
          <MapPin :size="13" class="flex-shrink-0 text-muted-foreground" /> {{ c.destAddress }}
        </div>

        <div class="grid grid-cols-2 gap-2.5 mb-4">
          <div class="bg-secondary/60 border border-primary/10 rounded-xl px-3 py-2.5 flex flex-col gap-1.5">
            <span class="flex items-center gap-1.5 text-[11.5px] font-bold text-primary">
              <Banknote :size="12" /> {{ RENTAL_TYPE_LABEL[c.rentalType] ?? c.rentalType }}
            </span>
            <span class="text-[14.5px] font-bold text-foreground tracking-tight">{{ moneyLabel(c) }}</span>
            <span class="text-[11.5px] text-muted-foreground">보증금 · 월세 상한</span>
          </div>

          <div class="bg-secondary/60 border border-primary/10 rounded-xl px-3 py-2.5 flex flex-col gap-1.5">
            <span class="flex items-center gap-1.5 text-[11.5px] font-bold text-primary"><Ruler :size="12" /> 면적</span>
            <span class="text-[14.5px] font-bold text-foreground tracking-tight">
              {{ c.minArea != null ? `${c.minArea}㎡ 이상` : "조건 없음" }}
            </span>
            <span class="text-[11.5px] text-muted-foreground">최소 전용면적</span>
          </div>

          <div class="bg-secondary/60 border border-primary/10 rounded-xl px-3 py-2.5 flex flex-col gap-1.5">
            <span class="flex items-center gap-1.5 text-[11.5px] font-bold text-primary"><Clock :size="12" /> 통근</span>
            <span class="text-[14.5px] font-bold text-foreground tracking-tight">
              <template v-if="c.commuteType">{{ COMMUTE_TYPE_LABEL[c.commuteType] ?? c.commuteType }} {{ c.maxCommuteTime }}분 이내</template>
              <template v-else>조건 없음</template>
            </span>
            <span class="text-[11.5px] text-muted-foreground">{{ c.commuteType ? "기준 통근 수단" : "거리 제한 없이 탐색" }}</span>
          </div>

          <div class="bg-secondary/60 border border-primary/10 rounded-xl px-3 py-2.5 flex flex-col gap-1.5">
            <span class="flex items-center gap-1.5 text-[11.5px] font-bold text-primary"><Repeat :size="12" /> 환승</span>
            <span class="text-[14.5px] font-bold text-foreground tracking-tight">
              {{ c.maxTransferCount != null ? `${c.maxTransferCount}회 이내` : "조건 없음" }}
            </span>
            <span class="text-[11.5px] text-muted-foreground">{{ c.commuteType ? "대중교통 기준" : "통근 조건 미설정" }}</span>
          </div>
        </div>

        <div class="border-t border-border mb-4"></div>

        <button
          v-if="c.latest"
          @click="emit('view-results', c.conditionId)"
          :disabled="loadingConditionId === c.conditionId"
          class="w-full flex items-center justify-center gap-1.5 text-sm font-bold text-primary-foreground bg-primary py-3 rounded-xl hover:brightness-110 disabled:opacity-60 disabled:cursor-not-allowed"
        >
          <template v-if="loadingConditionId === c.conditionId">
            <Loader2 :size="14" class="animate-spin" /> 불러오는 중...
          </template>
          <template v-else> 결과 보기 <ChevronRight :size="14" /> </template>
        </button>
        <button
          v-else
          @click="emit('recompute', c.conditionId)"
          class="w-full flex items-center justify-center gap-1.5 text-sm font-bold text-primary bg-card border-[1.5px] border-primary py-3 rounded-xl hover:bg-secondary"
        >
          <RefreshCw :size="13" /> 다시 결과보기
        </button>
      </div>
    </div>
  </div>
</template>
