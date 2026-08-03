<script setup>
import { inject, computed } from "vue";
import { cn } from "../../lib/utils";

const props = defineProps({
  class: { type: String, default: "" },
  value: { type: String, required: true },
});

const tabs = inject("tabs", null);
const active = computed(() => tabs?.active.value === props.value);
</script>

<template>
  <div v-if="active" data-slot="tabs-content" :class="cn('flex-1 outline-none', props.class)">
    <slot />
  </div>
</template>
