<script setup>
import { inject } from "vue";
import { cn } from "../../lib/utils";
const props = defineProps({ class: { type: String, default: "" }, inset: { type: Boolean, default: false }, variant: { type: String, default: "default" } });
const menu = inject("menubarMenu", null);
</script>
<template>
  <div
    data-slot="menubar-item"
    :data-inset="inset"
    :data-variant="variant"
    @click="menu?.close()"
    :class="cn('hover:bg-accent hover:text-accent-foreground data-[variant=destructive]:text-destructive relative flex cursor-default items-center gap-2 rounded-sm px-2 py-1.5 text-sm outline-hidden select-none data-[inset=true]:pl-8', props.class)"
  >
    <slot />
  </div>
</template>
