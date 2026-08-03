<script setup>
import { cn } from "../../lib/utils";
defineProps({ class: { type: String, default: "" } });
</script>
<template>
  <div data-slot="sheet-header" :class="cn('flex flex-col gap-1.5 p-4', $props.class)"><slot /></div>
</template>
