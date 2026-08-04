<script setup>
import { cn } from "../../lib/utils";
defineProps({ class: { type: String, default: "" } });
</script>
<template>
  <span data-slot="avatar-fallback" :class="cn('bg-muted flex size-full items-center justify-center rounded-full', $props.class)" v-bind="$attrs">
    <slot />
  </span>
</template>
