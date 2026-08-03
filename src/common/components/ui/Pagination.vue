<script setup>
import { cn } from "../../lib/utils";
defineProps({ class: { type: String, default: "" } });
</script>
<template>
  <nav role="navigation" aria-label="pagination" data-slot="pagination" :class="cn('mx-auto flex w-full justify-center', $props.class)">
    <slot />
  </nav>
</template>
