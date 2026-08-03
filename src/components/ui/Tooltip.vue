<script setup>
import { ref, provide } from "vue";

const open = ref(false);
provide("tooltip", { open, setOpen: (v) => (open.value = v) });
</script>

<template>
  <span data-slot="tooltip" class="relative inline-block">
    <slot />
  </span>
</template>
