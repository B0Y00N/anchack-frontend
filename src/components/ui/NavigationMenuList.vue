<script setup>
import { cn } from "../../lib/utils";
defineProps({ class: { type: String, default: "" } });
</script>
<template>
  <ul data-slot="navigation-menu-list" :class="cn('group flex flex-1 list-none items-center justify-center gap-1', $props.class)">
    <slot />
  </ul>
</template>
