<script setup>
import { cn } from "../../lib/utils";
defineProps({ class: { type: String, default: "" } });
</script>
<template>
  <h2 data-slot="drawer-title" :class="cn('text-foreground font-semibold', $props.class)"><slot /></h2>
</template>
