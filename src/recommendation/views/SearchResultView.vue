<script setup>
import { computed, ref } from 'vue'
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

const route = useRoute()
const router = useRouter()
const search = useSearchStore()
const recommendation = useRecommendationStore()
const nbhd = useNeighborhoodStore()
const mypage = useMyPageStore()

// 실제 API 응답을 카드/상세 화면이 쓰는 모양으로 다듬는다.
// guName/dongName/lat/lng는 P0, deposit/monthly/rentDist/cctv/police/crimeRate/safetyScore/
// gyms/convenience/hospitals/parks/department/mart는 P1-b(admin-dongs/batch)에서 채워진다.
// route/lineColor/lineNum/walkMin/subwayMin/transferMin(P1-a)은 아직 백엔드 협의 중이라
// 이 값들을 쓰는 TabCommute.vue가 undefined를 안전하게 처리한다.
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
