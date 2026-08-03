<script setup>
import { cn } from "../../lib/utils";
defineProps({ class: { type: String, default: "" } });
</script>
<template>
  <span data-slot="avatar" :class="cn('relative flex size-10 shrink-0 overflow-hidden rounded-full', $props.class)" v-bind="$attrs">
    <slot />
  </span>
</template>
