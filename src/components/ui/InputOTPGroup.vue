<script setup>
import { cn } from "../../lib/utils";
defineProps({ class: { type: String, default: "" } });
</script>
<template>
  <div data-slot="input-otp-group" :class="cn('flex items-center gap-1', $props.class)"><slot /></div>
</template>
