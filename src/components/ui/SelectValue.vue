<script setup>
import { inject, computed } from "vue";

const props = defineProps({ placeholder: { type: String, default: "" } });
const select = inject("select", null);
const label = computed(() => select?.labels[select.modelValue()] ?? "");
</script>

<template>
  <span data-slot="select-value" class="line-clamp-1 flex items-center gap-2">
    {{ label || placeholder }}
  </span>
</template>
