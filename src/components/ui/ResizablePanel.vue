<script setup>
import { ref } from "vue";

const props = defineProps({
  defaultSize: { type: Number, default: 50 }, // 퍼센트 (0-100)
  minSize: { type: Number, default: 10 },
});
const size = ref(props.defaultSize);
defineExpose({ size });
</script>

<template>
  <div data-slot="resizable-panel" :style="{ flexBasis: size + '%', flexGrow: 0, flexShrink: 0, overflow: 'auto' }">
    <slot />
  </div>
</template>
