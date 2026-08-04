<script setup>
import { inject } from "vue";
import { ChevronDown } from "lucide-vue-next";
import { cn } from "../../lib/utils";

const props = defineProps({
  class: { type: String, default: "" },
  size: { type: String, default: "default" }, // "sm" | "default"
});
const select = inject("select", null);
</script>

<template>
  <button
    type="button"
    data-slot="select-trigger"
    :data-size="size"
    @click="select?.toggle()"
    :class="cn(
      'border-input data-[placeholder]:text-muted-foreground dark:bg-input/30 dark:hover:bg-input/50 flex w-full items-center justify-between gap-2 rounded-md border bg-input-background px-3 py-2 text-sm whitespace-nowrap transition-[color,box-shadow] outline-none disabled:cursor-not-allowed disabled:opacity-50 data-[size=default]:h-9 data-[size=sm]:h-8',
      props.class,
    )"
  >
    <slot />
    <ChevronDown class="size-4 opacity-50" />
  </button>
</template>
