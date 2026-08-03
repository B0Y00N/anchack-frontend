<script setup>
import { cn } from "../../lib/utils";
defineProps({ class: { type: String, default: "" } });
</script>
<template>
  <div data-slot="card-footer" :class="cn('flex items-center px-6 pb-6 [.border-t]:pt-6', $props.class)" v-bind="$attrs"><slot /></div>
</template>
