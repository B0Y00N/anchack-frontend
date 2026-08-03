<script setup>
import { useToast } from "../../composables/useToast";

const { toasts } = useToast();

const typeClass = {
  default: "bg-popover text-popover-foreground border-border",
  success: "bg-popover text-popover-foreground border-green-500",
  error: "bg-popover text-popover-foreground border-destructive",
};
</script>

<template>
  <div data-slot="toaster" class="fixed bottom-4 right-4 z-[100] flex flex-col gap-2">
    <div
      v-for="t in toasts"
      :key="t.id"
      :class="`rounded-md border px-4 py-3 text-sm shadow-lg ${typeClass[t.type] || typeClass.default}`"
    >
      {{ t.message }}
    </div>
  </div>
</template>
