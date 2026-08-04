<script setup>
import { ChevronRight } from "lucide-vue-next";
import { cn } from "../../lib/utils";
defineProps({ class: { type: String, default: "" }, inset: { type: Boolean, default: false } });
</script>
<template>
  <div data-slot="menubar-sub-trigger" :data-inset="inset" :class="cn('hover:bg-accent flex cursor-default items-center rounded-sm px-2 py-1.5 text-sm outline-hidden select-none data-[inset=true]:pl-8', $props.class)">
    <slot />
    <ChevronRight class="ml-auto size-4" />
  </div>
</template>
