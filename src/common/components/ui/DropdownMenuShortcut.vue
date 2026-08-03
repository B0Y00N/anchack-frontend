<script setup>
import { cn } from "../../lib/utils";
defineProps({ class: { type: String, default: "" } });
</script>
<template>
  <span data-slot="dropdown-menu-shortcut" :class="cn('text-muted-foreground ml-auto text-xs tracking-widest', $props.class)"><slot /></span>
</template>
