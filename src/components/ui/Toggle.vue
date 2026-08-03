<script setup>
import { toggleVariants } from "../../lib/variants/toggle";
import { cn } from "../../lib/utils";

const props = defineProps({
  class: { type: String, default: "" },
  variant: { type: String, default: "default" },
  size: { type: String, default: "default" },
  modelValue: { type: Boolean, default: false },
  disabled: { type: Boolean, default: false },
});
const emit = defineEmits(["update:modelValue"]);

function toggle() {
  if (props.disabled) return;
  emit("update:modelValue", !props.modelValue);
}
</script>

<template>
  <button
    type="button"
    :disabled="disabled"
    data-slot="toggle"
    :data-state="modelValue ? 'on' : 'off'"
    @click="toggle"
    :class="cn(toggleVariants({ variant: props.variant, size: props.size }), props.class)"
  >
    <slot />
  </button>
</template>
