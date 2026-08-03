<script setup>
import { useFormField } from "../../composables/useFormField";
import { cn } from "../../lib/utils";

defineProps({ class: { type: String, default: "" } });
const { formDescriptionId } = useFormField();
</script>

<template>
  <p data-slot="form-description" :id="formDescriptionId" :class="cn('text-muted-foreground text-sm', $props.class)">
    <slot />
  </p>
</template>
