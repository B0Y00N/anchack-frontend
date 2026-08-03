<script setup>
import SearchStepLayout from "./SearchStepLayout.vue";
import PriorityChip from "./PriorityChip.vue";
import MustHaveChip from "./MustHaveChip.vue";
import { PRIORITY_OPTIONS, MUST_HAVE_OPTIONS } from "../../utils/mockData";

const props = defineProps({ state: { type: Object, required: true } });
const emit = defineEmits(["update", "next", "prev"]);

function update(patch) {
  emit("update", patch);
}
function togglePriority(p) {
  const i = props.state.priorities.indexOf(p);
  if (i >= 0) update({ priorities: props.state.priorities.filter((x) => x !== p) });
  else if (props.state.priorities.length < 3) update({ priorities: [...props.state.priorities, p] });
}
function toggleMustHave(m) {
  update({ mustHave: props.state.mustHave.includes(m) ? props.state.mustHave.filter((x) => x !== m) : [...props.state.mustHave, m] });
}
</script>

<template>
  <SearchStepLayout
    :step="2"
    title="동네를 고를 때 무엇이 가장 중요한가요?"
    subtitle="최소 1개, 최대 3개까지 선택할 수 있어요."
    :can-next="state.priorities.length >= 1"
    has-prev
    @next="emit('next')"
    @prev="emit('prev')"
  >
    <div class="bg-card border border-border rounded-2xl p-6 space-y-7">
      <div>
        <div class="flex items-center justify-between mb-3">
          <p class="text-sm font-semibold text-foreground">생활 우선순위</p>
          <span class="text-xs font-semibold px-2.5 py-1 rounded-full bg-secondary text-primary">{{ state.priorities.length }}/3 선택</span>
        </div>
        <div class="flex flex-wrap gap-2.5">
          <PriorityChip
            v-for="p in PRIORITY_OPTIONS"
            :key="p"
            :label="p"
            :index="state.priorities.indexOf(p)"
            :disabled="!state.priorities.includes(p) && state.priorities.length >= 3"
            @click="togglePriority(p)"
          />
        </div>
      </div>
      <div class="border-t border-border pt-6">
        <p class="text-sm font-semibold text-foreground mb-1">필수 조건</p>
        <p class="text-xs text-muted-foreground mb-4">반드시 가까이 있어야 하는 시설을 골라주세요.</p>
        <div class="flex flex-wrap gap-2.5">
          <MustHaveChip v-for="m in MUST_HAVE_OPTIONS" :key="m" :label="m" :selected="state.mustHave.includes(m)" @click="toggleMustHave(m)" />
        </div>
      </div>
    </div>
  </SearchStepLayout>
</template>
