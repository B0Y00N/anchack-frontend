<script setup>
import { cn } from "../../lib/utils";
defineProps({ class: { type: String, default: "" } });
</script>
<template>
  <h2 data-slot="dialog-title" :class="cn('text-lg leading-none font-semibold', $props.class)"><slot /></h2>
</template>
