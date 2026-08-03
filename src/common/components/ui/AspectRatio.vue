<script setup>
defineProps({
  ratio: { type: Number, default: 1 },
});
</script>

<template>
  <div data-slot="aspect-ratio" :style="{ position: 'relative', width: '100%', paddingBottom: `${100 / ratio}%` }">
    <div style="position: absolute; inset: 0;">
      <slot />
    </div>
  </div>
</template>
