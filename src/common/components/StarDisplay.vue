<script setup>
import { Star } from "lucide-vue-next";
defineProps({ rating: { type: Number, required: true }, max: { type: Number, default: 5 }, size: { type: Number, default: 14 } });
</script>
<template>
  <div class="flex items-center gap-0.5">
    <Star
      v-for="i in max"
      :key="i"
      :size="size"
      :class="i - 1 < Math.floor(rating) ? 'text-amber-400 fill-amber-400' : 'text-muted-foreground/25'"
    />
  </div>
</template>
