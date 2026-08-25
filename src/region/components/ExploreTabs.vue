<script setup>
import { ref, computed, toRefs } from 'vue'
import { Bus, Train } from 'lucide-vue-next'
import NeighborhoodMap from '../../recommendation/components/detail/NeighborhoodMap.vue'
import TabSafety from '../../recommendation/components/detail/TabSafety.vue'
import TabInfra from '../../recommendation/components/detail/TabInfra.vue'
import TabHousing from '../../recommendation/components/detail/TabHousing.vue'
import TabReview from '../../review/components/TabReview.vue'
import { REVIEW_CATEGORIES } from '../../review/constants.js'
import { formatOneDecimal } from '../../common/utils/formatNumber'

const props = defineProps({
  district: { type: String, required: true },
  dong: { type: String, required: true },
  adminDongId: { type: Number, default: null },
  detail: { type: Object, default: null },
  reviews: { type: Array, required: true },
  stats: { type: Object, required: true }, // ExploreView에서 계산해 내려줌 (ExploreHeader와 공유)
  hash: { type: Number, required: true },
})
const emit = defineEmits(['write-review', 'listings'])

const TABS = ['교통', '치안', '생활 인프라', '주거비', '리뷰']
const tab = ref('교통')

function selectTab(nextTab) {
  if (tab.value === nextTab) return
  tab.value = nextTab
}

const { hash } = toRefs(props)
const MAP_MODE_BY_TAB = { 교통: 'transit' }
const mapMode = computed(() => MAP_MODE_BY_TAB[tab.value] ?? null)

const nearestSubway = computed(() => {
  const value = props.detail?.nearestSubwayStation
  if (!value) return { name: '정보 없음', walkTime: null }

  const matched = value.match(/^(.*?)\s*\((도보\s+\d+분)\)$/)
  return matched
    ? { name: matched[1], walkTime: matched[2] }
    : { name: value, walkTime: null }
})

const transitRating = computed(() => {
  const score = Number(props.detail?.transitScore)
  if (!Number.isFinite(score)) return { color: '#64748B', label: null }
  if (score > 19.97) return { color: '#FF1493', label: '매우 좋음' }
  if (score > 12.73) return { color: '#4A90D9', label: '좋음' }
  if (score > 7.72) return { color: '#52B37A', label: '보통' }
  if (score > 3.49) return { color: '#F0B87A', label: '낮음' }
  return { color: '#E56B6F', label: '매우 낮음' }
})

const avgOverall = computed(() =>
  props.reviews.length > 0
    ? props.reviews.reduce((s, r) => s + r.overallRating, 0) / props.reviews.length
    : 0,
)
const catAvgs = computed(() =>
  REVIEW_CATEGORIES.map((cat) => ({
    cat,
    avg:
      props.reviews.length > 0
        ? props.reviews.reduce((s, r) => s + (r.ratings[cat] || 0), 0) / props.reviews.length
        : 0,
  })),
)
</script>

<template>
  <div>
    <div class="max-w-5xl mx-auto w-full px-8 flex">
      <button
        v-for="t in TABS"
        :key="t"
        @click="selectTab(t)"
        :class="`px-6 py-3.5 text-sm font-semibold border-b-2 transition-colors ${tab === t ? 'border-primary text-primary' : 'border-transparent text-muted-foreground hover:text-foreground'}`"
      >
        {{ t === '리뷰' ? `리뷰${reviews.length > 0 ? ` ${reviews.length}` : ''}` : t }}
      </button>
    </div>

    <div>
      <div class="max-w-5xl mx-auto px-8 py-8">
        <TabInfra
          v-if="tab === '생활 인프라' && detail"
          :n="detail"
          :hash="hash"
        />
        <div v-else-if="tab === '생활 인프라'" class="py-16 text-center text-sm text-muted-foreground">
          생활 인프라 정보를 불러오는 중이에요.
        </div>

        <TabSafety
          v-else-if="tab === '치안' && detail"
          :n="detail"
          :hash="hash"
        />
        <div v-else-if="tab === '치안'" class="py-16 text-center text-sm text-muted-foreground">
          치안 정보를 불러오는 중이에요.
        </div>

        <div v-else-if="tab === '교통'" class="space-y-5">
          <div v-if="detail" class="bg-card border border-border rounded-2xl p-6 text-center">
            <p class="text-xs text-muted-foreground">교통 접근성 점수</p>
            <p class="mt-1 text-4xl font-bold" :style="{ color: transitRating.color }">
              {{ detail.transitScore != null ? `${formatOneDecimal(detail.transitScore)}점` : '정보 없음' }}
            </p>
            <p v-if="transitRating.label" class="mt-1 text-xs font-semibold" :style="{ color: transitRating.color }">
              {{ transitRating.label }}
            </p>
            <p class="mt-2 text-xs text-muted-foreground">지하철역·버스정류장 밀도를 인구와 면적 기준으로 비교한 점수예요.</p>
          </div>
          <div v-if="detail" class="grid gap-4 sm:grid-cols-3">
            <div class="bg-card border border-border rounded-2xl p-5 text-center">
              <Train :size="20" class="mx-auto mb-2 text-primary" />
              <p class="text-2xl font-bold text-primary">{{ detail.subwayStationCount ?? 0 }}개</p>
              <p class="mt-1 text-xs text-muted-foreground">지하철역 수</p>
            </div>
            <div class="bg-card border border-border rounded-2xl p-5 text-center">
              <Bus :size="20" class="mx-auto mb-2 text-primary" />
              <p class="text-2xl font-bold text-primary">{{ detail.busStopCount ?? 0 }}개</p>
              <p class="mt-1 text-xs text-muted-foreground">버스정류장 수</p>
            </div>
            <div class="bg-card border border-border rounded-2xl p-5 text-center">
              <Train :size="20" class="mx-auto mb-2 text-primary" />
              <p class="truncate text-base font-bold text-primary" :title="nearestSubway.name">
                {{ nearestSubway.name }}
              </p>
              <p v-if="nearestSubway.walkTime" class="mt-0.5 text-xs text-muted-foreground">{{ nearestSubway.walkTime }}</p>
              <p class="mt-1 text-xs text-muted-foreground">가장 가까운 지하철역</p>
            </div>
          </div>
          <div v-else class="py-16 text-center text-sm text-muted-foreground">
            교통 정보를 불러오는 중이에요.
          </div>
        </div>

        <TabHousing
          v-else-if="tab === '주거비' && detail"
          :n="detail"
          @listings="emit('listings')"
        />
        <div v-else-if="tab === '주거비'" class="py-16 text-center text-sm text-muted-foreground">
          주거비 정보를 불러오는 중이에요.
        </div>

        <TabReview
          v-else-if="tab === '리뷰'"
          :reviews="reviews"
          :avg-overall="avgOverall"
          :cat-avgs="catAvgs"
          @write-review="emit('write-review')"
        />

        <NeighborhoodMap
          v-if="mapMode"
          :district="district"
          :dong="dong"
          :admin-dong-id="adminDongId"
          :hash="hash"
          :mode="mapMode"
          :focus-zoom-level="6"
          :max-zoom-level="6"
          :boundary-stroke-weight="3"
          :boundary-fill-opacity="0.25"
        />
      </div>
    </div>
  </div>
</template>
