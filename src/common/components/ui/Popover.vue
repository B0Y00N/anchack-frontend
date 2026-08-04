<script setup>
import { ref, provide } from "vue";
import { useClickOutside } from "../../composables/useClickOutside";

const props = defineProps({ modelValue: { type: Boolean, default: undefined } });
const emit = defineEmits(["update:modelValue"]);

const internalOpen = ref(false);
const rootEl = ref(null);

function setOpen(v) {
  internalOpen.value = v;
  emit("update:modelValue", v);
}

const isOpen = () => (props.modelValue !== undefined ? props.modelValue : internalOpen.value);

provide("popover", {
  isOpen,
  toggle: () => setOpen(!isOpen()),
  close: () => setOpen(false),
});

useClickOutside(rootEl, () => setOpen(false));
</script>

<template>
  <div data-slot="popover" ref="rootEl" class="relative inline-block">
    <slot />
  </div>
</template>
