<script setup>
import { provide, computed } from "vue";

const props = defineProps({
  modelValue: { type: Boolean, default: false },
});
const emit = defineEmits(["update:modelValue"]);

provide("collapsible", {
  open: computed(() => props.modelValue),
  toggle: () => emit("update:modelValue", !props.modelValue),
});
</script>

<template>
  <div data-slot="collapsible">
    <slot />
  </div>
</template>
