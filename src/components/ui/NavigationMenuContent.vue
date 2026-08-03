<script setup>
import { inject } from "vue";
import { cn } from "../../lib/utils";

const props = defineProps({ class: { type: String, default: "" } });
const item = inject("navMenuItem", null);
</script>

<template>
  <div
    v-if="item?.open.value"
    data-slot="navigation-menu-content"
    :class="cn('bg-popover text-popover-foreground absolute top-full left-0 z-50 mt-1.5 w-max min-w-[12rem] rounded-md border p-2 shadow-md', props.class)"
  >
    <slot />
  </div>
</template>
