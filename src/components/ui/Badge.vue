<script setup>
import { badgeVariants } from "../../lib/variants/badge";
import { cn } from "../../lib/utils";

const props = defineProps({
  class: { type: String, default: "" },
  variant: { type: String, default: "default" },
  as: { type: String, default: "span" },
});
</script>

<template>
  <component :is="as" data-slot="badge" :class="cn(badgeVariants({ variant: props.variant }), props.class)" v-bind="$attrs">
    <slot />
  </component>
</template>
