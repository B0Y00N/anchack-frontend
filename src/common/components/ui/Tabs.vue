<script setup>
import { provide, computed } from "vue";
import { cn } from "../../lib/utils";

const props = defineProps({
  class: { type: String, default: "" },
  modelValue: { type: String, default: "" },
});
const emit = defineEmits(["update:modelValue"]);

provide("tabs", {
  active: computed(() => props.modelValue),
  select: (v) => emit("update:modelValue", v),
});
</script>

<template>
  <div data-slot="tabs" :class="cn('flex flex-col gap-2', props.class)">
    <slot />
  </div>
</template>
