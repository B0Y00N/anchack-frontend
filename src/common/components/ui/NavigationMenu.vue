<script setup>
import { cn } from "../../lib/utils";
defineProps({ class: { type: String, default: "" } });
</script>
<template>
  <nav data-slot="navigation-menu" :class="cn('group/navigation-menu relative flex max-w-max flex-1 items-center justify-center', $props.class)">
    <slot />
  </nav>
</template>
