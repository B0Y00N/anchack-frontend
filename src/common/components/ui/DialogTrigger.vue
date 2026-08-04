<script setup>
import { inject } from "vue";
const dialog = inject("dialog", null);
</script>
<template>
  <span data-slot="dialog-trigger" class="inline-block" @click="dialog?.setOpen(true)">
    <slot />
  </span>
</template>
