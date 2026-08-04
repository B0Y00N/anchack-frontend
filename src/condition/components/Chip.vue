<script setup>
import { Check } from "lucide-vue-next";
defineProps({ label: { type: String, required: true }, selected: { type: Boolean, default: false } });
defineEmits(["click"]);
</script>
<template>
  <button
    @click="$emit('click')"
    :class="`inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-medium border transition-all ${selected ? 'bg-primary text-primary-foreground border-primary shadow-sm' : 'bg-white text-foreground border-border hover:border-primary/40 hover:bg-secondary'}`"
  >
    <Check v-if="selected" :size="12" />{{ label }}
  </button>
</template>
