<script setup>
import { ref, provide } from "vue";
import { useClickOutside } from "../../composables/useClickOutside";
import { cn } from "../../lib/utils";

defineProps({ class: { type: String, default: "" } });

const open = ref(false);
const rootEl = ref(null);
provide("navMenuItem", { open, toggle: () => (open.value = !open.value), close: () => (open.value = false) });
useClickOutside(rootEl, () => (open.value = false));
</script>

<template>
  <li data-slot="navigation-menu-item" ref="rootEl" :class="cn('relative', $props.class)">
    <slot />
  </li>
</template>
