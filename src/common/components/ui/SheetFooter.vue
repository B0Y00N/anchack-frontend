<script setup>
import { cn } from "../../lib/utils";
defineProps({ class: { type: String, default: "" } });
</script>
<template>
  <div data-slot="sheet-footer" :class="cn('mt-auto flex flex-col gap-2 p-4', $props.class)"><slot /></div>
</template>
