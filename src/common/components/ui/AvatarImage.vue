<script setup>
import { ref } from "vue";
import { cn } from "../../lib/utils";

const props = defineProps({
  class: { type: String, default: "" },
  src: { type: String, default: "" },
  alt: { type: String, default: "" },
});
const failed = ref(false);
</script>

<template>
  <img
    v-if="!failed && src"
    data-slot="avatar-image"
    :src="src"
    :alt="alt"
    :class="cn('aspect-square size-full', props.class)"
    v-bind="$attrs"
    @error="failed = true"
  />
</template>
