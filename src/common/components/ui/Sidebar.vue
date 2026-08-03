<script setup>
import { inject } from "vue";
import Sheet from "./Sheet.vue";
import SheetContent from "./SheetContent.vue";
import SheetHeader from "./SheetHeader.vue";
import SheetTitle from "./SheetTitle.vue";
import SheetDescription from "./SheetDescription.vue";
import { cn } from "../../lib/utils";

const props = defineProps({
  class: { type: String, default: "" },
  side: { type: String, default: "left" }, // "left" | "right"
  variant: { type: String, default: "sidebar" }, // "sidebar" | "floating" | "inset"
  collapsible: { type: String, default: "offcanvas" }, // "offcanvas" | "icon" | "none"
});

const sidebar = inject("sidebar", null);
</script>

<template>
  <div v-if="collapsible === 'none'" data-slot="sidebar" :class="cn('bg-sidebar text-sidebar-foreground flex h-full w-(--sidebar-width) flex-col', props.class)">
    <slot />
  </div>

  <Sheet v-else-if="sidebar?.isMobile.value" :model-value="sidebar.openMobile.value" @update:model-value="sidebar.setOpenMobile">
    <SheetContent
      data-sidebar="sidebar"
      data-slot="sidebar"
      data-mobile="true"
      class="bg-sidebar text-sidebar-foreground w-(--sidebar-width) p-0 [&>button]:hidden"
      :style="{ '--sidebar-width': '18rem' }"
      :side="side"
    >
      <SheetHeader class="sr-only">
        <SheetTitle>Sidebar</SheetTitle>
        <SheetDescription>Displays the mobile sidebar.</SheetDescription>
      </SheetHeader>
      <div class="flex h-full w-full flex-col">
        <slot />
      </div>
    </SheetContent>
  </Sheet>

  <div v-else class="group peer text-sidebar-foreground hidden md:block" :data-state="sidebar?.state.value" :data-collapsible="sidebar?.state.value === 'collapsed' ? collapsible : ''" :data-variant="variant" :data-side="side" data-slot="sidebar">
    <div
      data-slot="sidebar-gap"
      :class="cn(
        'relative w-(--sidebar-width) bg-transparent transition-[width] duration-200 ease-linear',
        'group-data-[collapsible=offcanvas]:w-0',
        'group-data-[side=right]:rotate-180',
        (variant === 'floating' || variant === 'inset') ? 'group-data-[collapsible=icon]:w-[calc(var(--sidebar-width-icon)+1rem)]' : 'group-data-[collapsible=icon]:w-(--sidebar-width-icon)',
      )"
    />
    <div
      data-slot="sidebar-container"
      :class="cn(
        'fixed inset-y-0 z-10 hidden h-svh w-(--sidebar-width) transition-[left,right,width] duration-200 ease-linear md:flex',
        side === 'left' ? 'left-0 group-data-[collapsible=offcanvas]:left-[calc(var(--sidebar-width)*-1)]' : 'right-0 group-data-[collapsible=offcanvas]:right-[calc(var(--sidebar-width)*-1)]',
        (variant === 'floating' || variant === 'inset') ? 'p-2 group-data-[collapsible=icon]:w-[calc(var(--sidebar-width-icon)+1rem+2px)]' : 'group-data-[collapsible=icon]:w-(--sidebar-width-icon) group-data-[side=left]:border-r group-data-[side=right]:border-l',
        props.class,
      )"
    >
      <div data-sidebar="sidebar" data-slot="sidebar-inner" class="bg-sidebar group-data-[variant=floating]:border-sidebar-border flex h-full w-full flex-col group-data-[variant=floating]:rounded-lg group-data-[variant=floating]:border group-data-[variant=floating]:shadow-sm">
        <slot />
      </div>
    </div>
  </div>
</template>
