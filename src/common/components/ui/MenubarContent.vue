<script setup>
import { inject } from "vue";
import { cn } from "../../lib/utils";

const props = defineProps({ class: { type: String, default: "" }, align: { type: String, default: "start" } });
const menu = inject("menubarMenu", null);
const alignClass = { start: "left-0", center: "left-1/2 -translate-x-1/2", end: "right-0" };
</script>

<template>
  <div
    v-if="menu?.open.value"
    data-slot="menubar-content"
    :class="cn(
      'bg-popover text-popover-foreground absolute z-50 min-w-[12rem] overflow-hidden rounded-md border p-1 shadow-md top-full mt-1',
      alignClass[align] || alignClass.start,
      props.class,
    )"
  >
    <slot />
  </div>
</template>
