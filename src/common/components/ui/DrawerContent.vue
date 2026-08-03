<script setup>
import { inject } from "vue";
import DrawerOverlay from "./DrawerOverlay.vue";
import { cn } from "../../lib/utils";

const props = defineProps({ class: { type: String, default: "" } });
const drawer = inject("drawer", null);
const direction = drawer?.direction || "bottom";
</script>

<template>
  <Teleport to="body">
    <template v-if="drawer?.isOpen()">
      <DrawerOverlay @click="drawer.setOpen(false)" />
      <div
        data-slot="drawer-content"
        :class="cn(
          'bg-background fixed z-50 flex h-auto flex-col',
          direction === 'top' && 'inset-x-0 top-0 mb-24 max-h-[80vh] rounded-b-lg border-b',
          direction === 'bottom' && 'inset-x-0 bottom-0 mt-24 max-h-[80vh] rounded-t-lg border-t',
          direction === 'right' && 'inset-y-0 right-0 w-3/4 border-l sm:max-w-sm',
          direction === 'left' && 'inset-y-0 left-0 w-3/4 border-r sm:max-w-sm',
          props.class,
        )"
      >
        <div v-if="direction === 'bottom'" class="bg-muted mx-auto mt-4 h-2 w-[100px] shrink-0 rounded-full" />
        <slot />
      </div>
    </template>
  </Teleport>
</template>
