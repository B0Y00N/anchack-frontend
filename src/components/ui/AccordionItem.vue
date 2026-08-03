<script setup>
import { provide, computed } from "vue";
import { cn } from "../../lib/utils";

const props = defineProps({
  class: { type: String, default: "" },
  value: { type: String, required: true },
});

provide("accordionItemValue", computed(() => props.value));
</script>

<template>
  <div data-slot="accordion-item" :class="cn('border-b last:border-b-0', props.class)">
    <slot />
  </div>
</template>
