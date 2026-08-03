<script setup>
import { ref, provide } from "vue";

const open = ref(false);
provide("hoverCard", { open, setOpen: (v) => (open.value = v) });
</script>

<template>
  <div data-slot="hover-card" class="relative inline-block">
    <slot />
  </div>
</template>
