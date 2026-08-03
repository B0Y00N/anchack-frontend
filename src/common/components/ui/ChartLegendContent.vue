<script setup>
import { inject } from "vue";
import { cn } from "../../lib/utils";

const props = defineProps({
  class: { type: String, default: "" },
  payload: { type: Array, default: () => [] }, // [{ dataKey, value, color }]
});
const chart = inject("chart", { config: {} });

function labelFor(key) {
  return chart.config?.[key]?.label ?? key;
}
</script>

<template>
  <div data-slot="chart-legend-content" :class="cn('flex items-center justify-center gap-4', props.class)">
    <div v-for="(item, i) in payload" :key="i" class="flex items-center gap-1.5 text-sm">
      <span class="size-2 shrink-0 rounded-[2px]" :style="{ backgroundColor: item.color }" />
      {{ labelFor(item.dataKey || item.value) }}
    </div>
  </div>
</template>
