<script setup>
import { inject } from "vue";
import { cn } from "../../lib/utils";

const props = defineProps({ class: { type: String, default: "" } });
const menu = inject("contextMenu", null);
</script>

<template>
  <Teleport to="body">
    <div
      v-if="menu?.open.value"
      data-slot="context-menu-content"
      :style="{ position: 'fixed', left: menu.pos.value.x + 'px', top: menu.pos.value.y + 'px' }"
      :class="cn(
        'bg-popover text-popover-foreground z-50 min-w-[8rem] overflow-hidden rounded-md border p-1 shadow-md',
        props.class,
      )"
    >
      <slot />
    </div>
  </Teleport>
</template>
