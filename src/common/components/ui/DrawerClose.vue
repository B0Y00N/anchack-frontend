<script setup>
import { inject } from "vue";
const drawer = inject("drawer", null);
</script>
<template>
  <span data-slot="drawer-close" @click="drawer?.setOpen(false)"><slot /></span>
</template>
