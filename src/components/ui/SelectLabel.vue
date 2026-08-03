<script setup>
import { cn } from "../../lib/utils";
defineProps({ class: { type: String, default: "" } });
</script>
<template>
  <div data-slot="select-label" :class="cn('text-muted-foreground px-2 py-1.5 text-xs', $props.class)"><slot /></div>
</template>
