<script setup>
import { inject } from "vue";
import { cn } from "../../lib/utils";

const props = defineProps({ class: { type: String, default: "" } });
const select = inject("select", null);
</script>

<template>
  <div
    v-if="select?.open.value"
    data-slot="select-content"
    :class="cn(
      'bg-popover text-popover-foreground absolute z-50 max-h-96 min-w-[8rem] w-full overflow-x-hidden overflow-y-auto rounded-md border shadow-md top-full mt-1',
      props.class,
    )"
  >
    <div class="p-1">
      <slot />
    </div>
  </div>
</template>
