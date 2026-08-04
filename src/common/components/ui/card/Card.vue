<script setup>
import { cn } from "../../lib/utils";
defineProps({ class: { type: String, default: "" } });
</script>
<template>
  <div data-slot="card" :class="cn('bg-card text-card-foreground flex flex-col gap-6 rounded-xl border', $props.class)" v-bind="$attrs">
    <slot />
  </div>
</template>
