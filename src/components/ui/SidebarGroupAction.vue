<script setup>
import { cn } from "../../lib/utils";
defineProps({ class: { type: String, default: "" } });
</script>
<template>
  <button
    data-slot="sidebar-group-action"
    data-sidebar="group-action"
    :class="cn('text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground absolute top-3.5 right-3 flex aspect-square w-5 items-center justify-center rounded-md p-0 outline-hidden transition-transform', 'group-data-[collapsible=icon]:hidden', $props.class)"
  >
    <slot />
  </button>
</template>
