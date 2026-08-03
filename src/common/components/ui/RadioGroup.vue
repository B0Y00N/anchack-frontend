<script setup>
import { provide, computed } from "vue";
import { cn } from "../../lib/utils";

const props = defineProps({
  class: { type: String, default: "" },
  modelValue: { type: String, default: "" },
});
const emit = defineEmits(["update:modelValue"]);

provide("radioGroup", {
  modelValue: computed(() => props.modelValue),
  select: (v) => emit("update:modelValue", v),
});
</script>

<template>
  <div data-slot="radio-group" role="radiogroup" :class="cn('grid gap-3', props.class)" v-bind="$attrs">
    <slot />
  </div>
</template>
