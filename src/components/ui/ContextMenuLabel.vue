<script setup>
import { cn } from "../../lib/utils";
defineProps({ class: { type: String, default: "" }, inset: { type: Boolean, default: false } });
</script>
<template>
  <div data-slot="context-menu-label" :data-inset="inset" :class="cn('px-2 py-1.5 text-sm font-medium data-[inset=true]:pl-8', $props.class)"><slot /></div>
</template>
