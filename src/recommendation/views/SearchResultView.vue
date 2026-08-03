<script setup>
import { ref, computed } from "vue";
import { useRoute, useRouter } from "vue-router";
import RecommendList from "../components/search-result/sidebar/RecommendList.vue";
import SaveConditionModal from "../components/search-result/sidebar/SaveConditionModal.vue";
import SavedConditionsListModal from "../components/search-result/sidebar/SavedConditionsListModal.vue";
import ResultMap from "../components/search-result/main/ResultMap.vue";
import CompareTable from "../components/search-result/main/CompareTable.vue";
import ListingsPanel from "../components/search-result/main/ListingsPanel.vue";
import DetailPanel from "../components/search-result/detail/DetailPanel.vue";
import BaseToast from "../components/common/BaseToast.vue";
import { NEIGHBORHOODS } from "../utils/mockData";
import { useSearchStore } from "../stores/useSearchStore";
import { useNeighborhoodStore } from "../stores/useNeighborhoodStore";
import { useMyPageStore } from "../stores/useMyPageStore";

const route = useRoute();
const router = useRouter();
const search = useSearchStore();
const nbhd = useNeighborhoodStore();
const mypage = useMyPageStore();

const mode = computed(() => {
  if (route.path.endsWith("/compare")) return "compare";
  if (route.path.endsWith("/listings")) return "listings";
  if (route.params.id) return "detail";
  return "results";
});

const highlighted = ref("증산동");
const showSaveModal = ref(false);
const showSavedListModal = ref(false);
const conditionSaved = ref(false);
const toast = ref(null);

const selectedNeighborhood = computed(() => NEIGHBORHOODS.find((n) => n.id === route.params.id));

function goDetail(id) {
  router.push(`/search/results/${id}`);
}
function toggleCompare(id) {
  nbhd.toggleCompare(id);
}
function toggleSaveWithToast(id) {
  const wasAdded = !mypage.savedNeighborhoods.includes(id);
  mypage.toggleSavedNeighborhood(id);
  if (wasAdded) toast.value = "관심 동네에 추가되었습니다.";
}
function saveCondition(title) {
  mypage.saveCondition({
    id: Date.now(),
    title,
    state: search.appState,
    date: new Date().toLocaleDateString("ko-KR").replace(/\. /g, ".").slice(0, -1),
  });
  showSaveModal.value = false;
  conditionSaved.value = true;
}
function goListings() {
  nbhd.listingsFrom = "detail";
  router.push(`/search/results/${route.params.id}/listings`);
}
</script>

<template>
  <SaveConditionModal v-if="showSaveModal" @close="showSaveModal = false" @save="saveCondition" />
  <SavedConditionsListModal v-if="showSavedListModal" :saved-conditions="mypage.savedConditions" @close="showSavedListModal = false" />
  <BaseToast v-if="toast" :message="toast" @done="toast = null" />

  <div v-if="mode === 'results'" class="flex h-screen pt-[60px] overflow-hidden">
    <RecommendList
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
    <div class="flex-1 min-w-0"><ResultMap :highlighted="highlighted" /></div>
  </div>

  <DetailPanel
    v-else-if="mode === 'detail' && selectedNeighborhood"
    :n="selectedNeighborhood"
    :is-saved="mypage.savedNeighborhoods.includes(route.params.id)"
    :in-compare="nbhd.compareList.includes(route.params.id)"
    @back="router.push('/search/results')"
    @listings="goListings"
    @toggle-save="toggleSaveWithToast(route.params.id)"
    @compare="toggleCompare(route.params.id)"
  />

  <CompareTable v-else-if="mode === 'compare'" :compare-list="nbhd.compareList" @back="router.push('/search/results')" />

  <ListingsPanel v-else-if="mode === 'listings'" :neighborhood-id="route.params.id" @back="router.push(`/search/results/${route.params.id}`)" />
</template>
