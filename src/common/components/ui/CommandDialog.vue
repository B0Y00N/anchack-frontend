<script setup>
import Dialog from "./Dialog.vue";
import DialogContent from "./DialogContent.vue";
import DialogHeader from "./DialogHeader.vue";
import DialogTitle from "./DialogTitle.vue";
import DialogDescription from "./DialogDescription.vue";
import Command from "./Command.vue";

defineProps({
  modelValue: { type: Boolean, default: undefined },
  title: { type: String, default: "Command Palette" },
  description: { type: String, default: "Search for a command to run..." },
});
</script>

<template>
  <Dialog :model-value="modelValue" @update:model-value="$emit('update:modelValue', $event)">
    <DialogHeader class="sr-only">
      <DialogTitle>{{ title }}</DialogTitle>
      <DialogDescription>{{ description }}</DialogDescription>
    </DialogHeader>
    <DialogContent class="overflow-hidden p-0">
      <Command>
        <slot />
      </Command>
    </DialogContent>
  </Dialog>
</template>
