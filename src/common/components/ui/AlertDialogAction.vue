<script setup>
import { inject } from "vue";
import { buttonVariants } from "../../lib/variants/button";
import { cn } from "../../lib/utils";

const props = defineProps({ class: { type: String, default: "" } });
const dialog = inject("alertDialog", null);
</script>
<template>
  <button :class="cn(buttonVariants(), props.class)" @click="dialog?.setOpen(false)"><slot /></button>
</template>
