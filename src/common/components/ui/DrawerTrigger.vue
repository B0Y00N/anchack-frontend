<script setup>
import { inject } from "vue";
const drawer = inject("drawer", null);
</script>
<template>
  <span data-slot="drawer-trigger" class="inline-block" @click="drawer?.setOpen(true)"><slot /></span>
</template>
