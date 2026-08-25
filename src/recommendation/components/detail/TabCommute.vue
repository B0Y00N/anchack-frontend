<script setup>
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import { ArrowRight, Footprints, Train, Bus, MapPin } from 'lucide-vue-next'
import NeighborhoodMap from './NeighborhoodMap.vue'
import { resolveSubwayLineColor } from '../../utils/lineColors.js'

const props = defineProps({
  n: { type: Object, required: true },
  hash: { type: Number, required: true },
})

const isBus = computed(() => props.n.transportType === 'BUS')
const isBusAndSubway = computed(() => props.n.transportType === 'BUS_AND_SUBWAY')
const transitLabel = computed(() =>
  isBusAndSubway.value ? '버스 및 지하철' : isBus.value ? '버스' : '지하철',
)

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
    { label: '도보', min: props.n.walkMin, color: '#8ECBA9' },
    {
      label: transitLabel.value,
      min: props.n.transitMin,
      color: props.n.lineColor,
    },
    { label: '대기·환승', min: waitMin.value, color: '#C5D5CE' },
  ].filter((s) => s.min != null),
)

const segmentTotal = computed(() => segments.value.reduce((sum, segment) => sum + segment.min, 0) || 1)
const grown = ref(false)
let animationFrame = null
onMounted(() => {
  animationFrame = requestAnimationFrame(() => {
    animationFrame = requestAnimationFrame(() => {
      grown.value = true
    })
  })
})
onBeforeUnmount(() => {
  if (animationFrame != null) cancelAnimationFrame(animationFrame)
})

const routeSteps = computed(() => {
  if (!props.n.route) return []

  const parts = props.n.route
    .split(',')
    .map((part) => part.trim())
    .filter(Boolean)
  const steps = parts.map((part) => {
    const start = part.split(/\s*→\s*/)[0]?.trim() ?? part
    const subwayLine = start.match(/\d+호선|경의중앙선|수인분당선|신분당선|공항철도|경춘선|우이신설선|서해선|김포골드라인|신림선/)?.[0]
    return subwayLine
      ? { label: start, icon: Train, color: resolveSubwayLineColor(subwayLine) }
      : { label: start, icon: Bus, color: props.n.lineColor || '#6789CA' }
  })
  const destination = parts.at(-1)?.split(/\s*→\s*/).at(-1)?.trim()
  if (destination) steps.push({ label: destination, icon: Footprints, color: '#2D7A4F' })
  return steps
})
</script>

<template>
  <div class="space-y-5">
    <!-- 목적지 주소가 입력된 경우에만 통근 분석을 표시한다. 교통 시설 지도는
         목적지 유무와 무관하게 항상 확인할 수 있다. -->
    <template v-if="n.commuteTime != null">
      <div class="bg-card border border-border rounded-2xl p-6">
        <div class="grid grid-cols-2 divide-x divide-border border-b border-border pb-5 mb-5">
          <div class="text-center">
            <p class="text-3xl font-bold text-primary">{{ n.commuteTime }}분</p>
            <p class="mt-1 text-xs text-muted-foreground">예상 소요시간</p>
          </div>
          <div class="text-center">
            <p class="text-3xl font-bold text-primary">{{ n.transferCount }}회</p>
            <p class="mt-1 text-xs text-muted-foreground">환승 횟수</p>
          </div>
        </div>
        <div v-if="segments.length > 0" class="space-y-4">
          <div class="flex items-center gap-1 overflow-hidden rounded-full bg-muted h-5">
            <div
              v-for="segment in segments"
              :key="segment.label"
              class="h-full first:rounded-l-full last:rounded-r-full commute-segment"
              :style="{
                width: `${grown ? (segment.min / segmentTotal) * 100 : 0}%`,
                backgroundColor: segment.color,
              }"
            />
          </div>
          <div class="flex flex-wrap gap-x-5 gap-y-2">
            <span v-for="segment in segments" :key="segment.label" class="flex items-center gap-1.5 text-xs text-muted-foreground">
              <i class="h-2.5 w-2.5 rounded-full" :style="{ backgroundColor: segment.color }" />
              {{ segment.label }} <strong class="text-foreground">{{ segment.min }}분</strong>
            </span>
          </div>
        </div>
        <p v-else class="text-sm text-muted-foreground">구간별 소요시간 정보가 없어요.</p>
        <div v-if="routeSteps.length" class="mt-5 pt-4 border-t border-border">
          <p class="text-xs text-muted-foreground">주요 이용 노선</p>
          <div class="mt-2 flex flex-wrap items-center gap-x-2 gap-y-2 text-sm font-semibold text-foreground">
            <template v-for="(step, index) in routeSteps" :key="`${step.label}-${index}`">
              <ArrowRight v-if="index > 0" :size="15" class="text-muted-foreground" />
              <span class="flex items-center gap-1.5">
                <component :is="step.icon" :size="16" :style="{ color: step.color }" />
                {{ step.label }}
              </span>
            </template>
          </div>
        </div>
      </div>

      <div class="grid gap-4 sm:grid-cols-3">
        <div class="bg-card border border-border rounded-2xl p-5 text-center">
          <Train :size="20" class="mx-auto mb-2 text-primary" />
          <p class="text-2xl font-bold text-primary">{{ n.subwayStationCount ?? 0 }}개</p>
          <p class="mt-1 text-xs text-muted-foreground">지하철역 수</p>
        </div>
        <div class="bg-card border border-border rounded-2xl p-5 text-center">
          <Bus :size="20" class="mx-auto mb-2 text-primary" />
          <p class="text-2xl font-bold text-primary">{{ n.busStopCount ?? 0 }}개</p>
          <p class="mt-1 text-xs text-muted-foreground">버스정류장 수</p>
        </div>
        <div class="bg-card border border-border rounded-2xl p-5 text-center">
          <MapPin :size="20" class="mx-auto mb-2 text-primary" />
          <p class="truncate text-base font-bold text-primary" :title="n.nearestSubwayStation || undefined">
            {{ n.nearestSubwayStation || '정보 없음' }}
          </p>
          <p class="mt-1 text-xs text-muted-foreground">가장 가까운 지하철역</p>
        </div>
      </div>
    </template>
    <NeighborhoodMap
      :district="n.guName"
      :dong="n.dongName"
      :admin-dong-id="n.id"
      :hash="hash"
      mode="transit"
      :boundary-stroke-weight="3"
      :boundary-fill-opacity="0.25"
    />
  </div>
</template>

<style scoped>
.commute-segment {
  transition: width 0.85s cubic-bezier(0.22, 1, 0.36, 1);
}
</style>
