import { defineStore } from "pinia";
import { INITIAL_REVIEWS, DEFAULT_SAVED_CONDITIONS } from "../../common/utils/mockData";

export const useMyPageStore = defineStore("mypage", {
  state: () => ({
    savedNeighborhoods: [], // 찜한 동네 id 목록
    savedConditions: [...DEFAULT_SAVED_CONDITIONS], // { id, title, state, date }
    allReviews: [...INITIAL_REVIEWS],
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
    updateReview(updated) {
      const idx = this.allReviews.findIndex((r) => r.id === updated.id);
      if (idx >= 0) this.allReviews[idx] = updated;
    },
    addReview(review) {
      this.allReviews.unshift(review);
    },
  },
});
