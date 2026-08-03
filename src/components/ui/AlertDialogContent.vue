<script setup>
import { inject } from "vue";
import AlertDialogOverlay from "./AlertDialogOverlay.vue";
import { cn } from "../../lib/utils";

const props = defineProps({ class: { type: String, default: "" } });
const dialog = inject("alertDialog", null);
</script>

<template>
  <Teleport to="body">
    <template v-if="dialog?.isOpen()">
      <AlertDialogOverlay />
      <div
        data-slot="alert-dialog-content"
        :class="cn(
          'bg-background fixed top-[50%] left-[50%] z-50 grid w-full max-w-[calc(100%-2rem)] translate-x-[-50%] translate-y-[-50%] gap-4 rounded-lg border p-6 shadow-lg sm:max-w-lg',
          props.class,
        )"
      >
        <slot />
      </div>
    </template>
  </Teleport>
</template>
