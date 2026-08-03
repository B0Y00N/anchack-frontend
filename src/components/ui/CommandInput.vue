<script setup>
import { inject } from "vue";
import { Search } from "lucide-vue-next";
import { cn } from "../../lib/utils";

defineProps({ class: { type: String, default: "" }, placeholder: { type: String, default: "" } });
const command = inject("command", null);
</script>

<template>
  <div data-slot="command-input-wrapper" class="flex h-9 items-center gap-2 border-b px-3">
    <Search class="size-4 shrink-0 opacity-50" />
    <input
      data-slot="command-input"
      type="text"
      :placeholder="placeholder"
      v-model="command.search.value"
      :class="cn(
        'placeholder:text-muted-foreground flex h-10 w-full rounded-md bg-transparent py-3 text-sm outline-hidden disabled:cursor-not-allowed disabled:opacity-50',
        $props.class,
      )"
    />
  </div>
</template>
