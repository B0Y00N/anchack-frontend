<script setup>
import { buttonVariants } from "../../lib/variants/button";
import { cn } from "../../lib/utils";

const props = defineProps({
  class: { type: String, default: "" },
  isActive: { type: Boolean, default: false },
  size: { type: String, default: "icon" },
  href: { type: String, default: "#" },
});
</script>

<template>
  <a
    :aria-current="isActive ? 'page' : undefined"
    data-slot="pagination-link"
    :data-active="isActive"
    :href="href"
    :class="cn(buttonVariants({ variant: isActive ? 'outline' : 'ghost', size: props.size }), props.class)"
    v-bind="$attrs"
  >
    <slot />
  </a>
</template>
