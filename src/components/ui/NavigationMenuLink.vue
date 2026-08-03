<script setup>
import { navigationMenuTriggerStyle } from "../../lib/variants/navigation-menu";
import { cn } from "../../lib/utils";
defineProps({ class: { type: String, default: "" }, href: { type: String, default: "#" }, active: { type: Boolean, default: false } });
</script>
<template>
  <a
    data-slot="navigation-menu-link"
    :data-active="active"
    :href="href"
    :class="cn('data-[active=true]:bg-accent/50 data-[active=true]:text-accent-foreground hover:bg-accent hover:text-accent-foreground flex flex-col gap-1 rounded-sm p-2 text-sm outline-none transition-all', $props.class)"
  >
    <slot />
  </a>
</template>
