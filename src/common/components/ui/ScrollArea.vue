<script setup>
import { cn } from "../../lib/utils";
defineProps({ class: { type: String, default: "" } });
</script>

<template>
  <div data-slot="scroll-area" :class="cn('relative', $props.class)">
    <div data-slot="scroll-area-viewport" class="size-full rounded-[inherit] overflow-auto">
      <slot />
    </div>
  </div>
</template>

<style scoped>
/* 네이티브 스크롤을 쓰되, Radix 버전과 비슷한 얇은 스크롤바 스타일을 적용 */
[data-slot="scroll-area-viewport"]::-webkit-scrollbar {
  width: 10px;
  height: 10px;
}
[data-slot="scroll-area-viewport"]::-webkit-scrollbar-thumb {
  background-color: var(--border);
  border-radius: 9999px;
}
</style>
