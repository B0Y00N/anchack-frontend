<script setup>
// 참고: recharts는 React 전용이라 그대로 옮길 수 없습니다.
// Vue에서는 vue-chartjs 또는 vue-echarts로 실제 차트 렌더링을 대체하는 걸 권장드려요.
// 여기서는 원본의 "config -> CSS 변수/색상 테마" 로직만 이식했습니다.
import { provide, computed } from "vue";
import { cn } from "../../lib/utils";

const props = defineProps({
  class: { type: String, default: "" },
  id: { type: String, default: "" },
  config: { type: Object, required: true }, // { [key]: { label, color } }
});

const chartId = `chart-${props.id || Math.random().toString(36).slice(2)}`;
provide("chart", { config: props.config });

// config에 정의된 색상들을 CSS 변수로 노출 (--color-xxx)
const cssVars = computed(() => {
  const vars = {};
  for (const [key, item] of Object.entries(props.config)) {
    if (item.color) vars[`--color-${key}`] = item.color;
  }
  return vars;
});
</script>

<template>
  <div data-slot="chart" :data-chart="chartId" :class="cn('flex aspect-video justify-center text-xs', props.class)" :style="cssVars">
    <slot />
  </div>
</template>
