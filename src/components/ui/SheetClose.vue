<script setup>
import { inject } from "vue";
const sheet = inject("sheet", null);
</script>
<template>
  <span data-slot="sheet-close" @click="sheet?.setOpen(false)"><slot /></span>
</template>
