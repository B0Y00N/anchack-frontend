<script setup>
import { Check } from "lucide-vue-next";
import { cn } from "../../lib/utils";

const props = defineProps({
  class: { type: String, default: "" },
  modelValue: { type: Boolean, default: false },
  disabled: { type: Boolean, default: false },
});
const emit = defineEmits(["update:modelValue"]);

function toggle() {
  if (props.disabled) return;
  emit("update:modelValue", !props.modelValue);
}
</script>

<template>
  <button
    type="button"
    role="checkbox"
    :aria-checked="modelValue"
    :disabled="disabled"
    data-slot="checkbox"
    :data-state="modelValue ? 'checked' : 'unchecked'"
    @click="toggle"
    :class="cn(
      'peer border bg-input-background dark:bg-input/30 data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground dark:data-[state=checked]:bg-primary data-[state=checked]:border-primary focus-visible:border-ring focus-visible:ring-ring/50 aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive size-4 shrink-0 rounded-[4px] border shadow-xs transition-shadow outline-none focus-visible:ring-[3px] disabled:cursor-not-allowed disabled:opacity-50',
      props.class,
    )"
  >
    <span v-if="modelValue" data-slot="checkbox-indicator" class="flex items-center justify-center text-current transition-none">
      <Check class="size-3.5" />
    </span>
  </button>
</template>
