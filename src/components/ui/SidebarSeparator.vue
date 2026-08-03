<script setup>
import Separator from "./Separator.vue";
import { cn } from "../../lib/utils";
defineProps({ class: { type: String, default: "" } });
</script>
<template>
  <Separator data-slot="sidebar-separator" data-sidebar="separator" :class="cn('bg-sidebar-border mx-2 w-auto', $props.class)" />
</template>
