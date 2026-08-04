<script setup>
import { ref, provide } from "vue";

const props = defineProps({ modelValue: { type: Boolean, default: undefined } });
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

provide("sheet", { isOpen, setOpen });
</script>

<template>
  <div data-slot="sheet"><slot /></div>
</template>
