<script setup>
import { computed } from "vue";
const props = defineProps({ name: { type: String, required: true }, size: { type: Number, default: 80 } });
const initials = computed(() => props.name.slice(0, 1));
</script>
<template>
  <div class="rounded-full bg-primary/15 flex items-center justify-center font-bold text-primary flex-shrink-0" :style="{ width: size + 'px', height: size + 'px', fontSize: size * 0.38 + 'px' }">
    {{ initials }}
  </div>
</template>
