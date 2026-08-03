<script setup>
import { cn } from "../../lib/utils";
defineProps({ class: { type: String, default: "" } });
</script>
<template>
  <td
    data-slot="table-cell"
    :class="cn('p-2 align-middle whitespace-nowrap [&:has([role=checkbox])]:pr-0 [&>[role=checkbox]]:translate-y-[2px]', $props.class)"
    v-bind="$attrs"
  ><slot /></td>
</template>
