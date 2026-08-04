<script setup>
import { cn } from "../../lib/utils";
defineProps({ class: { type: String, default: "" } });
</script>
<template>
  <div data-slot="card-content" :class="cn('px-6 [&:last-child]:pb-6', $props.class)" v-bind="$attrs"><slot /></div>
</template>
