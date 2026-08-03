<script setup>
import { cn } from "../../lib/utils";
defineProps({ class: { type: String, default: "" }, href: { type: String, default: "#" } });
</script>
<template>
  <a data-slot="breadcrumb-link" :href="href" :class="cn('hover:text-foreground transition-colors', $props.class)" v-bind="$attrs">
    <slot />
  </a>
</template>
