<script setup>
import { computed } from 'vue'
import { Footprints, Train, Bus, Clock } from 'lucide-vue-next'
import DonutChart from '../../../common/components/DonutChart.vue'
import NeighborhoodMap from './NeighborhoodMap.vue'

const props = defineProps({
  n: { type: Object, required: true },
  hash: { type: Number, required: true },
})

const isBus = computed(() => props.n.transportType === 'BUS')

// 대기·환승 시간은 별도 필드로 안 내려온다. commuteTime에서 도보/탑승 시간을 뺀
// 나머지로 역산한다(walkMin/transitMin이 null이면 0으로 취급). 단, 둘 다 null이면
// "전체가 대기시간"이라는 잘못된 값이 나오므로 그 경우엔 계산하지 않는다.
const waitMin = computed(() => {
  const { commuteTime, walkMin, transitMin } = props.n
  if (commuteTime == null) return null
  if (walkMin == null && transitMin == null) return null
  const remaining = commuteTime - (walkMin ?? 0) - (transitMin ?? 0)
  return remaining > 0 ? remaining : null
})

// 카카오 경로 응답이 step을 안 쪼개는 구간(환승 없는 단거리 등)이 있어
// walkMin/transitMin은 각각 null일 수 있다. null인 구간은 도넛에서 빼고,
// 하나도 안 남으면(전부 null) 도넛 자체를 렌더링하지 않는다(구간 합이 commuteTime과
// 안 맞는 반쪽짜리 도넛을 보여주는 대신, 아래에서 안내 문구로 대체).
const segments = computed(() =>
  [
    { label: '도보', icon: Footprints, min: props.n.walkMin, color: '#8ECBA9' },
    {
      label: isBus.value ? '버스' : '지하철',
      icon: isBus.value ? Bus : Train,
      min: props.n.transitMin,
      color: props.n.lineColor,
    },
    { label: '대기·환승', icon: Clock, min: waitMin.value, color: '#C5D5CE' },
  ].filter((s) => s.min != null),
)

const donutData = computed(() =>
  segments.value.map((s) => ({ label: s.label, value: s.min, color: s.color })),
)
</script>

<template>
  <div class="space-y-5">
    <!-- 목적지 의존적인 정보(예상 소요시간/환승/구간별 분석)는 목적지를 입력하지 않은
         검색(guCodes 기반)이면 아예 없다. 반면 아래 지도(교통 시설)는 목적지와 무관하게
         항상 유효한 정보라 목적지 유무와 상관없이 계속 보여준다. -->
    <template v-if="n.commuteTime != null">
      <div class="grid grid-cols-3 gap-4">
        <div
          v-for="item in [
            { label: '예상 소요시간', value: `${n.commuteTime}분` },
            { label: '환승 횟수', value: `${n.transferCount}회` },
            { label: '주요 노선', value: n.lineNum ? (isBus ? `${n.lineNum}번` : n.lineNum) : '정보 없음' },
          ]"
          :key="item.label"
          class="bg-card border border-border rounded-2xl p-5 text-center"
        >
          <p class="text-3xl font-bold text-primary mb-1">{{ item.value }}</p>
          <p class="text-xs text-muted-foreground">{{ item.label }}</p>
        </div>
      </div>

      <div class="bg-card border border-border rounded-2xl p-6">
        <h4 class="font-semibold text-foreground mb-5">구간별 소요시간</h4>
        <DonutChart
          v-if="segments.length > 0"
          :data="donutData"
          :center-value="`${n.commuteTime}분`"
          center-label="총 소요시간"
        />
        <p v-else class="text-sm text-muted-foreground">구간별 소요시간 정보가 없어요.</p>
        <div v-if="n.route" class="mt-5 pt-4 border-t border-border">
          <p class="text-xs text-muted-foreground">주요 이용 노선</p>
          <p class="text-sm font-semibold text-foreground mt-1">{{ n.route }}</p>
        </div>
      </div>
    </template>
    <p v-else class="text-sm text-muted-foreground bg-card border border-border rounded-2xl p-6">
      목적지를 입력하지 않아 통근 정보를 계산할 수 없어요. 아래에서 주변 교통 시설은 확인할 수 있어요.
    </p>

    <NeighborhoodMap :dong="n.dongName" :admin-dong-id="n.id" :hash="hash" mode="transit" :boundary-stroke-weight="3" :boundary-fill-opacity="0.25" />
  </div>
</template>
