<script setup>
import { cn } from "../../lib/utils";

defineProps({
  class: { type: String, default: "" },
});
</script>

<template>
  <label
    data-slot="label"
    :class="cn(
      'flex items-center gap-2 text-sm leading-none font-medium select-none group-data-[disabled=true]:pointer-events-none group-data-[disabled=true]:opacity-50 peer-disabled:cursor-not-allowed peer-disabled:opacity-50',
      $props.class,
    )"
    v-bind="$attrs"
  >
    <slot />
  </label>
</template>
