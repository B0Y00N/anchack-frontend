<script setup>
import { ref, computed } from "vue";
import { useRoute, useRouter } from "vue-router";
import { useAuthStore } from "../../user/stores/useAuthStore";
import { useMyPageStore } from "../stores/useMyPageStore";
import TheFooter from "../../common/components/TheFooter.vue";
import UserProfileSummary from "../../user/components/UserProfileSummary.vue";
import MyPageTabs from "../components/MyPageTabs.vue";
import ProfileEdit from "../../user/components/ProfileEdit.vue";
import SavedNeighborhoodList from "../../region/components/SavedNeighborhoodList.vue";
import SavedConditionList from "../../condition/components/SavedConditionList.vue";
import MyReviewList from "../../review/components/MyReviewList.vue";
import ReviewEditModal from "../../review/components/ReviewEditModal.vue";

const route = useRoute();
const router = useRouter();
const auth = useAuthStore();
const mypage = useMyPageStore();

const tab = ref(route.path === "/mypage/favorites" ? "neighborhoods" : "profile");
const editingReview = ref(null);

const myReviews = computed(() => mypage.allReviews.slice(0, 20));

const tabs = computed(() => [
  { key: "profile", label: "프로필" },
  { key: "neighborhoods", label: "관심 동네", count: mypage.savedNeighborhoods.length },
  { key: "conditions", label: "저장한 조건", count: mypage.savedConditions.length },
  { key: "results", label: "저장된 결과", count: mypage.savedConditions.length },
  { key: "reviews", label: "내가 쓴 리뷰", count: myReviews.value.length },
]);

function navigate(page) {
  const routeMap = {
    results: "/search/results",
    step1: "/search/step/1",
    explore: "/explore",
    detail: "/search/results", // 상세 대상 id가 없어 목록으로 이동
  };
  router.push(routeMap[page] || "/");
}

function deleteCondition(id) {
  mypage.deleteCondition(id);
}
function loadResult(condition) {
  // TODO: search store에 condition.state를 반영한 뒤 결과 화면으로 이동
  router.push("/search/results");
}
function saveReview(updated) {
  mypage.updateReview(updated);
  editingReview.value = null;
}
function deleteReview(id) {
  mypage.allReviews = mypage.allReviews.filter((x) => x.id !== id);
}
</script>

<template>
  <div class="min-h-screen bg-background pt-[60px]">
    <ReviewEditModal v-if="editingReview" :review="editingReview" @close="editingReview = null" @save="saveReview" />

    <div class="border-b border-border bg-white">
      <UserProfileSummary :user-profile="auth.userProfile" />
      <MyPageTabs v-model="tab" :tabs="tabs" />
    </div>

    <div class="max-w-4xl mx-auto px-8 py-8">
      <ProfileEdit v-if="tab === 'profile'" :user-profile="auth.userProfile" :is-social-login="auth.isSocialLogin" @save="auth.updateProfile" />
      <SavedNeighborhoodList v-else-if="tab === 'neighborhoods'" :saved-neighborhoods="mypage.savedNeighborhoods" @navigate="navigate" />
      <SavedConditionList v-else-if="tab === 'conditions'" mode="conditions" :saved-conditions="mypage.savedConditions" @navigate="navigate" @delete="deleteCondition" />
      <SavedConditionList v-else-if="tab === 'results'" mode="results" :saved-conditions="mypage.savedConditions" @navigate="navigate" @load="loadResult" />
      <MyReviewList v-else-if="tab === 'reviews'" :reviews="myReviews" @navigate="navigate" @edit="(r) => (editingReview = r)" @delete="deleteReview" />
    </div>

    <TheFooter />
  </div>
</template>
