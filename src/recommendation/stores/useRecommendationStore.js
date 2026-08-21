import { defineStore } from "pinia";
import { submitUserConditions, getConditionRecommendations, recomputeUserCondition } from "../../condition/api/userConditions";
import { buildUserConditionPayload } from "../../condition/utils/conditionCodes";
import { getAdminDongsBatch } from "../../region/api/neighborhood";

// 추천 결과는 Pinia 메모리에만 있으면 새로고침 한 번에 날아가서(검색 결과 0건으로
// 보임) sessionStorage에 같이 백업해둔다. 브라우저를 새로 열면 사라지는 게 맞는
// 값이라(그 순간의 검색 조건에 대한 결과) localStorage가 아니라 sessionStorage를 쓴다.
const STORAGE_KEY = "recommendation-state";

function loadPersisted() {
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function persist(store) {
  try {
    sessionStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({
        conditionId: store.conditionId,
        recommendations: store.recommendations,
        detailsById: store.detailsById,
      }),
    );
  } catch {
    // sessionStorage를 못 쓰는 환경(프라이빗 모드 등)이면 그냥 메모리에만 남긴다.
  }
}

const persisted = loadPersisted();

export const useRecommendationStore = defineStore("recommendation", {
  state: () => ({
    status: persisted ? "success" : "idle", // idle | loading | success | error
    conditionId: persisted?.conditionId ?? null,
    recommendations: persisted?.recommendations ?? [],
    errorMessage: "",
    // adminDongId -> 상세 정보(P1-b: 월세 시세/치안/생활 인프라). 상세보기·비교 화면에서 쓴다.
    detailsById: persisted?.detailsById ?? {},
    detailsStatus: persisted && Object.keys(persisted.detailsById ?? {}).length > 0 ? "success" : "idle",
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
        persist(this);

        this.fetchDetails();
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
    // 마이페이지에서 저장한 조건의 "결과 보기"를 눌렀을 때 쓴다. 새로 검색을 돌리는 게
    // 아니라 그 조건으로 이미 계산해둔 추천 결과를 그대로 다시 받아온다. 응답
    // (RecommendedDongResponse 배열)의 필드 구성이 submit()의 recommendations[]와 같아서
    // SearchResultView.vue를 그대로 재사용할 수 있다.
    async loadSavedRecommendations(conditionId) {
      this.status = "loading";
      this.errorMessage = "";

      try {
        const res = await getConditionRecommendations(conditionId);

        this.conditionId = conditionId;
        this.recommendations = res.data.data;
        this.status = "success";
        persist(this);

        this.fetchDetails();
      } catch (error) {
        this.conditionId = null;
        this.recommendations = [];
        this.status = "error";
        this.errorMessage =
          error.response?.data?.error?.message ||
          error.response?.data?.message ||
          "저장된 결과를 불러오지 못했어요. 잠시 후 다시 시도해주세요.";
      }
    },
    // 마이페이지에서 latest=false인 저장한 조건의 "다시 결과보기"를 눌렀을 때 쓴다.
    // 캐시된 결과를 읽어오는 loadSavedRecommendations()와 달리 실제로 admin_dong 지표
    // 등을 반영해 추천을 다시 계산한다 - submit()과 같은 응답 형태({conditionId,
    // recommendations})라 처리 방식도 동일하다.
    async recompute(conditionId) {
      this.status = "loading";
      this.errorMessage = "";

      try {
        const res = await recomputeUserCondition(conditionId);

        this.conditionId = res.data.data.conditionId;
        this.recommendations = res.data.data.recommendations;
        this.status = "success";
        persist(this);

        this.fetchDetails();
      } catch (error) {
        this.conditionId = null;
        this.recommendations = [];
        this.status = "error";
        this.errorMessage =
          error.response?.data?.error?.message ||
          error.response?.data?.message ||
          "결과를 다시 계산하지 못했어요. 잠시 후 다시 시도해주세요.";
      }
    },
    // 추천 목록(최대 5개)의 상세 정보를 한 번에 배치 조회한다. 실패해도 목록 자체는
    // 이미 떠 있으니 status는 건드리지 않고 detailsStatus만 별도로 관리한다.
    async fetchDetails() {
      const ids = this.recommendations.map((r) => r.adminDongId);
      if (ids.length === 0) return;

      // 이 조회가 시작된 시점의 조건을 기억해뒀다가, 응답이 왔을 때도 여전히 같은
      // 검색 결과를 보고 있는지 확인한다. 조회 도중 사용자가 새 조건으로 다시
      // 검색해버리면(conditionId가 바뀜) 늦게 온 이전 응답을 버려서 최신 상태를
      // 덮어쓰지 않게 한다.
      const requestedConditionId = this.conditionId;
      this.detailsStatus = "loading";

      try {
        const res = await getAdminDongsBatch(ids);
        if (this.conditionId !== requestedConditionId) return;
        this.detailsById = Object.fromEntries(res.data.data.map((d) => [d.adminDongId, d]));
        this.detailsStatus = "success";
        persist(this);
      } catch (error) {
        if (this.conditionId !== requestedConditionId) return;
        this.detailsStatus = "error";
      }
    },
    reset() {
      this.status = "idle";
      this.conditionId = null;
      this.recommendations = [];
      this.errorMessage = "";
      this.detailsById = {};
      this.detailsStatus = "idle";
      try {
        sessionStorage.removeItem(STORAGE_KEY);
      } catch {
        // no-op
      }
    },
  },
});
