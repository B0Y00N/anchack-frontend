<script setup>
import Skeleton from "./Skeleton.vue";
import { cn } from "../../lib/utils";

const props = defineProps({ class: { type: String, default: "" }, showIcon: { type: Boolean, default: false } });
const width = `${Math.floor(Math.random() * 40) + 50}%`;
</script>

<template>
  <div data-slot="sidebar-menu-skeleton" data-sidebar="menu-skeleton" :class="cn('flex h-8 items-center gap-2 rounded-md px-2', props.class)">
    <Skeleton v-if="showIcon" class="size-4 rounded-md" />
    <Skeleton class="h-4 flex-1" :style="{ maxWidth: width }" />
  </div>
</template>
