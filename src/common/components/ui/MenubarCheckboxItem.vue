<script setup>
import { Check } from "lucide-vue-next";
import { cn } from "../../lib/utils";
const props = defineProps({ class: { type: String, default: "" }, checked: { type: Boolean, default: false } });
const emit = defineEmits(["update:checked"]);
</script>
<template>
  <div data-slot="menubar-checkbox-item" @click="emit('update:checked', !checked)" :class="cn('hover:bg-accent relative flex cursor-default items-center gap-2 rounded-sm py-1.5 pr-2 pl-8 text-sm outline-hidden select-none', props.class)">
    <span class="pointer-events-none absolute left-2 flex size-3.5 items-center justify-center">
      <Check v-if="checked" class="size-4" />
    </span>
    <slot />
  </div>
</template>
