<script setup>
import { computed } from "vue";
import { useFormField } from "../../composables/useFormField";

const { formItemId, formDescriptionId, formMessageId, error } = useFormField();
const hasError = computed(() => !!error.value);
const describedBy = computed(() => (hasError.value ? `${formDescriptionId} ${formMessageId}` : formDescriptionId));
</script>

<template>
  <div data-slot="form-control" :id="formItemId" :aria-describedby="describedBy" :aria-invalid="hasError">
    <slot />
  </div>
</template>
