<script setup>
defineProps({
  title: { type: String, required: true },
  lines: { type: Array, required: true },
  isOpen: { type: Boolean, default: false },
});
const emit = defineEmits(["toggle"]);
</script>

<template>
  <div :class="`bg-card border rounded-2xl overflow-hidden ${isOpen ? 'border-primary/30' : 'border-border'}`">
    <div class="p-6 flex justify-between items-start">
      <div>
        <h3 class="font-semibold text-foreground mb-3">{{ title }}</h3>
        <template v-if="!isOpen">
          <p v-for="line in lines" :key="line" class="text-sm text-foreground/75">{{ line }}</p>
        </template>
      </div>
      <button @click="emit('toggle')" class="text-sm font-semibold text-primary">{{ isOpen ? "닫기" : "수정" }}</button>
    </div>
    <div v-if="isOpen" class="border-t border-border bg-secondary/30 px-6 py-5">
      <slot />
    </div>
  </div>
</template>
