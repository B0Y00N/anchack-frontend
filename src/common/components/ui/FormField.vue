<script setup>
import { inject, provide, computed } from "vue";

const props = defineProps({ name: { type: String, required: true } });
const errors = inject("formErrors", computed(() => ({})));

provide("formField", {
  name: props.name,
  error: computed(() => errors.value?.[props.name] ?? null),
});
</script>

<template>
  <slot />
</template>
