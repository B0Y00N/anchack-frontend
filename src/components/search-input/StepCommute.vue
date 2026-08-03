<script setup>
import { ref, computed } from "vue";
import { Search } from "lucide-vue-next";
import SearchStepLayout from "./SearchStepLayout.vue";
import AddressSearchModal from "./AddressSearchModal.vue";
import DistrictMap from "./DistrictMap.vue";
import BoxChip from "./BoxChip.vue";

const props = defineProps({
  state: { type: Object, required: true },
});
const emit = defineEmits(["update", "next"]);

const showAddrModal = ref(false);

function update(patch) {
  emit("update", patch);
}
function selectAddress(name, addr) {
  update({ commuteArea: addr, detailAddress: name });
  showAddrModal.value = false;
}

const canNext = computed(() => {
  if (props.state.addressTab === "known") {
    return props.state.detailAddress && props.state.detailAddress.trim().length > 0;
  } else {
    return true;
  }
});
</script>

<template>
  <SearchStepLayout :step="1" title="주로 어디로 출근하거나 통학하시나요?" :can-next="canNext" @next="emit('next')">
    <AddressSearchModal v-if="showAddrModal" @close="showAddrModal = false" @select="selectAddress" />

    <div class="flex bg-muted rounded-xl p-1 mb-7">
      <button
          v-for="(t, i) in ['known', 'unknown']"
          :key="t"
          @click="update({ addressTab: t })"
          :class="`flex-1 py-2.5 rounded-lg text-sm font-semibold transition-all ${state.addressTab === t ? 'bg-white text-foreground shadow-sm' : 'text-muted-foreground'}`"
      >
        {{ i === 0 ? "주소를 알고 있어요" : "아직 정해지지 않았어요" }}
      </button>
    </div>

    <div v-if="state.addressTab === 'known'" class="mb-8 space-y-3">
      <div>
        <label class="block text-sm font-semibold text-foreground mb-1.5">회사·학교 주소</label>
        <div class="flex gap-2">
          <input type="text" placeholder="도로명 또는 지번 주소 검색" readonly :value="state.commuteArea" @click="showAddrModal = true" class="flex-1 bg-muted rounded-xl px-4 py-3 text-sm border-0 outline-none focus:ring-2 focus:ring-primary/30 cursor-pointer" />
          <button @click="showAddrModal = true" class="bg-primary text-primary-foreground px-4 py-3 rounded-xl text-sm font-semibold flex items-center gap-1.5 hover:bg-primary/90 transition-colors"><Search :size="15" /> 검색</button>
        </div>
      </div>
      <div>
        <label class="block text-sm font-semibold text-foreground mb-1.5">상세 주소</label>
        <input type="text" placeholder="예) 상암동 1600-1 SBS 사옥" :value="state.detailAddress" @input="update({ detailAddress: $event.target.value })" class="w-full bg-muted rounded-xl px-4 py-3 text-sm border-0 outline-none focus:ring-2 focus:ring-primary/30" />
      </div>
    </div>

    <div v-else class="mb-8">
      <div class="flex items-center justify-between mb-4">
        <p class="text-sm font-semibold text-foreground">출근지 주변 구를 선택해주세요</p>
        <span class="text-xs text-muted-foreground bg-muted px-2.5 py-1 rounded-full">0~2개 선택 가능</span>
      </div>
      <div class="bg-card border border-border rounded-2xl p-5">
        <DistrictMap :model-value="state.commuteAreas" @update:model-value="(areas) => update({ commuteAreas: areas })" :max="2" />
      </div>
      <p v-if="state.commuteAreas.length === 0" class="text-xs text-muted-foreground mt-3 text-center">선택하지 않으면 서울 전 지역을 대상으로 검색해요.</p>
    </div>

    <div v-if="state.addressTab === 'known'" class="bg-card border border-border rounded-2xl p-6 space-y-5">
      <h3 class="font-semibold text-foreground">통근 조건</h3>
      <div>
        <p class="text-sm text-muted-foreground mb-3">통근 수단</p>
        <div class="flex bg-muted rounded-xl p-1">
          <button
              v-for="m in ['대중교통', '자가용']"
              :key="m"
              @click="update({ commuteMode: m })"
              :class="`flex-1 py-2.5 rounded-lg text-sm font-semibold transition-all ${state.commuteMode === m ? 'bg-white text-foreground shadow-sm' : 'text-muted-foreground'}`"
          >
            {{ m }}
          </button>
        </div>
      </div>
      <div>
        <p class="text-sm text-muted-foreground mb-3">최대 통근시간</p>
        <div class="flex gap-2.5 flex-wrap">
          <BoxChip v-for="t in [30, 45, 60, 75, 90]" :key="t" :label="`${t}분`" :selected="state.maxCommuteTime === t" @click="update({ maxCommuteTime: t })" />
        </div>
      </div>
      <div v-if="state.commuteMode === '대중교통'">
        <p class="text-sm text-muted-foreground mb-3">최대 환승 횟수</p>
        <div class="flex gap-2.5 flex-wrap">
          <BoxChip v-for="t in [0, 1, 2, 3]" :key="t" :label="`${t}회`" :selected="state.maxTransfers === t" @click="update({ maxTransfers: t })" />
        </div>
      </div>
    </div>
  </SearchStepLayout>
</template>