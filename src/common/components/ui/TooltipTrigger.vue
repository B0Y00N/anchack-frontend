<script setup>
import { inject } from "vue";
const tooltip = inject("tooltip", null);
</script>

<template>
  <span
    data-slot="tooltip-trigger"
    class="inline-block"
    @mouseenter="tooltip?.setOpen(true)"
    @mouseleave="tooltip?.setOpen(false)"
    @focus="tooltip?.setOpen(true)"
    @blur="tooltip?.setOpen(false)"
  >
    <slot />
  </span>
</template>
