import { defineStore } from "pinia";
import { INITIAL_REVIEWS, DEFAULT_SAVED_CONDITIONS } from "../../common/utils/mockData";
import { addFavoriteDong, removeFavoriteDong, getFavoriteDongs } from "../api/mypage";

export const useMyPageStore = defineStore("mypage", {
  state: () => ({
    savedNeighborhoods: [], // 찜한 동네(adminDongId) 목록. createdAt DESC(최근 등록순) 유지
    savedNeighborhoodsLoaded: false, // fetchSavedNeighborhoods를 앱당 한 번만 부르기 위한 플래그
    savedConditions: [...DEFAULT_SAVED_CONDITIONS], // { id, title, state, date }
    allReviews: [...INITIAL_REVIEWS],
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
    updateReview(updated) {
      const idx = this.allReviews.findIndex((r) => r.id === updated.id);
      if (idx >= 0) this.allReviews[idx] = updated;
    },
    addReview(review) {
      this.allReviews.unshift(review);
    },
  },
});
