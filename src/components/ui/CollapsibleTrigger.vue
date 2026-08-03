<script setup>
import { inject } from "vue";
const group = inject("collapsible", null);
</script>

<template>
  <button type="button" data-slot="collapsible-trigger" @click="group?.toggle()">
    <slot />
  </button>
</template>
