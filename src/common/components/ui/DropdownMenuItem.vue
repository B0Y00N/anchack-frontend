<script setup>
import { inject } from "vue";
import { cn } from "../../lib/utils";

const props = defineProps({
  class: { type: String, default: "" },
  inset: { type: Boolean, default: false },
  variant: { type: String, default: "default" }, // "default" | "destructive"
});
const menu = inject("dropdownMenu", null);

function onClick() {
  menu?.close();
}
</script>

<template>
  <div
    data-slot="dropdown-menu-item"
    :data-inset="inset"
    :data-variant="variant"
    @click="onClick"
    :class="cn(
      'hover:bg-accent hover:text-accent-foreground data-[variant=destructive]:text-destructive data-[variant=destructive]:hover:bg-destructive/10 relative flex cursor-default items-center gap-2 rounded-sm px-2 py-1.5 text-sm outline-hidden select-none data-[inset=true]:pl-8 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*=\'size-\'])]:size-4',
      props.class,
    )"
  >
    <slot />
  </div>
</template>
