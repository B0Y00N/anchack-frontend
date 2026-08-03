<script setup>
import { onMounted, onUnmounted } from "vue";

const props = defineProps({ message: { type: String, required: true } });
const emit = defineEmits(["done"]);

let timer;
onMounted(() => { timer = setTimeout(() => emit("done"), 2500); });
onUnmounted(() => clearTimeout(timer));
</script>

<template>
  <div class="fixed bottom-8 left-1/2 -translate-x-1/2 z-[200] bg-foreground text-white text-sm font-semibold px-5 py-3 rounded-full shadow-xl pointer-events-none">
    {{ message }}
  </div>
</template>
