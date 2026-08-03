<script setup>
import { cn } from "../../lib/utils";

const props = defineProps({
  class: { type: String, default: "" },
  value: { type: Number, default: 0 },
});
</script>

<template>
  <div
    data-slot="progress"
    :class="cn('bg-primary/20 relative h-2 w-full overflow-hidden rounded-full', props.class)"
    v-bind="$attrs"
  >
    <div
      data-slot="progress-indicator"
      class="bg-primary h-full w-full flex-1 transition-all"
      :style="{ transform: `translateX(-${100 - (value || 0)}%)` }"
    />
  </div>
</template>
