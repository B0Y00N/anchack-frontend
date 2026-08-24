<script setup>
import { computed } from "vue";
import SearchStepLayout from "./SearchStepLayout.vue";
import Chip from "./Chip.vue";

const props = defineProps({ state: { type: Object, required: true } });
const emit = defineEmits(["update", "next", "prev"]);

function update(patch) {
  emit("update", patch);
}

const chips = computed(() => (props.state.rentType === "월세" ? [500, 1000, 1500, 2000, 3000] : [5000, 10000, 15000, 20000, 30000]));
</script>

<template>
  <SearchStepLayout :step="3" title="예산은 어느 정도인가요?" has-prev @next="emit('next')" @prev="emit('prev')">
    <div class="flex bg-muted rounded-xl p-1 mb-7">
      <button
        v-for="rt in ['월세', '전세']"
        :key="rt"
        @click="update({ rentType: rt })"
        :class="`flex-1 py-2.5 rounded-lg text-sm font-semibold ${state.rentType === rt ? 'bg-white text-foreground shadow-sm' : 'text-muted-foreground'}`"
      >
        {{ rt }}
      </button>
    </div>
    <div class="bg-card border border-border rounded-2xl p-6 space-y-5">
      <h3 class="font-semibold text-foreground">예산</h3>
      <div class="grid grid-cols-2 gap-4">
        <div>
          <label class="block text-xs text-muted-foreground mb-1.5">{{ state.rentType === "월세" ? "최대 보증금" : "최대 전세금" }} (만원)</label>
          <input type="number" step="10" :value="state.deposit" @input="update({ deposit: +$event.target.value })" class="w-full bg-muted rounded-xl px-4 py-3 text-sm font-medium border-0 outline-none focus:ring-2 focus:ring-primary/30" />
        </div>
        <div v-if="state.rentType === '월세'">
          <label class="block text-xs text-muted-foreground mb-1.5">최대 월세 (만원)</label>
          <input type="number" :value="state.monthly" @input="update({ monthly: +$event.target.value })" class="w-full bg-muted rounded-xl px-4 py-3 text-sm font-medium border-0 outline-none focus:ring-2 focus:ring-primary/30" />
        </div>
      </div>
      <div>
        <p class="text-xs text-muted-foreground mb-2">빠른 선택 · 10만 원 단위</p>
        <div class="flex flex-wrap gap-2">
          <Chip v-for="value in chips" :key="value" :label="`${value.toLocaleString()}만원`" :selected="state.deposit === value" @click="update({ deposit: value })" />
        </div>
      </div>
    </div>
  </SearchStepLayout>
</template>
