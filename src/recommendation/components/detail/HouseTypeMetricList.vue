<script setup>
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import { formatOneDecimal } from '../../../common/utils/formatNumber'

const props = defineProps({
  metrics: { type: Array, default: () => [] },
  isJeonse: { type: Boolean, default: false },
})

const COLORS = ['#2D7A4F', '#4A90D9', '#FF4FB8', '#F0B87A', '#E56B6F', '#8B5CF6']
const size = 108
const thickness = 14
const radius = (size - thickness) / 2
const circumference = 2 * Math.PI * radius
const totalTransactions = computed(() =>
  props.metrics.reduce((sum, metric) => sum + Number(metric.transactionCount || 0), 0),
)

const progress = ref(0)
let animationFrame = null
onMounted(() => {
  animationFrame = requestAnimationFrame(() => {
    animationFrame = requestAnimationFrame(() => {
      progress.value = 1
    })
  })
})
onBeforeUnmount(() => {
  if (animationFrame != null) cancelAnimationFrame(animationFrame)
})

function dash(metric) {
  if (totalTransactions.value <= 0) return 0
  return (Number(metric.transactionCount || 0) / totalTransactions.value) * circumference * progress.value
}

function formatAmount(value) {
  const number = Number(value)
  return Number.isFinite(number) ? `${number.toLocaleString()}만원` : '정보 없음'
}
</script>

<template>
  <div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
    <div
      v-for="(metric, index) in metrics"
      :key="metric.houseType"
      class="flex items-center gap-4 rounded-2xl bg-muted/35 p-4"
    >
      <div class="relative shrink-0" :style="{ width: `${size}px`, height: `${size}px` }">
        <svg :width="size" :height="size" :viewBox="`0 0 ${size} ${size}`">
          <g :transform="`rotate(-90 ${size / 2} ${size / 2})`">
            <circle :cx="size / 2" :cy="size / 2" :r="radius" fill="none" stroke="#D9E3DE" :stroke-width="thickness" />
            <circle
              :cx="size / 2"
              :cy="size / 2"
              :r="radius"
              fill="none"
              :stroke="COLORS[index % COLORS.length]"
              :stroke-width="thickness"
              :stroke-dasharray="`${dash(metric)} ${circumference - dash(metric)}`"
              stroke-linecap="round"
              class="metric-arc"
            />
          </g>
        </svg>
        <div class="absolute inset-0 flex flex-col items-center justify-center text-center">
          <span class="text-sm font-bold text-foreground leading-tight">{{ metric.houseType }}</span>
          <span class="mt-1 text-xs font-semibold text-muted-foreground">{{ metric.transactionCount }}</span>
        </div>
      </div>
      <div class="min-w-0 flex-1 space-y-1.5 text-xs">
        <p class="flex justify-between gap-2"><span class="text-muted-foreground">평균 면적</span><strong class="text-foreground">{{ formatOneDecimal(metric.avgArea) }}㎡</strong></p>
        <p class="flex justify-between gap-2"><span class="text-muted-foreground">{{ isJeonse ? '평균 전세금' : '평균 보증금' }}</span><strong class="text-foreground">{{ formatAmount(metric.avgDeposit) }}</strong></p>
        <p v-if="!isJeonse" class="flex justify-between gap-2"><span class="text-muted-foreground">평균 월세</span><strong class="text-foreground">{{ formatAmount(metric.avgRent) }}</strong></p>
      </div>
    </div>
  </div>
</template>

<style scoped>
.metric-arc {
  transition: stroke-dasharray 0.85s cubic-bezier(0.22, 1, 0.36, 1);
}
</style>
