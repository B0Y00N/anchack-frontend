<script setup>
import { cn } from "../../lib/utils";
defineProps({ class: { type: String, default: "" } });
</script>
<template>
  <h4 data-slot="card-title" :class="cn('leading-none', $props.class)" v-bind="$attrs"><slot /></h4>
</template>
