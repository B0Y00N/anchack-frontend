<script setup>
import { cn } from "../../lib/utils";
defineProps({ class: { type: String, default: "" } });
</script>
<template>
  <div data-slot="table-container" class="relative w-full overflow-x-auto">
    <table data-slot="table" :class="cn('w-full caption-bottom text-sm', $props.class)" v-bind="$attrs">
      <slot />
    </table>
  </div>
</template>
