<script setup>
defineProps({
  modelValue: { type: String, required: true },
  tabs: { type: Array, required: true }, // [{ key, label, count }]
});
defineEmits(["update:modelValue"]);
</script>

<template>
  <div class="max-w-4xl mx-auto px-8 flex">
    <button
      v-for="t in tabs"
      :key="t.key"
      @click="$emit('update:modelValue', t.key)"
      :class="`px-5 py-3.5 text-sm font-semibold border-b-2 transition-colors ${modelValue === t.key ? 'border-primary text-primary' : 'border-transparent text-muted-foreground hover:text-foreground'}`"
    >
      {{ t.label }}
      <span v-if="t.count !== undefined && t.count > 0" class="ml-1.5 text-xs bg-primary/10 text-primary px-1.5 py-0.5 rounded-full">{{ t.count }}</span>
    </button>
  </div>
</template>
