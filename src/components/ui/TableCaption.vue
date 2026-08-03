<script setup>
import { cn } from "../../lib/utils";
defineProps({ class: { type: String, default: "" } });
</script>
<template>
  <caption data-slot="table-caption" :class="cn('text-muted-foreground mt-4 text-sm', $props.class)" v-bind="$attrs"><slot /></caption>
</template>
