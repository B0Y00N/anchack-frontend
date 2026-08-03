<script setup>
import { inject } from "vue";
import { cn } from "../../lib/utils";

const props = defineProps({
  class: { type: String, default: "" },
  active: { type: Boolean, default: false },
  payload: { type: Array, default: () => [] }, // [{ dataKey, value, name, color }]
  label: { type: [String, Number], default: "" },
});
const chart = inject("chart", { config: {} });

function labelFor(key) {
  return chart.config?.[key]?.label ?? key;
}
</script>

<template>
  <div
    v-if="active && payload.length"
    data-slot="chart-tooltip-content"
    :class="cn('border-border/50 bg-background grid min-w-[8rem] gap-1.5 rounded-lg border px-2.5 py-1.5 text-xs shadow-xl', props.class)"
  >
    <div v-if="label" class="font-medium">{{ label }}</div>
    <div v-for="(item, i) in payload" :key="i" class="flex items-center justify-between gap-2">
      <span class="flex items-center gap-1.5 text-muted-foreground">
        <span class="size-2.5 rounded-[2px]" :style="{ backgroundColor: item.color }" />
        {{ labelFor(item.dataKey || item.name) }}
      </span>
      <span class="font-mono font-medium text-foreground">{{ item.value }}</span>
    </div>
  </div>
</template>
