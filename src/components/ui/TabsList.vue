<script setup>
import { cn } from "../../lib/utils";
defineProps({ class: { type: String, default: "" } });
</script>

<template>
  <div
    data-slot="tabs-list"
    :class="cn('bg-muted text-muted-foreground inline-flex h-9 w-fit items-center justify-center rounded-xl p-[3px] flex', $props.class)"
  >
    <slot />
  </div>
</template>
