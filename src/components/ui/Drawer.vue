<script setup>
import { ref, provide } from "vue";

const props = defineProps({
  modelValue: { type: Boolean, default: undefined },
  direction: { type: String, default: "bottom" }, // "top" | "bottom" | "left" | "right"
});
const emit = defineEmits(["update:modelValue"]);

const internalOpen = ref(false);
const isControlled = props.modelValue !== undefined;

function setOpen(v) {
  if (isControlled) emit("update:modelValue", v);
  else internalOpen.value = v;
}
function isOpen() {
  return isControlled ? props.modelValue : internalOpen.value;
}

provide("drawer", { isOpen, setOpen, direction: props.direction });
</script>

<template>
  <div data-slot="drawer"><slot /></div>
</template>
