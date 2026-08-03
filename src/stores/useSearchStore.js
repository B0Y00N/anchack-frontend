import { defineStore } from "pinia";
import { DEFAULT_STATE } from "../utils/mockData";

// 원본 App.tsx의 appState (검색 조건 전체: 통근지역/예산/우선순위 등)
export const useSearchStore = defineStore("search", {
  state: () => ({
    appState: { ...DEFAULT_STATE },
  }),
  actions: {
    update(patch) {
      this.appState = { ...this.appState, ...patch };
    },
    reset() {
      this.appState = { ...DEFAULT_STATE };
    },
  },
});
