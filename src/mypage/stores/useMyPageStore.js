import { defineStore } from "pinia";
import { INITIAL_REVIEWS, DEFAULT_SAVED_CONDITIONS } from "../../common/utils/mockData";
import { getMyReviews, deleteReview as deleteReviewApi } from "../../review/api/review.js";
import { mapReviewResponse } from "../../review/constants.js";
import { getErrorMessage } from "../../common/api/axios.js";
import { addFavoriteDong, removeFavoriteDong, getFavoriteDongs } from "../api/mypage";

export const useMyPageStore = defineStore("mypage", {
  state: () => ({
    savedNeighborhoods: [], // 찜한 동네(adminDongId) 목록. createdAt DESC(최근 등록순) 유지
    savedNeighborhoodsLoaded: false, // fetchSavedNeighborhoods를 앱당 한 번만 부르기 위한 플래그
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
    // 로그인 확인되는 시점에 한 번 불러서 캐싱한다(TheHeader.vue에서 호출).
    // 비로그인 401은 정상 상황이라 조용히 무시한다.
    async fetchSavedNeighborhoods() {
      if (this.savedNeighborhoodsLoaded) return;

      try {
        const res = await getFavoriteDongs();
        // 이 앱의 다른 모든 엔드포인트(user-conditions, admin-dongs 등)와 동일하게
        // { success, data, error } 포맷으로 감싸져서 온다 - res.data가 아니라 res.data.data.
        this.savedNeighborhoods = res.data.data.map((f) => f.adminDongId);
        this.savedNeighborhoodsLoaded = true;
      } catch (error) {
        // 비로그인은 정상 상황이라 조용히 빈 목록으로 두지만, 그 외 오류(응답 형식이
        // 다르거나 네트워크 문제 등)는 콘솔에 남겨서 조용히 묻히지 않게 한다.
        if (error.response?.status !== 401) {
          console.error("관심 동네 목록을 불러오지 못했습니다:", error);
        }
        // 다음 시도 때 재요청되도록 savedNeighborhoodsLoaded는 true로 안 바꾼다.
      }
    },
    // 낙관적으로 먼저 화면에 반영하고, 서버 요청이 실패하면 되돌린다.
    async toggleSavedNeighborhood(id) {
      const wasSaved = this.savedNeighborhoods.includes(id);

      if (wasSaved) {
        this.savedNeighborhoods = this.savedNeighborhoods.filter((n) => n !== id);
      } else {
        this.savedNeighborhoods.push(id);
      }

      try {
        if (wasSaved) {
          await removeFavoriteDong(id);
        } else {
          await addFavoriteDong(id);
        }
      } catch (error) {
        if (wasSaved) {
          this.savedNeighborhoods.push(id);
        } else {
          this.savedNeighborhoods = this.savedNeighborhoods.filter((n) => n !== id);
        }
        throw error;
      }
    },
    // 로그아웃 시 호출 - 다음 사람이 같은 브라우저에서 로그인했을 때 이전 사용자의
    // 관심 동네가 잠깐이라도 보이거나, savedNeighborhoodsLoaded 플래그 때문에
    // 새 사용자의 목록이 재조회되지 않는 걸 막는다.
    resetSavedNeighborhoods() {
      this.savedNeighborhoods = [];
      this.savedNeighborhoodsLoaded = false;
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
