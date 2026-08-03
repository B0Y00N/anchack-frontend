<script setup>
import { cn } from "../../lib/utils";
defineProps({ class: { type: String, default: "" } });
</script>
<template>
  <tfoot data-slot="table-footer" :class="cn('bg-muted/50 border-t font-medium [&>tr]:last:border-b-0', $props.class)" v-bind="$attrs"><slot /></tfoot>
</template>
