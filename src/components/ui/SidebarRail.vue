<script setup>
import { inject } from "vue";
import { cn } from "../../lib/utils";
const props = defineProps({ class: { type: String, default: "" } });
const sidebar = inject("sidebar", null);
</script>
<template>
  <button
    data-sidebar="rail"
    data-slot="sidebar-rail"
    aria-label="Toggle Sidebar"
    tabindex="-1"
    title="Toggle Sidebar"
    @click="sidebar?.toggleSidebar()"
    :class="cn('hover:after:bg-sidebar-border absolute inset-y-0 z-20 hidden w-4 -translate-x-1/2 transition-all ease-linear group-data-[side=left]:-right-4 group-data-[side=right]:left-0 after:absolute after:inset-y-0 after:left-1/2 after:w-[2px] sm:flex', props.class)"
  />
</template>
