<script setup>
import { onMounted, ref } from "vue";
import { useRouter } from "vue-router";
import { ChevronLeft } from "lucide-vue-next";
import TheFooter from "../../common/components/TheFooter.vue";
import BaseToast from "../../common/components/BaseToast.vue";
import SavedNeighborhoodList from "../../region/components/SavedNeighborhoodList.vue";
import { useMyPageStore } from "../stores/useMyPageStore";
import { getAdminDongsBatch } from "../../region/api/neighborhood";

const router = useRouter();
const mypage = useMyPageStore();

const neighborhoods = ref([]);
const status = ref("idle"); // idle | loading | success | error
const toast = ref(null);

async function loadFavoriteDetails() {
  await mypage.fetchSavedNeighborhoods();

  if (mypage.savedNeighborhoods.length === 0) {
    neighborhoods.value = [];
    status.value = "success";
    return;
  }

  status.value = "loading";
  try {
    const res = await getAdminDongsBatch(mypage.savedNeighborhoods);
    // savedNeighborhoods 순서(최근 등록순)를 그대로 유지한다.
    const byId = Object.fromEntries(res.data.data.map((d) => [d.adminDongId, d]));
    neighborhoods.value = mypage.savedNeighborhoods.map((id) => byId[id]).filter(Boolean);
    status.value = "success";
  } catch (error) {
    status.value = "error";
  }
}

onMounted(loadFavoriteDetails);

function navigate(guName, dongName) {
  if (guName && dongName) {
    router.push(`/explore/${guName}/${dongName}`);
  } else {
    router.push("/explore");
  }
}

// mypage.toggleSavedNeighborhood는 이미 저장된 id를 넘기면 항상 삭제(DELETE
// /favorite-dongs/{id})로 동작한다 - 이 페이지의 목록은 전부 저장된 상태이므로
// 그대로 재사용한다. neighborhoods는 store의 id 목록과 별개로 상세 정보를 캐싱해둔
// 로컬 상태라 실패 시 되돌릴 수 있도록 직접 낙관적 업데이트한다.
async function removeFavorite(adminDongId) {
  const idx = neighborhoods.value.findIndex((n) => n.adminDongId === adminDongId);
  if (idx === -1) return;
  const removed = neighborhoods.value[idx];
  neighborhoods.value.splice(idx, 1);

  try {
    await mypage.toggleSavedNeighborhood(adminDongId);
  } catch (error) {
    neighborhoods.value.splice(idx, 0, removed);
    toast.value = "삭제하지 못했어요. 잠시 후 다시 시도해주세요.";
  }
}
</script>

<template>
  <div class="min-h-screen bg-background pt-[60px]">
    <div class="max-w-4xl mx-auto px-8 py-8">
      <button
        @click="router.push('/')"
        class="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-primary mb-6 font-medium"
      >
        <ChevronLeft :size="16" /> 메인 화면으로 돌아가기
      </button>

      <p v-if="status === 'loading'" class="text-sm text-muted-foreground text-center py-20">
        관심 동네를 불러오는 중이에요...
      </p>

      <div v-else-if="status === 'error'" class="text-center py-20">
        <p class="text-sm text-muted-foreground mb-3">관심 동네 목록을 불러오지 못했어요.</p>
        <button
          @click="loadFavoriteDetails"
          class="text-sm font-semibold text-primary border border-primary/25 rounded-full px-4 py-2 hover:bg-secondary"
        >
          다시 시도
        </button>
      </div>

      <SavedNeighborhoodList v-else :neighborhoods="neighborhoods" @navigate="navigate" @remove="removeFavorite" />
    </div>
    <TheFooter />

    <BaseToast v-if="toast" :message="toast" @done="toast = null" />
  </div>
</template>
