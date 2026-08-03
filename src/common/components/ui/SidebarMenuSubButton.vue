<script setup>
import { cn } from "../../lib/utils";
const props = defineProps({
  class: { type: String, default: "" },
  size: { type: String, default: "md" }, // "sm" | "md"
  isActive: { type: Boolean, default: false },
  as: { type: String, default: "a" },
});
</script>
<template>
  <component
    :is="as"
    data-slot="sidebar-menu-sub-button"
    data-sidebar="menu-sub-button"
    :data-size="size"
    :data-active="isActive"
    :class="cn(
      'text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground flex h-7 min-w-0 -translate-x-px items-center gap-2 overflow-hidden rounded-md px-2 outline-hidden',
      'data-[active=true]:bg-sidebar-accent data-[active=true]:text-sidebar-accent-foreground',
      size === 'sm' && 'text-xs',
      size === 'md' && 'text-sm',
      'group-data-[collapsible=icon]:hidden',
      props.class,
    )"
    v-bind="$attrs"
  >
    <slot />
  </component>
</template>
