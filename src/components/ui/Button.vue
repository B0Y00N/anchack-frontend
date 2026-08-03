<script setup>
import { buttonVariants } from "../../lib/variants/button";
import { cn } from "../../lib/utils";

const props = defineProps({
  class: { type: String, default: "" },
  variant: { type: String, default: "default" },
  size: { type: String, default: "default" },
  as: { type: String, default: "button" }, // React asChild 대체: as="a" 등으로 태그 변경
});
</script>

<template>
  <component
    :is="as"
    data-slot="button"
    :class="cn(buttonVariants({ variant: props.variant, size: props.size }), props.class)"
    v-bind="$attrs"
  >
    <slot />
  </component>
</template>
