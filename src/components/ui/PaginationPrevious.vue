<script setup>
import { ChevronLeft } from "lucide-vue-next";
import PaginationLink from "./PaginationLink.vue";
import { cn } from "../../lib/utils";
defineProps({ class: { type: String, default: "" } });
</script>
<template>
  <PaginationLink aria-label="Go to previous page" size="default" :class="cn('gap-1 px-2.5 sm:pl-2.5', $props.class)" v-bind="$attrs">
    <ChevronLeft />
    <span class="hidden sm:block">Previous</span>
  </PaginationLink>
</template>
