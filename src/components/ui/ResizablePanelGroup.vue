<script setup>
import { provide } from "vue";
import { cn } from "../../lib/utils";

const props = defineProps({
  class: { type: String, default: "" },
  direction: { type: String, default: "horizontal" }, // "horizontal" | "vertical"
});
provide("resizableDirection", props.direction);
</script>

<template>
  <div
    data-slot="resizable-panel-group"
    :data-panel-group-direction="direction"
    :class="cn('flex h-full w-full', direction === 'vertical' && 'flex-col', props.class)"
  >
    <slot />
  </div>
</template>
