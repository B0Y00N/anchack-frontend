<script setup>
import { cn } from "../../lib/utils";
defineProps({ class: { type: String, default: "" }, heading: { type: String, default: "" } });
</script>
<template>
  <div data-slot="command-group" :class="cn('text-foreground overflow-hidden p-1', $props.class)">
    <div v-if="heading" class="text-muted-foreground px-2 py-1.5 text-xs font-medium">{{ heading }}</div>
    <slot />
  </div>
</template>
