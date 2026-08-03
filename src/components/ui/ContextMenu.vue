<script setup>
import { ref, provide } from "vue";
import { useClickOutside } from "../../composables/useClickOutside";

const open = ref(false);
const pos = ref({ x: 0, y: 0 });
const rootEl = ref(null);

function onContextMenu(e) {
  e.preventDefault();
  pos.value = { x: e.clientX, y: e.clientY };
  open.value = true;
}

provide("contextMenu", { open, pos, close: () => (open.value = false) });
useClickOutside(rootEl, () => (open.value = false));
</script>

<template>
  <div data-slot="context-menu" ref="rootEl" @contextmenu="onContextMenu">
    <slot />
  </div>
</template>
