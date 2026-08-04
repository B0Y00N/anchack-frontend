<script setup>
import { inject } from "vue";
const dialog = inject("alertDialog", null);
</script>
<template>
  <span data-slot="alert-dialog-trigger" class="inline-block" @click="dialog?.setOpen(true)"><slot /></span>
</template>
