<script setup>
import { inject } from "vue";
import { cn } from "../../lib/utils";

const props = defineProps({ class: { type: String, default: "" } });
const tooltip = inject("tooltip", null);
</script>

<template>
  <div
    v-if="tooltip?.open.value"
    data-slot="tooltip-content"
    :class="cn(
      'bg-primary text-primary-foreground absolute z-50 w-fit rounded-md px-3 py-1.5 text-xs text-balance left-1/2 -translate-x-1/2 top-full mt-2',
      props.class,
    )"
  >
    <slot />
  </div>
</template>
