<script setup>
import { cn } from "../../lib/utils";
defineProps({ class: { type: String, default: "" } });
</script>
<template>
  <tr data-slot="table-row" :class="cn('hover:bg-muted/50 data-[state=selected]:bg-muted border-b transition-colors', $props.class)" v-bind="$attrs"><slot /></tr>
</template>
