import { defineStore } from "pinia";
import { DEFAULT_SAVED_CONDITIONS } from "../../common/utils/mockData";
import { getMyReviews, deleteReview as deleteReviewApi } from "../../review/api/review.js";
import { mapReviewResponse } from "../../review/constants.js";
import { getErrorMessage } from "../../common/api/axios.js";

export const useMyPageStore = defineStore("mypage", {
  state: () => ({
    savedNeighborhoods: [], // 찜한 동네 id 목록
    savedConditions: [...DEFAULT_SAVED_CONDITIONS], // { id, title, state, date }

    /*
     * [수정] 기존에는 mockData.js의 INITIAL_REVIEWS(더미 데이터)를 그대로 담아뒀었다.
     * 그 결과 "내가 쓴 리뷰" 탭이 실제로 로그인한 사용자가 작성한 리뷰가 아니라
     * 항상 똑같은 가짜 리뷰 목록을 보여주는 문제가 있었다. 이제 /reviews/me API로
     * 실제 DB에 저장된 내 리뷰만 조회해서 담는다.
     */
    myReviews: [],
    myReviewsStatus: "idle", // idle | loading | success | error
    myReviewsError: "",
  }),
  actions: {
    toggleSavedNeighborhood(id) {
      const idx = this.savedNeighborhoods.indexOf(id);
      if (idx >= 0) this.savedNeighborhoods.splice(idx, 1);
      else this.savedNeighborhoods.push(id);
    },
    saveCondition(condition) {
      this.savedConditions.push(condition);
    },
    deleteCondition(id) {
      this.savedConditions = this.savedConditions.filter((c) => c.id !== id);
    },

    // 로그인한 사용자가 실제로 작성한 리뷰 목록을 DB에서 조회한다.
    async fetchMyReviews() {
      this.myReviewsStatus = "loading";
      this.myReviewsError = "";

      try {
        const res = await getMyReviews();
        this.myReviews = (res.data || []).map(mapReviewResponse);
        this.myReviewsStatus = "success";
      } catch (error) {
        console.error("내가 쓴 리뷰 조회 실패:", error.response?.data || error);
        this.myReviews = [];
        this.myReviewsStatus = "error";
        this.myReviewsError =
          getErrorMessage(error, "내가 쓴 리뷰를 불러오지 못했어요. 잠시 후 다시 시도해주세요.");
      }
    },

    // 리뷰 수정 API 응답(원본 ReviewResponse)을 받아 목록에 반영한다.
    applyUpdatedReview(apiReview) {
      const updated = mapReviewResponse(apiReview);
      const idx = this.myReviews.findIndex((r) => r.id === updated.id);
      if (idx >= 0) this.myReviews[idx] = updated;
    },

    // 실제 DB 삭제가 성공한 경우에만 목록에서 제거한다.
    async deleteMyReview(id) {
      await deleteReviewApi(id);
      this.myReviews = this.myReviews.filter((review) => review.id !== id);
    },
  },
});
