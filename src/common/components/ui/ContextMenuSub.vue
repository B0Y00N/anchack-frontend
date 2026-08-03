<script setup>
import { ref, provide } from "vue";
const open = ref(false);
provide("contextMenuSub", { open, setOpen: (v) => (open.value = v) });
</script>
<template>
  <div data-slot="context-menu-sub" class="relative" @mouseenter="open = true" @mouseleave="open = false">
    <slot />
  </div>
</template>
