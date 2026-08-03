<script setup>
import { inject, computed } from "vue";
import { toggleVariants } from "../../lib/variants/toggle";
import { cn } from "../../lib/utils";

const props = defineProps({
  class: { type: String, default: "" },
  value: { type: String, required: true },
  variant: { type: String, default: undefined },
  size: { type: String, default: undefined },
});

const group = inject("toggleGroup", null);
const effectiveVariant = computed(() => group?.variant.value || props.variant || "default");
const effectiveSize = computed(() => group?.size.value || props.size || "default");
const selected = computed(() => group?.isSelected(props.value));
</script>

<template>
  <button
    type="button"
    data-slot="toggle-group-item"
    :data-variant="effectiveVariant"
    :data-size="effectiveSize"
    :data-state="selected ? 'on' : 'off'"
    @click="group?.select(value)"
    :class="cn(
      toggleVariants({ variant: effectiveVariant, size: effectiveSize }),
      'min-w-0 flex-1 shrink-0 rounded-none shadow-none first:rounded-l-md last:rounded-r-md focus:z-10 focus-visible:z-10 data-[variant=outline]:border-l-0 data-[variant=outline]:first:border-l',
      props.class,
    )"
  >
    <slot />
  </button>
</template>
