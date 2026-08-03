<script setup>
import { cn } from "../../lib/utils";
defineProps({ class: { type: String, default: "" } });
</script>
<template>
  <div data-slot="menubar" :class="cn('bg-background flex h-9 items-center gap-1 rounded-md border p-1 shadow-xs', $props.class)">
    <slot />
  </div>
</template>
