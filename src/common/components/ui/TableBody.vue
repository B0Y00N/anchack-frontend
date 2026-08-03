<script setup>
import { cn } from "../../lib/utils";
defineProps({ class: { type: String, default: "" } });
</script>
<template>
  <tbody data-slot="table-body" :class="cn('[&_tr:last-child]:border-0', $props.class)" v-bind="$attrs"><slot /></tbody>
</template>
