<script setup>
import { cn } from "../../lib/utils";
defineProps({ class: { type: String, default: "" } });
</script>
<template><div data-slot="context-menu-separator" :class="cn('bg-border -mx-1 my-1 h-px', $props.class)" /></template>
