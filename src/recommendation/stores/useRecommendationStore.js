import { defineStore } from "pinia";
import { submitUserConditions } from "../../condition/api/userConditions";
import { buildUserConditionPayload } from "../../condition/utils/conditionCodes";

export const useRecommendationStore = defineStore("recommendation", {
  state: () => ({
    status: "idle", // idle | loading | success | error
    conditionId: null,
    recommendations: [],
    errorMessage: "",
  }),
  actions: {
    async submit(appState) {
      this.status = "loading";
      this.errorMessage = "";

      try {
        const payload = buildUserConditionPayload(appState);
        const res = await submitUserConditions(payload);

        this.conditionId = res.data.data.conditionId;
        this.recommendations = res.data.data.recommendations;
        this.status = "success";
      } catch (error) {
        this.conditionId = null;
        this.recommendations = [];
        this.status = "error";
        // 401은 스프링 시큐리티 필터가 앱 공통 에러 포맷({error:{message}}) 이전에
        // 자체 포맷({message})으로 응답하므로 두 형태를 모두 확인한다.
        this.errorMessage =
          error.response?.data?.error?.message ||
          error.response?.data?.message ||
          "추천 동네를 불러오지 못했어요. 잠시 후 다시 시도해주세요.";
      }
    },
    reset() {
      this.status = "idle";
      this.conditionId = null;
      this.recommendations = [];
      this.errorMessage = "";
    },
  },
});
