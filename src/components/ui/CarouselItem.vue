<script setup>
import { inject } from "vue";
import { cn } from "../../lib/utils";

const props = defineProps({ class: { type: String, default: "" } });
const carousel = inject("carousel", null);
</script>

<template>
  <div
    data-slot="carousel-item"
    role="group"
    aria-roledescription="slide"
    :class="cn(
      'min-w-0 shrink-0 grow-0 basis-full',
      carousel?.orientation === 'vertical' ? 'pt-4' : 'pl-4',
      props.class,
    )"
  >
    <slot />
  </div>
</template>
