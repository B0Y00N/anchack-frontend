<script setup>
import { ref, provide } from "vue";
const open = ref(false);
provide("dropdownMenuSub", { open, setOpen: (v) => (open.value = v) });
</script>
<template>
  <div data-slot="dropdown-menu-sub" class="relative" @mouseenter="open = true" @mouseleave="open = false">
    <slot />
  </div>
</template>
