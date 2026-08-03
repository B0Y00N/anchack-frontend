<script setup>
import { computed, ref } from "vue";
import { useRoute, useRouter } from "vue-router";
import { Map, Check, ChevronLeft, ChevronRight } from "lucide-vue-next";
import RegionSelector from "../components/RegionSelector.vue";
import ExploreHeader from "../components/ExploreHeader.vue";
import ExploreTabs from "../components/ExploreTabs.vue";
import ReviewWriteModal from "../../review/components/ReviewWriteModal.vue";
import StarDisplay from "../../common/components/StarDisplay.vue";
import BaseToast from "../../common/components/BaseToast.vue";
import TheFooter from "../../common/components/TheFooter.vue";
import { DONG_DATA } from "../../common/utils/mockData";
import { useNeighborhoodStore } from "../stores/useNeighborhoodStore";
import { useMyPageStore } from "../../mypage/stores/useMyPageStore";
import { useDongStats } from "../composables/useDongStats";

const route = useRoute();
const router = useRouter();
const nbhd = useNeighborhoodStore();
const mypage = useMyPageStore();

const selectedDistrict = computed({
  get: () => route.params.district || null,
  set: (d) => (d ? router.push(`/explore/${d}`) : router.push("/explore")),
});
const selectedDong = computed(() => route.params.dong || null);

const districtData = computed(() => (selectedDistrict.value ? DONG_DATA[selectedDistrict.value] ?? null : null));
const districtReviews = computed(() => (selectedDistrict.value ? mypage.allReviews.filter((r) => r.district === selectedDistrict.value) : []));
const districtAvgRating = computed(() =>
  districtReviews.value.length > 0 ? districtReviews.value.reduce((s, r) => s + r.overallRating, 0) / districtReviews.value.length : 0,
);

function dongReviews(dong) {
  return mypage.allReviews.filter((r) => r.district === selectedDistrict.value && r.dong === dong);
}
function dongAvg(dong) {
  const rs = dongReviews(dong);
  return rs.length > 0 ? rs.reduce((s, r) => s + r.overallRating, 0) / rs.length : 0;
}

function selectDong(dong) {
  router.push(`/explore/${selectedDistrict.value}/${dong}`);
}

// ── 동 상세 화면 ──
const showReviewForm = ref(false);
const saveToast = ref(null);

const dongStats = computed(() => (selectedDong.value ? useDongStats(selectedDistrict.value, selectedDong.value) : null));
const dongReviewList = computed(() => (selectedDong.value ? dongReviews(selectedDong.value) : []));
const dongAvgOverall = computed(() =>
  dongReviewList.value.length > 0 ? dongReviewList.value.reduce((s, r) => s + r.overallRating, 0) / dongReviewList.value.length : 0,
);
const isDongSaved = computed(() => (selectedDong.value ? mypage.savedNeighborhoods.includes(selectedDong.value) : false));

function toggleSaveDong() {
  const willSave = !isDongSaved.value;
  mypage.toggleSavedNeighborhood(selectedDong.value);
  if (willSave) saveToast.value = "관심 동네에 추가되었습니다.";
}
function submitReview(review) {
  mypage.addReview(review);
  showReviewForm.value = false;
}
function goListings() {
  nbhd.listingsFrom = "nbhd-info";
  router.push("/search/results"); // TODO: 전용 매물 목록 라우트 연결
}

const legend = [
  { color: "#2D7A4F", label: "선택된 구" },
  { color: "#9CC47E", label: "일반 구" },
  { color: "#A8D4E6", label: "한강" },
];
const emptyStateItems = ["치안·CCTV·범죄율 현황", "교통 접근성 및 통근시간", "생활 인프라 (병원·편의점 등)", "실거주민 솔직 리뷰"];
</script>

