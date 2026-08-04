<script setup>
import { inject } from "vue";
const dialog = inject("dialog", null);
</script>
<template>
  <span data-slot="dialog-close" @click="dialog?.setOpen(false)">
    <slot />
  </span>
</template>
