<script setup>
import { inject } from "vue";
const popover = inject("popover", null);
</script>
<template>
  <span data-slot="popover-trigger" class="inline-block" @click="popover?.toggle()">
    <slot />
  </span>
</template>
