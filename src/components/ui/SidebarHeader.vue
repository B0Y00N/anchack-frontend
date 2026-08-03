<script setup>
import { cn } from "../../lib/utils";
defineProps({ class: { type: String, default: "" } });
</script>
<template>
  <div data-slot="sidebar-header" data-sidebar="header" :class="cn('flex flex-col gap-2 p-2', $props.class)"><slot /></div>
</template>
