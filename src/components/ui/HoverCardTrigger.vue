<script setup>
import { inject } from "vue";
const hoverCard = inject("hoverCard", null);
</script>
<template>
  <span
    data-slot="hover-card-trigger"
    class="inline-block"
    @mouseenter="hoverCard?.setOpen(true)"
    @mouseleave="hoverCard?.setOpen(false)"
  >
    <slot />
  </span>
</template>
