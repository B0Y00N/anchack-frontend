<script setup>
import { ref, provide } from "vue";
import { useClickOutside } from "../../composables/useClickOutside";

const open = ref(false);
const rootEl = ref(null);
provide("menubarMenu", { open, close: () => (open.value = false), toggle: () => (open.value = !open.value) });
useClickOutside(rootEl, () => (open.value = false));
</script>

<template>
  <div data-slot="menubar-menu" ref="rootEl" class="relative">
    <slot />
  </div>
</template>
