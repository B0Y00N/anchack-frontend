<script setup>
// react-hook-form의 FormProvider 대체. values/errors를 부모(v-model)로 관리한다고 가정합니다.
import { provide, computed } from "vue";

const props = defineProps({
  values: { type: Object, default: () => ({}) },
  errors: { type: Object, default: () => ({}) }, // { [fieldName]: string }
});

provide("formValues", computed(() => props.values));
provide("formErrors", computed(() => props.errors));
</script>

<template>
  <form data-slot="form">
    <slot />
  </form>
</template>
