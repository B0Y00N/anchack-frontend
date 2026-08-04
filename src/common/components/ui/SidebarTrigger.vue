<script setup>
import { inject } from "vue";
import { PanelLeft } from "lucide-vue-next";
import Button from "./Button.vue";
import { cn } from "../../lib/utils";

const props = defineProps({ class: { type: String, default: "" } });
const sidebar = inject("sidebar", null);
</script>

<template>
  <Button data-sidebar="trigger" data-slot="sidebar-trigger" variant="ghost" size="icon" :class="cn('size-7', props.class)" @click="sidebar?.toggleSidebar()">
    <PanelLeft />
    <span class="sr-only">Toggle Sidebar</span>
  </Button>
</template>
