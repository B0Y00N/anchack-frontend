<script setup>
import { inject } from "vue";
import { X } from "lucide-vue-next";
import SheetOverlay from "./SheetOverlay.vue";
import { cn } from "../../lib/utils";

const props = defineProps({
  class: { type: String, default: "" },
  side: { type: String, default: "right" }, // "top" | "right" | "bottom" | "left"
});
const sheet = inject("sheet", null);
</script>

<template>
  <Teleport to="body">
    <template v-if="sheet?.isOpen()">
      <SheetOverlay @click="sheet.setOpen(false)" />
      <div
        data-slot="sheet-content"
        :class="cn(
          'bg-background fixed z-50 flex flex-col gap-4 shadow-lg transition ease-in-out duration-300',
          side === 'right' && 'inset-y-0 right-0 h-full w-3/4 border-l sm:max-w-sm',
          side === 'left' && 'inset-y-0 left-0 h-full w-3/4 border-r sm:max-w-sm',
          side === 'top' && 'inset-x-0 top-0 h-auto border-b',
          side === 'bottom' && 'inset-x-0 bottom-0 h-auto border-t',
          props.class,
        )"
      >
        <slot />
        <button
          type="button"
          class="ring-offset-background focus:ring-ring absolute top-4 right-4 rounded-xs opacity-70 transition-opacity hover:opacity-100 focus:ring-2 focus:ring-offset-2 focus:outline-hidden disabled:pointer-events-none"
          @click="sheet.setOpen(false)"
        >
          <X class="size-4" />
          <span class="sr-only">Close</span>
        </button>
      </div>
    </template>
  </Teleport>
</template>
