<script setup>
import { inject } from "vue";
import { X } from "lucide-vue-next";
import DialogOverlay from "./DialogOverlay.vue";
import { cn } from "../../lib/utils";

const props = defineProps({ class: { type: String, default: "" } });
const dialog = inject("dialog", null);
</script>

<template>
  <Teleport to="body">
    <template v-if="dialog?.isOpen()">
      <DialogOverlay @click="dialog.setOpen(false)" />
      <div
        data-slot="dialog-content"
        :class="cn(
          'bg-background fixed top-[50%] left-[50%] z-50 grid w-full max-w-[calc(100%-2rem)] translate-x-[-50%] translate-y-[-50%] gap-4 rounded-lg border p-6 shadow-lg sm:max-w-lg',
          props.class,
        )"
      >
        <slot />
        <button
          type="button"
          class="ring-offset-background focus:ring-ring absolute top-4 right-4 rounded-xs opacity-70 transition-opacity hover:opacity-100 focus:ring-2 focus:ring-offset-2 focus:outline-hidden disabled:pointer-events-none"
          @click="dialog.setOpen(false)"
        >
          <X class="size-4" />
          <span class="sr-only">Close</span>
        </button>
      </div>
    </template>
  </Teleport>
</template>
