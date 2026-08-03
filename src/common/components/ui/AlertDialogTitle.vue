<script setup>
import { cn } from "../../lib/utils";
defineProps({ class: { type: String, default: "" } });
</script>
<template>
  <h2 data-slot="alert-dialog-title" :class="cn('text-lg font-semibold', $props.class)"><slot /></h2>
</template>
