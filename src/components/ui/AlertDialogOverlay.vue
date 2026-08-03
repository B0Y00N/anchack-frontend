<script setup>
import { cn } from "../../lib/utils";
defineProps({ class: { type: String, default: "" } });
</script>
<template>
  <div data-slot="alert-dialog-overlay" :class="cn('fixed inset-0 z-50 bg-black/50', $props.class)" />
</template>
