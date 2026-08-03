<script setup>
import { inject } from "vue";
const menu = inject("dropdownMenu", null);
</script>
<template>
  <span data-slot="dropdown-menu-trigger" class="inline-block" @click="menu?.toggle()">
    <slot />
  </span>
</template>
