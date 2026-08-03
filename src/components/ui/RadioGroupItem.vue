<script setup>
import { inject, computed } from "vue";
import { Circle } from "lucide-vue-next";
import { cn } from "../../lib/utils";

const props = defineProps({
  class: { type: String, default: "" },
  value: { type: String, required: true },
  disabled: { type: Boolean, default: false },
});

const group = inject("radioGroup", null);
const checked = computed(() => group?.modelValue.value === props.value);

function select() {
  if (props.disabled) return;
  group?.select(props.value);
}
</script>

<template>
  <button
    type="button"
    role="radio"
    :aria-checked="checked"
    :disabled="disabled"
    data-slot="radio-group-item"
    :data-state="checked ? 'checked' : 'unchecked'"
    @click="select"
    :class="cn(
      'border-input text-primary focus-visible:border-ring focus-visible:ring-ring/50 aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive dark:bg-input/30 aspect-square size-4 shrink-0 rounded-full border shadow-xs transition-[color,box-shadow] outline-none focus-visible:ring-[3px] disabled:cursor-not-allowed disabled:opacity-50',
      props.class,
    )"
  >
    <span v-if="checked" data-slot="radio-group-indicator" class="relative flex items-center justify-center">
      <Circle class="fill-primary absolute top-1/2 left-1/2 size-2 -translate-x-1/2 -translate-y-1/2" />
    </span>
  </button>
</template>
