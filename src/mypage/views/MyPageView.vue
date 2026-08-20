<script setup>
import { computed, onMounted, ref } from "vue";
import { useRouter } from "vue-router";

import { useAuthStore } from "../../user/stores/useAuthStore";
import { useMyPageStore } from "../stores/useMyPageStore";
import { getErrorMessage } from "../../common/api/axios.js";

import TheFooter from "../../common/components/TheFooter.vue";
import BaseToast from "../../common/components/BaseToast.vue";
import UserProfileSummary from "../../user/components/UserProfileSummary.vue";
import MyPageTabs from "../components/MyPageTabs.vue";
import SavedNeighborhoodList from "../../region/components/SavedNeighborhoodList.vue";
import SavedConditionList from "../../condition/components/SavedConditionList.vue";
import MyReviewList from "../../review/components/MyReviewList.vue";
import ReviewEditModal from "../../review/components/ReviewEditModal.vue";

const router = useRouter();

const auth = useAuthStore();
const mypage = useMyPageStore();

const userProfile = computed(() => auth.user);

// 기본 탭 : 관심 동네
const tab = ref("neighborhoods");

const editingReview = ref(null);
const pageToast = ref(null);

// 실제 DB에 저장된 "내가 쓴 리뷰" 목록 (useMyPageStore.fetchMyReviews 결과)
const myReviews = computed(() => mypage.myReviews);

const tabs = computed(() => [
  {
    key: "neighborhoods",
    label: "관심 동네",
    count: mypage.savedNeighborhoods.length,
  },
  {
    key: "conditions",
    label: "저장한 조건",
    count: mypage.savedConditions.length,
  },
  {
    key: "results",
    label: "저장된 결과",
    count: mypage.savedConditions.length,
  },
  {
    key: "reviews",
    label: "내가 쓴 리뷰",
    count: myReviews.value.length,
  },
]);

function navigate(page) {
  const routeMap = {
    results: "/search/results",
    step1: "/search/step/1",
    explore: "/explore",
    detail: "/search/results",
  };

  router.push(routeMap[page] || "/");
}

function deleteCondition(id) {
  mypage.deleteCondition(id);
}

function loadResult() {
  // TODO: 검색 조건을 검색 Store에 적용한다.
  router.push("/search/results");
}

/*
 * UserProfileSummary에서 전달받은 닉네임을
 * Auth Store의 사용자 정보에 반영한다.
 */
function updateNickname(updatedUser) {
  auth.setUser({
    ...auth.user,
    ...updatedUser,
  });
}

/*
 * [수정] ReviewEditModal은 실제로 "updated" 이벤트(수정된 리뷰의 API 응답)를
 * emit하는데, 이 화면에서는 "save" 이벤트를 듣고 있어 리뷰 수정이 화면에
 * 전혀 반영되지 않던 문제가 있었다. 이벤트 이름을 맞추고, API 응답을 그대로
 * store에 반영하도록 수정했다.
 */
function saveReview(apiReview) {
  mypage.applyUpdatedReview(apiReview);
  editingReview.value = null;
  pageToast.value = "리뷰가 수정되었습니다.";
}

/*
 * [수정] 기존에는 실제 삭제 API를 호출하지 않고 화면(store) 상태에서만 리뷰를
 * 지워서, 새로고침하면 삭제했던 리뷰가 다시 나타나는 문제가 있었다. 이제 실제
 * DB 삭제가 성공한 경우에만 목록에서 제거한다.
 */
async function deleteReview(id) {
  if (!window.confirm("이 리뷰를 삭제할까요? 삭제하면 되돌릴 수 없어요.")) return;

  try {
    await mypage.deleteMyReview(id);
    pageToast.value = "리뷰가 삭제되었습니다.";
  } catch (error) {
    console.error("리뷰 삭제 실패:", error.response?.data || error);
    pageToast.value =
      getErrorMessage(error, "리뷰 삭제에 실패했습니다. 잠시 후 다시 시도해주세요.");
  }
}

onMounted(() => {
  mypage.fetchMyReviews();
});
</script>

<template>
  <div class="min-h-screen bg-background pt-[60px]">
    <ReviewEditModal
      v-if="editingReview"
      :review="editingReview"
      @close="editingReview = null"
      @updated="saveReview"
    />

    <BaseToast v-if="pageToast" :message="pageToast" @done="pageToast = null" />

    <div class="border-b border-border bg-white">
      <UserProfileSummary
        v-if="userProfile"
        :user-profile="userProfile"
        @save="updateNickname"
      />

      <div
        v-else
        class="max-w-4xl mx-auto px-8 py-8 text-sm text-muted-foreground"
      >
        사용자 정보를 불러오는 중입니다.
      </div>

      <MyPageTabs
        v-model="tab"
        :tabs="tabs"
      />
    </div>

    <div class="max-w-4xl mx-auto px-8 py-8">
      <SavedNeighborhoodList
        v-if="tab === 'neighborhoods'"
        :saved-neighborhoods="mypage.savedNeighborhoods"
        @navigate="navigate"
      />

      <SavedConditionList
        v-else-if="tab === 'conditions'"
        mode="conditions"
        :saved-conditions="mypage.savedConditions"
        @navigate="navigate"
        @delete="deleteCondition"
      />

      <SavedConditionList
        v-else-if="tab === 'results'"
        mode="results"
        :saved-conditions="mypage.savedConditions"
        @navigate="navigate"
        @load="loadResult"
      />

      <template v-else-if="tab === 'reviews'">
        <div v-if="mypage.myReviewsStatus === 'loading'" class="text-center py-20 text-sm text-muted-foreground">
          리뷰를 불러오는 중이에요...
        </div>
        <div v-else-if="mypage.myReviewsStatus === 'error'" class="text-center py-20 text-sm text-red-500">
          {{ mypage.myReviewsError }}
        </div>
        <MyReviewList
          v-else
          :reviews="myReviews"
          @navigate="navigate"
          @edit="(review) => (editingReview = review)"
          @delete="deleteReview"
        />
      </template>
    </div>

    <TheFooter />
  </div>
</template>
