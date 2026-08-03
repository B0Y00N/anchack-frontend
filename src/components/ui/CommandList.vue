<script setup>
import { cn } from "../../lib/utils";
defineProps({ class: { type: String, default: "" } });
</script>
<template>
  <div data-slot="command-list" :class="cn('max-h-[300px] scroll-py-1 overflow-x-hidden overflow-y-auto', $props.class)">
    <slot />
  </div>
</template>
