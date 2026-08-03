<script setup>
import { cn } from "../../lib/utils";
defineProps({ class: { type: String, default: "" } });
</script>
<template>
  <div data-slot="alert-title" :class="cn('col-start-2 line-clamp-1 min-h-4 font-medium tracking-tight', $props.class)" v-bind="$attrs">
    <slot />
  </div>
</template>
