<script setup>
import { ChevronRight } from "lucide-vue-next";
import PaginationLink from "./PaginationLink.vue";
import { cn } from "../../lib/utils";
defineProps({ class: { type: String, default: "" } });
</script>
<template>
  <PaginationLink aria-label="Go to next page" size="default" :class="cn('gap-1 px-2.5 sm:pr-2.5', $props.class)" v-bind="$attrs">
    <span class="hidden sm:block">Next</span>
    <ChevronRight />
  </PaginationLink>
</template>
