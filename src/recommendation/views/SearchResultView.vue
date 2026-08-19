<script setup>
import { computed, onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import RecommendList from '../components/sidebar/RecommendList.vue'
import SaveConditionModal from '../components/sidebar/SaveConditionModal.vue'
import SavedConditionsListModal from '../components/sidebar/SavedConditionsListModal.vue'
import ResultMap from '../components/main/ResultMap.vue'
import CompareTable from '../components/main/CompareTable.vue'
import ListingsPanel from '../components/main/ListingsPanel.vue'
import DetailPanel from '../components/detail/DetailPanel.vue'
import BaseToast from '../../common/components/BaseToast.vue'
import { useSearchStore } from '@/condition/stores/useSearchStore.js'
import { useRecommendationStore } from '@/recommendation/stores/useRecommendationStore.js'
import { useNeighborhoodStore } from '@/region/stores/useNeighborhoodStore.js'
import { useMyPageStore } from '@/mypage/stores/useMyPageStore.js'
import { resolveLineColor } from '@/recommendation/utils/lineColors.js'

const route = useRoute()
const router = useRouter()
const search = useSearchStore()
const recommendation = useRecommendationStore()
const nbhd = useNeighborhoodStore()
const mypage = useMyPageStore()

// 새로고침으로 sessionStorage에서 recommendations를 복구했는데, 그 순간 detailsById가
// 비어 있는 채였다면(예: 원래 세션에서 fetchDetails가 끝나기 전에 새로고침됨) 아무도
// 다시 요청해주지 않아 상세 화면이 로딩 상태로 멈춘다. 진입 시 한 번 확인해서 이어준다.
onMounted(() => {
  if (recommendation.recommendations.length > 0 && recommendation.detailsStatus === 'idle') {
    recommendation.fetchDetails()
  }
})

// 실제 API 응답을 카드/상세 화면이 쓰는 모양으로 다듬는다.
// guName/dongName/lat/lng는 P0, deposit/monthly/rentDist/cctv/police/crimeRate/safetyScore/
// gyms/convenience/hospitals/parks/department/mart는 P1-b(admin-dongs/batch)에서 채워진다.
// route/transportType/lineNum/vehicleType/walkMin/subwayMin/transferMin(P1-a)은 목적지를
// 안 넣은 검색이면 없을 수 있어 TabCommute.vue가 undefined를 안전하게 처리한다.
// lineColor는 백엔드가 안 주고(카카오 응답에 없음) transportType/lineNum/vehicleType으로
// 프론트가 계산한다(lineColors.js 참고).
const neighborhoods = computed(() =>
  recommendation.recommendations.map((r) => ({
    id: r.adminDongId,
    guName: r.guName,
    dongName: r.dongName,
    rank: r.rank,
    score: r.totalScore,
    dataCoverageRate: r.dataCoverageRate,
    commuteTime: r.commuteTime,
    transferCount: r.transferCount,
    route: r.route,
    transportType: r.transportType,
    lineNum: r.lineNum,
    vehicleType: r.vehicleType,
    lineColor: resolveLineColor({ transportType: r.transportType, lineNum: r.lineNum, vehicleType: r.vehicleType }),
    walkMin: r.walkMin,
    subwayMin: r.subwayMin,
    transferMin: r.transferMin,
    pros: r.recommendationReason ? r.recommendationReason.split(',').map((s) => s.trim()) : [],
    cons: r.caution ? r.caution.split(',').map((s) => s.trim()) : [],
    ...recommendation.detailsById[r.adminDongId],
  })),
)

// ResultMap이 핀을 찍는 데 쓰는 모양(id/lat/lng)으로 변환.
// id는 지도 뱃지 표시 및 geojson 행정동 경계 매칭에 dongName을 그대로 사용한다(ResultMap.vue 참고).
const mapRecommendations = computed(() =>
  recommendation.recommendations.map((r) => ({
    id: r.dongName,
    lat: Number(r.lat),
    lng: Number(r.lng),
  })),
)

const mode = computed(() => {
  if (route.path.endsWith('/compare')) return 'compare'
  if (route.path.endsWith('/listings')) return 'listings'
  if (route.params.id) return 'detail'
  return 'results'
})

const showSaveModal = ref(false)
const showSavedListModal = ref(false)
const conditionSaved = ref(false)
const toast = ref(null)

const selectedId = computed(() => (route.params.id != null ? Number(route.params.id) : null))
const selectedNeighborhood = computed(() => neighborhoods.value.find((n) => n.id === selectedId.value))
// admin-dongs/batch는 추천 성공 직후 한 번에 조회되지만, 그 응답이 오기 전에 사용자가
// 카드를 눌러 상세로 들어올 수 있어 이 id의 상세 정보가 아직 왔는지 별도로 확인한다.
const detailReady = computed(() => selectedId.value != null && recommendation.detailsById[selectedId.value] != null)

function goDetail(id) {
  router.push(`/search/results/${id}`)
}
function toggleCompare(id) {
  nbhd.toggleCompare(id)
}
function toggleSaveWithToast(id) {
  const wasAdded = !mypage.savedNeighborhoods.includes(id)
  mypage.toggleSavedNeighborhood(id)
  if (wasAdded) toast.value = '관심 동네에 추가되었습니다.'
}
function saveCondition(title) {
  mypage.saveCondition({
    id: Date.now(),
    title,
    state: search.appState,
    date: new Date().toLocaleDateString('ko-KR').replace(/\. /g, '.').slice(0, -1),
  })
  showSaveModal.value = false
  conditionSaved.value = true
}
function goListings() {
  nbhd.listingsFrom = 'detail'
  router.push(`/search/results/${route.params.id}/listings`)
}
</script>

<template>
  <transition name="modal-fade">
    <SaveConditionModal v-if="showSaveModal" @close="showSaveModal = false" @save="saveCondition" />
  </transition>
  <transition name="modal-fade">
    <SavedConditionsListModal
      v-if="showSavedListModal"
      :saved-conditions="mypage.savedConditions"
      @close="showSavedListModal = false"
    />
  </transition>
  <transition name="toast-pop">
    <BaseToast v-if="toast" :message="toast" @done="toast = null" />
  </transition>

  <transition name="view-fade" mode="out-in">
    <div v-if="mode === 'results'" key="results" class="flex h-screen pt-15 overflow-hidden">
      <RecommendList
        :neighborhoods="neighborhoods"
        :compare-list="nbhd.compareList"
        :saved-neighborhoods="mypage.savedNeighborhoods"
        :condition-saved="conditionSaved"
        @detail="goDetail"
        @compare="toggleCompare"
        @toggle-save="toggleSaveWithToast"
        @go-compare="router.push('/search/compare')"
        @save-condition-click="showSaveModal = true"
        @show-saved-list="showSavedListModal = true"
      />
      <div class="flex-1 min-w-0 relative h-full p-4 bg-background">
        <div
          class="w-full h-full rounded-2xl overflow-hidden border border-border shadow-sm flex flex-col"
        >
          <ResultMap
            v-model="search.appState.selectedDistricts"
            :max="2"
            :recommendations="mapRecommendations"
            :highlighted="mapRecommendations[0]?.id"
          />
        </div>
      </div>
    </div>

    <DetailPanel
      v-else-if="mode === 'detail' && selectedNeighborhood && detailReady"
      key="detail"
      :n="selectedNeighborhood"
      :is-saved="mypage.savedNeighborhoods.includes(selectedId)"
      :in-compare="nbhd.compareList.includes(selectedId)"
      @back="router.push('/search/results')"
      @listings="goListings"
      @toggle-save="toggleSaveWithToast(selectedId)"
      @compare="toggleCompare(selectedId)"
    />

    <div
      v-else-if="mode === 'detail' && selectedNeighborhood && !detailReady"
      key="detail-loading"
      class="min-h-screen bg-background pt-[60px] flex items-center justify-center"
    >
      <p v-if="recommendation.detailsStatus === 'error'" class="text-sm text-muted-foreground">
        상세 정보를 불러오지 못했어요.
        <button @click="recommendation.fetchDetails()" class="text-primary font-semibold underline">다시 시도</button>
      </p>
      <p v-else class="text-sm text-muted-foreground">상세 정보를 불러오는 중이에요...</p>
    </div>

    <div
      v-else-if="mode === 'detail' && !selectedNeighborhood"
      key="detail-not-found"
      class="min-h-screen bg-background pt-[60px] flex flex-col items-center justify-center gap-3 text-center px-6"
    >
      <p class="text-sm font-semibold text-foreground">동네 정보를 찾을 수 없어요</p>
      <p class="text-xs text-muted-foreground">
        잘못된 주소이거나 검색 세션이 만료됐을 수 있어요.
      </p>
      <button
        @click="router.push('/search/results')"
        class="text-sm font-semibold text-primary border border-primary/25 rounded-full px-4 py-2 hover:bg-secondary"
      >
        추천 결과로 돌아가기
      </button>
    </div>

    <CompareTable
      v-else-if="mode === 'compare'"
      key="compare"
      :neighborhoods="neighborhoods"
      :compare-list="nbhd.compareList"
      @back="router.push('/search/results')"
    />

    <ListingsPanel
      v-else-if="mode === 'listings'"
      key="listings"
      :neighborhood-id="route.params.id"
      @back="router.push(`/search/results/${route.params.id}`)"
    />
  </transition>
</template>

<style scoped>
.view-fade-enter-active,
.view-fade-leave-active {
  transition:
    opacity 0.2s ease,
    transform 0.2s ease;
}
.view-fade-enter-from {
  opacity: 0;
  transform: translateY(10px);
}
.view-fade-leave-to {
  opacity: 0;
  transform: translateY(-10px);
}

.modal-fade-enter-active,
.modal-fade-leave-active {
  transition: opacity 0.18s ease;
}
.modal-fade-enter-active :deep(.bg-card),
.modal-fade-leave-active :deep(.bg-card) {
  transition:
    opacity 0.18s ease,
    transform 0.18s ease;
}
.modal-fade-enter-from,
.modal-fade-leave-to {
  opacity: 0;
}
.modal-fade-enter-from :deep(.bg-card),
.modal-fade-leave-to :deep(.bg-card) {
  opacity: 0;
  transform: scale(0.96) translateY(6px);
}

.toast-pop-enter-active,
.toast-pop-leave-active {
  transition:
    opacity 0.2s ease,
    transform 0.2s ease;
}
.toast-pop-enter-from,
.toast-pop-leave-to {
  opacity: 0;
  transform: translate(-50%, 12px);
}
</style>
