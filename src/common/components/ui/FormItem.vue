<script setup>
import { provide } from "vue";
import { cn } from "../../lib/utils";

defineProps({ class: { type: String, default: "" } });
const id = `field-${Math.random().toString(36).slice(2, 9)}`;
provide("formItem", { id });
</script>

<template>
  <div data-slot="form-item" :class="cn('grid gap-2', $props.class)">
    <slot />
  </div>
</template>
