<script setup>
import { cn } from "../../lib/utils";
defineProps({ class: { type: String, default: "" } });
</script>
<template>
  <span data-slot="breadcrumb-page" role="link" aria-disabled="true" aria-current="page" :class="cn('text-foreground font-normal', $props.class)">
    <slot />
  </span>
</template>
