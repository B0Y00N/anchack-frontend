<script setup>
import { cn } from "../../lib/utils";
defineProps({ class: { type: String, default: "" } });
</script>
<template>
  <p data-slot="dialog-description" :class="cn('text-muted-foreground text-sm', $props.class)"><slot /></p>
</template>
