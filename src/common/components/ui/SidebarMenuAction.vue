<script setup>
import { cn } from "../../lib/utils";
defineProps({ class: { type: String, default: "" }, showOnHover: { type: Boolean, default: false } });
</script>
<template>
  <button
    data-slot="sidebar-menu-action"
    data-sidebar="menu-action"
    :class="cn(
      'text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground absolute top-1.5 right-1 flex aspect-square w-5 items-center justify-center rounded-md p-0 outline-hidden transition-transform',
      'group-data-[collapsible=icon]:hidden',
      showOnHover && 'md:opacity-0 group-hover/menu-item:opacity-100',
      $props.class,
    )"
  >
    <slot />
  </button>
</template>
