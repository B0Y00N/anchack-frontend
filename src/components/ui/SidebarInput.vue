<script setup>
import Input from "./Input.vue";
import { cn } from "../../lib/utils";
defineProps({ class: { type: String, default: "" }, modelValue: { type: String, default: "" } });
defineEmits(["update:modelValue"]);
</script>
<template>
  <Input
    data-slot="sidebar-input"
    data-sidebar="input"
    :model-value="modelValue"
    @update:model-value="$emit('update:modelValue', $event)"
    :class="cn('bg-background h-8 w-full shadow-none', $props.class)"
  />
</template>
