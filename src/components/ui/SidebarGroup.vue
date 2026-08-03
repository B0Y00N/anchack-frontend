<script setup>
import { cn } from "../../lib/utils";
defineProps({ class: { type: String, default: "" } });
</script>
<template>
  <div data-slot="sidebar-group" data-sidebar="group" :class="cn('relative flex w-full min-w-0 flex-col p-2', $props.class)"><slot /></div>
</template>
