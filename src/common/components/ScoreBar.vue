<script setup>
defineProps({
  label: { type: String, required: true },
  value: { type: Number, required: true },
  unit: { type: String, default: "" },
  color: { type: String, default: "" },
});
</script>

<template>
  <div class="flex items-center gap-3">
    <span class="text-xs text-muted-foreground w-24 flex-shrink-0">{{ label }}</span>
    <div class="flex-1 h-2 bg-muted rounded-full overflow-hidden">
      <div class="h-full rounded-full" :style="{ width: Math.min(value, 100) + '%', background: color || 'linear-gradient(90deg,#2D7A4F,#6DC98A)' }" />
    </div>
    <span class="text-xs font-semibold text-foreground w-14 text-right">{{ value }}{{ unit }}</span>
  </div>
</template>
