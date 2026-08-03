<script setup>
import { inject, computed } from "vue";
import { cn } from "../../lib/utils";

const props = defineProps({ class: { type: String, default: "" } });

const accordion = inject("accordion", null);
const itemValue = inject("accordionItemValue", computed(() => ""));
const isOpen = computed(() => accordion?.isOpen(itemValue.value));
</script>

<template>
  <div v-if="isOpen" data-slot="accordion-content" data-state="open" class="overflow-hidden text-sm">
    <div :class="cn('pt-0 pb-4', props.class)">
      <slot />
    </div>
  </div>
</template>
