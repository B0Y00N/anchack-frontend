<script setup>
import { provide, computed } from "vue";
import { cn } from "../../lib/utils";

const props = defineProps({
  class: { type: String, default: "" },
  type: { type: String, default: "single" }, // "single" | "multiple"
  modelValue: { type: [String, Array], default: "" },
});
const emit = defineEmits(["update:modelValue"]);

function toggleItem(value) {
  if (props.type === "multiple") {
    const arr = Array.isArray(props.modelValue) ? [...props.modelValue] : [];
    const idx = arr.indexOf(value);
    if (idx >= 0) arr.splice(idx, 1);
    else arr.push(value);
    emit("update:modelValue", arr);
  } else {
    emit("update:modelValue", props.modelValue === value ? "" : value);
  }
}

function isOpen(value) {
  return props.type === "multiple"
    ? Array.isArray(props.modelValue) && props.modelValue.includes(value)
    : props.modelValue === value;
}

provide("accordion", { toggleItem, isOpen });
</script>

<template>
  <div data-slot="accordion" :class="cn(props.class)">
    <slot />
  </div>
</template>
