<script setup>
import { inject } from "vue";
import { cn } from "../../lib/utils";

const props = defineProps({ class: { type: String, default: "" } });
const menu = inject("menubarMenu", null);
</script>

<template>
  <div
    data-slot="menubar-trigger"
    :data-state="menu?.open.value ? 'open' : 'closed'"
    @click="menu?.toggle()"
    :class="cn(
      'flex items-center rounded-sm px-2 py-1 text-sm font-medium outline-hidden select-none data-[state=open]:bg-accent data-[state=open]:text-accent-foreground cursor-default',
      props.class,
    )"
  >
    <slot />
  </div>
</template>
