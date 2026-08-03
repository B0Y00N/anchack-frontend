<script setup>
import { computed } from "vue";
import Label from "./Label.vue";
import { useFormField } from "../../composables/useFormField";
import { cn } from "../../lib/utils";

defineProps({ class: { type: String, default: "" } });
const { formItemId, error } = useFormField();
const hasError = computed(() => !!error.value);
</script>

<template>
  <Label data-slot="form-label" :data-error="hasError" :for="formItemId" :class="cn('data-[error=true]:text-destructive', $props.class)">
    <slot />
  </Label>
</template>
