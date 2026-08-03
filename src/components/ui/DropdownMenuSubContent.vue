<script setup>
import { inject } from "vue";
import { cn } from "../../lib/utils";

const props = defineProps({ class: { type: String, default: "" } });
const sub = inject("dropdownMenuSub", null);
</script>

<template>
  <div
    v-if="sub?.open.value"
    data-slot="dropdown-menu-sub-content"
    :class="cn(
      'bg-popover text-popover-foreground absolute left-full top-0 z-50 min-w-[8rem] overflow-hidden rounded-md border p-1 shadow-lg',
      props.class,
    )"
  >
    <slot />
  </div>
</template>
