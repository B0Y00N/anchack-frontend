<script setup>
import { computed } from 'vue'
import { Shield } from 'lucide-vue-next'
import RadialGauge from '../../../common/components/RadialGauge.vue'
import NeighborhoodMap from './NeighborhoodMap.vue'
import { formatOneDecimal } from '../../../common/utils/formatNumber'

const props = defineProps({
  n: { type: Object, required: true },
  hash: { type: Number, required: true },
})

const SAFETY_COLORS = {
  red: '#E56B6F',
  yellow: '#F0B87A',
  green: '#52B37A',
  sky: '#4A90D9',
  pink: '#FF4FB8',
}

function safetyColor(value) {
  if (value > 60) return SAFETY_COLORS.pink
  if (value >= 55) return SAFETY_COLORS.sky
  if (value >= 50) return SAFETY_COLORS.green
  if (value >= 45) return SAFETY_COLORS.yellow
  return SAFETY_COLORS.red
}

function crimeColor(value) {
  if (value >= 95) return SAFETY_COLORS.red
  if (value >= 80) return SAFETY_COLORS.green
  if (value >= 65) return SAFETY_COLORS.sky
  return SAFETY_COLORS.pink
}

const safetyScoreMax = computed(() => {
  const max = Number(props.n.safetyScoreMax)
  const score = Number(props.n.safetyScore)
  return Number.isFinite(max) && max > 0 ? Math.max(max, score) : 100
})

const safetyMetrics = computed(() => [
  { label: 'CCTV 개수', val: `${formatOneDecimal(props.n.cctv)}대`, color: SAFETY_COLORS.sky },
  { label: '안심벨 수', val: `${formatOneDecimal(props.n.safetyBellCount)}개`, color: SAFETY_COLORS.green },
  { label: '인구 1만명당 범죄', val: `${formatOneDecimal(props.n.crimeRate)}건`, color: crimeColor(props.n.crimeRate) },
])
</script>

<template>
  <div class="space-y-5">
    <div class="bg-card border border-border rounded-2xl p-6 flex items-center gap-8">
      <RadialGauge
        label="종합 안전 점수"
        :value="n.safetyScore"
        :max-value="safetyScoreMax"
        :color="safetyColor(n.safetyScore)"
        :size="124"
        :thickness="12"
      />
      <div class="grid flex-1 grid-cols-3 gap-3 border-l border-border pl-8">
        <div
          v-for="item in safetyMetrics"
          :key="item.label"
          class="rounded-2xl bg-muted/45 p-4 text-center"
        >
          <p class="text-2xl font-bold mb-1" :style="{ color: item.color }">{{ item.val }}</p>
          <p class="text-xs text-muted-foreground">{{ item.label }}</p>
        </div>
      </div>
    </div>
    <div class="bg-card border border-border rounded-2xl p-5 flex items-start gap-3">
      <Shield :size="18" class="text-primary mt-0.5 flex-shrink-0" />
      <div>
        <p class="font-semibold text-foreground text-sm mb-1">가까운 경찰관서</p>
        <p class="text-sm text-foreground/80">{{ n.police }}</p>
      </div>
    </div>
    <NeighborhoodMap
      :district="n.guName"
      :dong="n.dongName"
      :admin-dong-id="n.id ?? n.adminDongId"
      :hash="hash"
      mode="safety"
      :boundary-stroke-weight="3"
      :boundary-fill-opacity="0.25"
    />
  </div>
</template>
