<script setup>
defineProps({ label: { type: String, required: true }, selected: { type: Boolean, default: false } });
defineEmits(["click"]);
</script>
<template>
  <button
    @click="$emit('click')"
    :class="`px-5 py-2.5 rounded-xl text-sm font-semibold border transition-all ${selected ? 'bg-primary text-primary-foreground border-primary shadow-sm' : 'bg-muted text-foreground border-transparent hover:border-primary/30 hover:bg-secondary'}`"
  >
    {{ label }}
  </button>
</template>
