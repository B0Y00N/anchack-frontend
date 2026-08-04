<script setup>
import { inject } from "vue";
import { ArrowRight } from "lucide-vue-next";
import Button from "./Button.vue";
import { cn } from "../../lib/utils";

const props = defineProps({ class: { type: String, default: "" } });
const carousel = inject("carousel", null);
</script>

<template>
  <Button
    variant="outline"
    size="icon"
    :disabled="!carousel?.canScrollNext.value"
    @click="carousel?.scrollNext()"
    :class="cn(
      'absolute size-8 rounded-full',
      carousel?.orientation === 'vertical'
        ? '-bottom-12 left-1/2 -translate-x-1/2 rotate-90'
        : 'top-1/2 -right-12 -translate-y-1/2',
      props.class,
    )"
  >
    <ArrowRight class="size-4" />
    <span class="sr-only">Next slide</span>
  </Button>
</template>
