<script setup>
import { alertVariants } from "../../lib/variants/alert";
import { cn } from "../../lib/utils";

const props = defineProps({
  class: { type: String, default: "" },
  variant: { type: String, default: "default" },
});
</script>

<template>
  <div data-slot="alert" role="alert" :class="cn(alertVariants({ variant: props.variant }), props.class)" v-bind="$attrs">
    <slot />
  </div>
</template>