<template>
  <!-- 동 상세 화면 -->
  <div v-if="selectedDong" class="min-h-screen bg-background pt-[60px]">
    <ReviewWriteModal v-if="showReviewForm" :district="selectedDistrict" :dong="selectedDong" @close="showReviewForm = false" @submit="submitReview" />
    <BaseToast v-if="saveToast" :message="saveToast" @done="saveToast = null" />

    <div class="border-b border-border bg-white sticky top-[60px] z-20">
      <ExploreHeader
        :district="selectedDistrict"
        :dong="selectedDong"
        :population="dongStats.stats.population"
        :avg-overall="dongAvgOverall"
        :review-count="dongReviewList.length"
        :is-saved="isDongSaved"
        @back="router.push('/explore')"
        @toggle-save="toggleSaveDong"
        @listings="goListings"
        @write-review="showReviewForm = true"
      />
      <ExploreTabs
        :district="selectedDistrict"
        :dong="selectedDong"
        :reviews="dongReviewList"
        :stats="dongStats.stats"
        :hash="dongStats.hash"
        @write-review="showReviewForm = true"
        @listings="goListings"
      />
    </div>

    <TheFooter />
  </div>

  <!-- 구 선택 / 동 목록 화면 -->
  <div v-else class="flex h-screen pt-[60px] overflow-hidden">
    <div class="flex-1 relative overflow-hidden" style="background: linear-gradient(135deg,#DCE9DC,#E4EDE7,#D8E8DB)">
      <RegionSelector v-model="selectedDistrict" />
      <div class="absolute bottom-6 left-6 bg-white/90 backdrop-blur-sm rounded-2xl px-5 py-4 border border-border shadow-sm">
        <p class="text-xs font-bold text-foreground mb-3">범례</p>
        <div v-for="l in legend" :key="l.label" class="flex items-center gap-2.5 mb-1.5">
          <div class="w-3.5 h-3.5 rounded-sm" :style="{ background: l.color }" />
          <span class="text-xs text-muted-foreground">{{ l.label }}</span>
        </div>
      </div>
      <div class="absolute top-4 right-6 bg-white/90 backdrop-blur-sm rounded-xl px-4 py-2.5 border border-border shadow-sm text-xs text-muted-foreground">구를 클릭하면 동 목록을 볼 수 있어요</div>
    </div>

    <div class="w-[400px] flex-shrink-0 border-l border-border bg-background flex flex-col overflow-hidden">
      <div v-if="!selectedDistrict" class="flex-1 flex flex-col items-center justify-center p-10 text-center">
        <div class="w-20 h-20 bg-secondary rounded-3xl flex items-center justify-center mb-6 shadow-sm"><Map :size="36" class="text-primary" /></div>
        <h2 class="text-xl font-bold text-foreground mb-3">궁금한 동네를 찾아보세요</h2>
        <p class="text-sm text-muted-foreground leading-relaxed mb-8">지도에서 구를 클릭하면 행정동 목록과<br />생활 정보, 실거주민 리뷰를 확인할 수 있어요.</p>
        <div class="w-full space-y-2.5">
          <div v-for="item in emptyStateItems" :key="item" class="flex items-center gap-3 bg-card border border-border rounded-xl px-4 py-3">
            <Check :size="14" class="text-primary flex-shrink-0" /><span class="text-sm text-foreground">{{ item }}</span>
          </div>
        </div>
      </div>

      <div v-else class="flex flex-col h-full overflow-hidden">
        <div class="p-5 border-b border-border flex-shrink-0">
          <button @click="selectedDistrict = null" class="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-primary mb-3 font-medium"><ChevronLeft :size="13" /> 전체 지도</button>
          <div class="flex items-start justify-between">
            <div>
              <h2 class="text-2xl font-bold text-foreground">{{ selectedDistrict }}</h2>
              <div v-if="districtAvgRating > 0" class="flex items-center gap-2 mt-1">
                <StarDisplay :rating="districtAvgRating" :size="13" />
                <span class="text-xs text-muted-foreground">{{ districtAvgRating.toFixed(1) }} ({{ districtReviews.length }}개 리뷰)</span>
              </div>
            </div>
            <span v-if="districtData" class="text-xs bg-secondary text-primary font-semibold px-3 py-1 rounded-full">평균 월세 {{ districtData.avgRent }}만원</span>
          </div>
        </div>

        <template v-if="districtData">
          <div class="px-5 py-4 border-b border-border flex-shrink-0">
            <div class="grid grid-cols-3 gap-2">
              <div
                v-for="item in [
                  { label: '안전', val: districtData.safetyScore, color: '#4A90D9' },
                  { label: '교통', val: districtData.transitScore, color: '#E07040' },
                  { label: '인프라', val: districtData.infraScore, color: '#52B37A' },
                ]"
                :key="item.label"
                class="bg-card border border-border rounded-xl p-3 text-center"
              >
                <p class="text-base font-bold" :style="{ color: item.color }">{{ item.val }}</p>
                <p class="text-xs text-muted-foreground">{{ item.label }}</p>
                <div class="w-full h-1 bg-muted rounded-full mt-1.5 overflow-hidden"><div class="h-full rounded-full" :style="{ width: item.val + '%', background: item.color }" /></div>
              </div>
            </div>
          </div>
          <div class="flex-1 overflow-y-auto [&::-webkit-scrollbar]:hidden">
            <div class="px-5 py-4">
              <p class="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-3">행정동 목록</p>
              <div class="space-y-2">
                <button
                  v-for="dong in districtData.dong"
                  :key="dong"
                  @click="selectDong(dong)"
                  class="w-full flex items-center justify-between bg-card border border-border rounded-xl px-4 py-3.5 hover:border-primary/40 hover:bg-secondary/50 transition-all text-left group"
                >
                  <div>
                    <p class="text-sm font-semibold text-foreground group-hover:text-primary transition-colors">{{ dong }}</p>
                    <div class="flex items-center gap-2 mt-0.5">
                      <template v-if="dongAvg(dong) > 0">
                        <StarDisplay :rating="dongAvg(dong)" :size="10" />
                        <span class="text-xs text-muted-foreground">{{ dongAvg(dong).toFixed(1) }} · {{ dongReviews(dong).length }}개</span>
                      </template>
                      <span v-else class="text-xs text-muted-foreground">리뷰 없음</span>
                    </div>
                  </div>
                  <ChevronRight :size="15" class="text-muted-foreground group-hover:text-primary flex-shrink-0" />
                </button>
              </div>
            </div>
          </div>
        </template>
      </div>
    </div>
  </div>
</template>
