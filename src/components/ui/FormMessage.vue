<script setup>
import { computed, useSlots } from "vue";
import { useFormField } from "../../composables/useFormField";
import { cn } from "../../lib/utils";

defineProps({ class: { type: String, default: "" } });
const { formMessageId, error } = useFormField();
const slots = useSlots();
const body = computed(() => error.value || null);
const hasFallback = computed(() => !!slots.default);
</script>

<template>
  <p v-if="body || hasFallback" data-slot="form-message" :id="formMessageId" :class="cn('text-destructive text-sm', $props.class)">
    {{ body }}<slot v-if="!body" />
  </p>
</template>
