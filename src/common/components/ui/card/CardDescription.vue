<script setup>
import { cn } from "../../lib/utils";
defineProps({ class: { type: String, default: "" } });
</script>
<template>
  <p data-slot="card-description" :class="cn('text-muted-foreground', $props.class)" v-bind="$attrs"><slot /></p>
</template>
