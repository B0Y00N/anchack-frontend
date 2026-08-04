<script setup>
import { inject } from "vue";
import { cn } from "../../lib/utils";

const props = defineProps({ class: { type: String, default: "" } });
const menu = inject("dropdownMenu", null);
</script>

<template>
  <div
    v-if="menu?.open.value"
    data-slot="dropdown-menu-content"
    :class="cn(
      'bg-popover text-popover-foreground absolute z-50 min-w-[8rem] overflow-x-hidden overflow-y-auto rounded-md border p-1 shadow-md top-full mt-1 left-0',
      props.class,
    )"
  >
    <slot />
  </div>
</template>
