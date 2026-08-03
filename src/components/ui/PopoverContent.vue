<script setup>
import { inject } from "vue";
import { cn } from "../../lib/utils";

const props = defineProps({
  class: { type: String, default: "" },
  align: { type: String, default: "center" }, // "start" | "center" | "end"
});
const popover = inject("popover", null);

const alignClass = {
  start: "left-0",
  center: "left-1/2 -translate-x-1/2",
  end: "right-0",
};
</script>

<template>
  <div
    v-if="popover?.isOpen()"
    data-slot="popover-content"
    :class="cn(
      'bg-popover text-popover-foreground absolute z-50 w-72 rounded-md border p-4 shadow-md outline-hidden top-full mt-1',
      alignClass[align] || alignClass.center,
      props.class,
    )"
  >
    <slot />
  </div>
</template>
