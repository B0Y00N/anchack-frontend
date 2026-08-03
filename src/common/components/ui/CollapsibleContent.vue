<script setup>
import { inject } from "vue";
const group = inject("collapsible", null);
</script>

<template>
  <div v-if="group?.open.value" data-slot="collapsible-content">
    <slot />
  </div>
</template>
