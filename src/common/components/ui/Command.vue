<script setup>
import { ref, provide } from "vue";
import { cn } from "../../lib/utils";

defineProps({ class: { type: String, default: "" } });
const search = ref("");
provide("command", { search });
</script>

<template>
  <div data-slot="command" :class="cn('bg-popover text-popover-foreground flex h-full w-full flex-col overflow-hidden rounded-md', $props.class)">
    <slot />
  </div>
</template>
