<script setup>
import { inject, computed } from "vue";
import { Circle } from "lucide-vue-next";
import { cn } from "../../lib/utils";

const props = defineProps({
  class: { type: String, default: "" },
  value: { type: String, required: true },
});
const group = inject("dropdownRadioGroup", null);
const checked = computed(() => group?.modelValue.value === props.value);
</script>

<template>
  <div
    data-slot="dropdown-menu-radio-item"
    @click="group?.select(value)"
    :class="cn(
      'hover:bg-accent hover:text-accent-foreground relative flex cursor-default items-center gap-2 rounded-sm py-1.5 pr-2 pl-8 text-sm outline-hidden select-none',
      props.class,
    )"
  >
    <span class="pointer-events-none absolute left-2 flex size-3.5 items-center justify-center">
      <Circle v-if="checked" class="size-2 fill-current" />
    </span>
    <slot />
  </div>
</template>
