<script setup>
import { ref } from "vue";
import { Star } from "lucide-vue-next";

const props = defineProps({ modelValue: { type: Number, required: true }, max: { type: Number, default: 5 }, size: { type: Number, default: 24 } });
const emit = defineEmits(["update:modelValue"]);
const hov = ref(0);
</script>

<template>
  <div class="flex items-center gap-1">
    <button
      v-for="i in max"
      :key="i"
      type="button"
      @mouseenter="hov = i"
      @mouseleave="hov = 0"
      @click="emit('update:modelValue', i)"
      class="p-0.5 transition-transform hover:scale-110"
    >
      <Star :size="size" :class="(hov || modelValue) >= i ? 'text-amber-400 fill-amber-400' : 'text-muted-foreground/25'" />
    </button>
  </div>
</template>
