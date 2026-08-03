<script setup>
import { provide, computed } from "vue";
import { cn } from "../../lib/utils";

const props = defineProps({
  class: { type: String, default: "" },
  variant: { type: String, default: "default" },
  size: { type: String, default: "default" },
  type: { type: String, default: "single" }, // "single" | "multiple"
  modelValue: { type: [String, Array], default: "" },
});
const emit = defineEmits(["update:modelValue"]);

function select(value) {
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

function isSelected(value) {
  return props.type === "multiple"
    ? Array.isArray(props.modelValue) && props.modelValue.includes(value)
    : props.modelValue === value;
}

provide("toggleGroup", {
  variant: computed(() => props.variant),
  size: computed(() => props.size),
  select,
  isSelected,
});
</script>

<template>
  <div
    data-slot="toggle-group"
    :data-variant="variant"
    :data-size="size"
    :class="cn('group/toggle-group flex w-fit items-center rounded-md data-[variant=outline]:shadow-xs', props.class)"
  >
    <slot />
  </div>
</template>
