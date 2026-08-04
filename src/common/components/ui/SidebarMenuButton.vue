<script setup>
import { inject } from "vue";
import { sidebarMenuButtonVariants } from "../../lib/variants/sidebar-menu-button";
import Tooltip from "./Tooltip.vue";
import TooltipTrigger from "./TooltipTrigger.vue";
import TooltipContent from "./TooltipContent.vue";
import { cn } from "../../lib/utils";

const props = defineProps({
  class: { type: String, default: "" },
  isActive: { type: Boolean, default: false },
  variant: { type: String, default: "default" },
  size: { type: String, default: "default" },
  as: { type: String, default: "button" },
  tooltip: { type: String, default: "" }, // 접혔을 때(collapsed) 보여줄 툴팁 텍스트
});
const sidebar = inject("sidebar", null);
</script>

<template>
  <Tooltip v-if="tooltip">
    <TooltipTrigger>
      <component
        :is="as"
        data-slot="sidebar-menu-button"
        data-sidebar="menu-button"
        :data-size="size"
        :data-active="isActive"
        :class="cn(sidebarMenuButtonVariants({ variant, size }), props.class)"
        v-bind="$attrs"
      >
        <slot />
      </component>
    </TooltipTrigger>
    <TooltipContent side="right" align="center" v-if="sidebar?.state.value === 'collapsed' && !sidebar?.isMobile.value">
      {{ tooltip }}
    </TooltipContent>
  </Tooltip>

  <component
    v-else
    :is="as"
    data-slot="sidebar-menu-button"
    data-sidebar="menu-button"
    :data-size="size"
    :data-active="isActive"
    :class="cn(sidebarMenuButtonVariants({ variant, size }), props.class)"
    v-bind="$attrs"
  >
    <slot />
  </component>
</template>
