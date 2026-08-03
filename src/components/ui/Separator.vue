<script setup>
import { cn } from "../../lib/utils";

const props = defineProps({
  class: { type: String, default: "" },
  orientation: { type: String, default: "horizontal" }, // "horizontal" | "vertical"
  decorative: { type: Boolean, default: true },
});
</script>

<template>
  <div
    data-slot="separator-root"
    :role="decorative ? 'none' : 'separator'"
    :aria-orientation="!decorative ? orientation : undefined"
    :data-orientation="orientation"
    :class="cn(
      'bg-border shrink-0 data-[orientation=horizontal]:h-px data-[orientation=horizontal]:w-full data-[orientation=vertical]:h-full data-[orientation=vertical]:w-px',
      props.class,
    )"
    v-bind="$attrs"
  />
</template>
