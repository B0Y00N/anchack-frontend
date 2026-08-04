<script setup>
import { computed } from "vue";
import { cn } from "../../lib/utils";

const props = defineProps({
  class: { type: String, default: "" },
  containerClass: { type: String, default: "" },
  modelValue: { type: String, default: "" },
  maxLength: { type: Number, default: 6 },
  disabled: { type: Boolean, default: false },
});
const emit = defineEmits(["update:modelValue"]);

const chars = computed(() => {
  const arr = props.modelValue.split("");
  while (arr.length < props.maxLength) arr.push("");
  return arr;
});

function setChar(index, value) {
  const v = (value || "").slice(-1);
  const arr = props.modelValue.split("");
  arr[index] = v;
  emit("update:modelValue", arr.join("").slice(0, props.maxLength));
}
</script>

<template>
  <div
    data-slot="input-otp"
    :class="cn('flex items-center gap-2', disabled && 'opacity-50', containerClass)"
  >
    <slot :chars="chars" :set-char="setChar" :disabled="disabled" />
  </div>
</template>
