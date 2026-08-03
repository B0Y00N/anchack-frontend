<script setup>
import { computed } from "vue";
import { Bus, ShieldCheck, Dumbbell, Coffee, Store, Hospital, Landmark, Trees, Home } from "lucide-vue-next";
import { PRIORITY_META } from "../../utils/mockData";

const ICONS = { Bus, ShieldCheck, Dumbbell, Coffee, Store, Hospital, Landmark, Trees, Home };
const props = defineProps({
  label: { type: String, required: true },
  index: { type: Number, required: true }, // 선택 순서 (-1이면 미선택)
  disabled: { type: Boolean, default: false },
  showTooltip: { type: Boolean, default: true },
});
defineEmits(["click"]);

const meta = computed(() => PRIORITY_META[props.label]);
const icon = computed(() => ICONS[meta.value?.icon] ?? Bus);
</script>

<template>
  <div class="relative group">
    <button
      @click="$emit('click')"
      :disabled="disabled"
      :class="`inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-medium border ${index >= 0 ? 'bg-primary text-primary-foreground border-primary' : disabled ? 'bg-muted text-muted-foreground border-transparent opacity-50' : 'bg-white text-foreground border-border hover:bg-secondary'}`"
    >
      <component :is="icon" :size="15" />
      <span v-if="index >= 0" class="bg-white/25 text-xs w-4 h-4 rounded-full flex items-center justify-center">{{ index + 1 }}</span>
      {{ label }}
    </button>
    <span
      v-if="showTooltip"
      class="pointer-events-none absolute left-1/2 top-full z-20 mt-2 w-52 -translate-x-1/2 rounded-lg bg-foreground px-3 py-2 text-center text-xs text-white opacity-0 shadow-lg transition-opacity group-hover:opacity-100"
    >
      {{ meta.tip }}
    </span>
  </div>
</template>
