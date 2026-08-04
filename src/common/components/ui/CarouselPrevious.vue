<script setup>
import { inject } from "vue";
import { ArrowLeft } from "lucide-vue-next";
import Button from "./Button.vue";
import { cn } from "../../lib/utils";

const props = defineProps({ class: { type: String, default: "" } });
const carousel = inject("carousel", null);
</script>

<template>
  <Button
    variant="outline"
    size="icon"
    :disabled="!carousel?.canScrollPrev.value"
    @click="carousel?.scrollPrev()"
    :class="cn(
      'absolute size-8 rounded-full',
      carousel?.orientation === 'vertical'
        ? '-top-12 left-1/2 -translate-x-1/2 rotate-90'
        : 'top-1/2 -left-12 -translate-y-1/2',
      props.class,
    )"
  >
    <ArrowLeft class="size-4" />
    <span class="sr-only">Previous slide</span>
  </Button>
</template>
