<script setup>
import { ref, reactive, provide } from "vue";
import { useClickOutside } from "../../composables/useClickOutside";

const props = defineProps({
  modelValue: { type: String, default: "" },
  disabled: { type: Boolean, default: false },
});
const emit = defineEmits(["update:modelValue"]);

const open = ref(false);
const rootEl = ref(null);
const labels = reactive({}); // value -> label text, filled in by SelectItem

function select(value) {
  emit("update:modelValue", value);
  open.value = false;
}

provide("select", {
  modelValue: () => props.modelValue,
  open,
  toggle: () => {
    if (!props.disabled) open.value = !open.value;
  },
  close: () => (open.value = false),
  select,
  registerLabel: (value, label) => (labels[value] = label),
  labels,
});

useClickOutside(rootEl, () => (open.value = false));
</script>

<template>
  <div data-slot="select" ref="rootEl" class="relative">
    <slot />
  </div>
</template>
