<script setup>
import { computed } from 'vue'
import { Footprints, Train, Clock } from 'lucide-vue-next'
import DonutChart from '../../../common/components/DonutChart.vue'
import NeighborhoodMap from './NeighborhoodMap.vue'

const props = defineProps({
  n: { type: Object, required: true },
  hash: { type: Number, required: true },
})

// 카카오 경로 응답이 step을 안 쪼개는 구간(환승 없는 단거리 등)이 있어
// walkMin/subwayMin/transferMin은 각각 null일 수 있다. null인 구간은 도넛에서 빼고,
// 하나도 안 남으면(전부 null) 도넛 자체를 렌더링하지 않는다(구간 합이 commuteTime과
// 안 맞는 반쪽짜리 도넛을 보여주는 대신, 아래에서 안내 문구로 대체).
const segments = computed(() =>
  [
    { label: '도보', icon: Footprints, min: props.n.walkMin, color: '#8ECBA9' },
    { label: '지하철', icon: Train, min: props.n.subwayMin, color: props.n.lineColor },
    { label: '환승 대기', icon: Clock, min: props.n.transferMin, color: '#C5D5CE' },
  ].filter((s) => s.min != null),
)

const donutData = computed(() =>
  segments.value.map((s) => ({ label: s.label, value: s.min, color: s.color })),
)
</script>

<template>
  <div class="space-y-5">
    <div class="grid grid-cols-3 gap-4">
      <div
        v-for="item in [
          { label: '예상 소요시간', value: `${n.commuteTime}분` },
          { label: '환승 횟수', value: `${n.transfers}회` },
          { label: '주요 노선', value: n.lineNum + '호선' },
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
      <div class="mt-5 pt-4 border-t border-border">
        <p class="text-xs text-muted-foreground">주요 이용 노선</p>
        <p class="text-sm font-semibold text-foreground mt-1">{{ n.route }}</p>
      </div>
    </div>

    <NeighborhoodMap :dong="n.id" :hash="hash" mode="transit" />
  </div>
</template>
