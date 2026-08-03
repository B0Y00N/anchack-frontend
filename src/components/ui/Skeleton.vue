<script setup>
import { cn } from "../../lib/utils";

defineProps({
  class: { type: String, default: "" },
});
</script>

<template>
  <div data-slot="skeleton" :class="cn('bg-accent animate-pulse rounded-md', $props.class)" v-bind="$attrs" />
</template>
