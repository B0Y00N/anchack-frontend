<script setup>
import { inject } from "vue";
const sheet = inject("sheet", null);
</script>
<template>
  <span data-slot="sheet-trigger" class="inline-block" @click="sheet?.setOpen(true)"><slot /></span>
</template>
