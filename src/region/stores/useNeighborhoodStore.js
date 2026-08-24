import { defineStore } from "pinia";

export const useNeighborhoodStore = defineStore("neighborhood", {
  state: () => ({
    selectedNbhd: "증산동",
    compareList: [],
    selectedDistrict: null, // 탐색(Explore) 화면에서 클릭한 구
    selectedDong: null, // 탐색 화면에서 클릭한 동
    listingsFrom: "detail", // "detail" | "nbhd-info" - 매물 목록 화면에 어디서 진입했는지
  }),
  actions: {
    selectNeighborhood(id) {
      this.selectedNbhd = id;
    },
    toggleCompare(id) {
      const idx = this.compareList.indexOf(id);
      if (idx >= 0) this.compareList.splice(idx, 1);
      else if (this.compareList.length < 3) this.compareList.push(id);
    },
    removeFromCompare(id) {
      this.compareList = this.compareList.filter((x) => x !== id);
    },
    resetCompare() {
      this.compareList = [];
    },
    retainCompare(ids) {
      const validIds = new Set(ids);
      this.compareList = this.compareList.filter((id) => validIds.has(id));
    },
    selectDistrict(district) {
      this.selectedDistrict = district;
      this.selectedDong = null;
    },
    selectDong(dong) {
      this.selectedDong = dong;
    },
  },
});
