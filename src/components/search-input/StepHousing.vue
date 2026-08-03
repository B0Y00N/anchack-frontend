<script setup>
import SearchStepLayout from "./SearchStepLayout.vue";
import Chip from "./Chip.vue";
import { HOUSING_OPTIONS, AREA_WITH_PYEONG } from "../../utils/mockData";

const props = defineProps({ state: { type: Object, required: true } });
const emit = defineEmits(["update", "next", "prev"]);

function update(patch) {
  emit("update", patch);
}
function toggleHousing(h) {
  update({ housingTypes: props.state.housingTypes.includes(h) ? props.state.housingTypes.filter((x) => x !== h) : [...props.state.housingTypes, h] });
}
</script>

<template>
  <SearchStepLayout
    :step="4"
    title="어떤 집을 찾고 있나요?"
    subtitle="주택 유형과 최소 면적을 선택해주세요."
    :can-next="state.housingTypes.length >= 1"
    has-prev
    @next="emit('next')"
    @prev="emit('prev')"
  >
    <div class="bg-card border border-border rounded-2xl p-6 space-y-7">
      <div>
        <p class="text-sm font-semibold text-foreground mb-3">주택 유형</p>
        <div class="flex flex-wrap gap-2.5">
          <Chip v-for="h in HOUSING_OPTIONS" :key="h" :label="h" :selected="state.housingTypes.includes(h)" @click="toggleHousing(h)" />
        </div>
      </div>
      <div class="border-t border-border pt-6">
        <p class="text-sm font-semibold text-foreground mb-3">최소 전용면적</p>
        <div class="flex flex-wrap gap-2.5">
          <button
            v-for="{ label, pyeong } in AREA_WITH_PYEONG"
            :key="label"
            @click="update({ minArea: label })"
            :class="`inline-flex flex-col items-center px-5 py-2.5 rounded-xl border text-sm font-semibold ${state.minArea === label ? 'bg-primary text-primary-foreground border-primary' : 'bg-white text-foreground border-border'}`"
          >
            <span>{{ label }}</span>
            <span v-if="pyeong" class="text-xs mt-0.5 opacity-75">{{ pyeong }}</span>
          </button>
        </div>
      </div>
    </div>
  </SearchStepLayout>
</template>
