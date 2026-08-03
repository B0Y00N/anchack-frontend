<script setup>
import { cn } from "../../lib/utils";
defineProps({ class: { type: String, default: "" } });
</script>
<template>
  <thead data-slot="table-header" :class="cn('[&_tr]:border-b', $props.class)" v-bind="$attrs"><slot /></thead>
</template>
