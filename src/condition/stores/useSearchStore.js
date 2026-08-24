import { defineStore } from "pinia";
import { DEFAULT_STATE } from "../../common/utils/mockData";

// 조건 입력은 단계 이동과 새로고침 뒤에도 이어서 작성할 수 있어야 한다. 추천 결과와
// 달리 비교 지도에서만 쓰는 selectedDistricts는 조건값이 아니므로 저장하지 않는다.
const STORAGE_KEY = "search-condition-state";

function createDefaultState() {
  // DEFAULT_STATE 안의 배열을 그대로 공유하지 않도록 매번 새 복사본을 만든다.
  return JSON.parse(JSON.stringify(DEFAULT_STATE));
}

function loadPersistedState() {
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    if (!raw) return null;

    const persisted = JSON.parse(raw);
    return persisted && typeof persisted === "object" ? persisted : null;
  } catch {
    return null;
  }
}

function persistState(appState) {
  try {
    const { selectedDistricts, ...conditionState } = appState;
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(conditionState));
  } catch {
    // sessionStorage를 쓸 수 없는 환경에서는 메모리 상태만 사용한다.
  }
}

const persistedState = loadPersistedState();

// 원본 App.tsx의 appState (검색 조건 전체: 통근지역/예산/우선순위 등)
export const useSearchStore = defineStore("search", {
  state: () => ({
    appState: {
      ...createDefaultState(),
      ...persistedState,
      // 지도에서 비교 대상을 고를 때만 쓰는 UI 상태는 항상 빈 배열로 시작한다.
      selectedDistricts: [],
    },
  }),
  actions: {
    update(patch) {
      this.appState = { ...this.appState, ...patch };
      persistState(this.appState);
    },
    reset() {
      this.appState = createDefaultState();
      try {
        sessionStorage.removeItem(STORAGE_KEY);
      } catch {
        // no-op
      }
    },
  },
});
