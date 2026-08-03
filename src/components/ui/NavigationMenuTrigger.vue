<script setup>
import { inject } from "vue";
import { ChevronDown } from "lucide-vue-next";
import { navigationMenuTriggerStyle } from "../../lib/variants/navigation-menu";
import { cn } from "../../lib/utils";

const props = defineProps({ class: { type: String, default: "" } });
const item = inject("navMenuItem", null);
</script>

<template>
  <button
    type="button"
    data-slot="navigation-menu-trigger"
    :data-state="item?.open.value ? 'open' : 'closed'"
    @click="item?.toggle()"
    :class="cn(navigationMenuTriggerStyle(), 'group', props.class)"
  >
    <slot />
    <ChevronDown class="relative top-[1px] ml-1 size-3 transition duration-300 group-data-[state=open]:rotate-180" aria-hidden="true" />
  </button>
</template>
