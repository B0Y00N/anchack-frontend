<script setup>
import { provide, computed } from "vue";

const props = defineProps({ modelValue: { type: String, default: "" } });
const emit = defineEmits(["update:modelValue"]);

provide("dropdownRadioGroup", {
  modelValue: computed(() => props.modelValue),
  select: (v) => emit("update:modelValue", v),
});
</script>

<template>
  <div data-slot="dropdown-menu-radio-group"><slot /></div>
</template>
