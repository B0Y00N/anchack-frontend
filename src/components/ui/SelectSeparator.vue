<script setup>
import { cn } from "../../lib/utils";
defineProps({ class: { type: String, default: "" } });
</script>
<template>
  <div data-slot="select-separator" :class="cn('bg-border pointer-events-none -mx-1 my-1 h-px', $props.class)" />
</template>
