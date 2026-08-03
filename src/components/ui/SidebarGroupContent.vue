<script setup>
import { cn } from "../../lib/utils";
defineProps({ class: { type: String, default: "" } });
</script>
<template>
  <div data-slot="sidebar-group-content" data-sidebar="group-content" :class="cn('w-full text-sm', $props.class)"><slot /></div>
</template>
