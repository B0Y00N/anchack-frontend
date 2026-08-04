<script setup>
import { computed } from "vue";
import { Check, Store, Dumbbell, Trees, Hospital, ShoppingBag } from "lucide-vue-next";
import { MUST_HAVE_META } from "../../common/utils/mockData";

const ICONS = { Store, Dumbbell, Trees, Hospital, ShoppingBag };
const props = defineProps({ label: { type: String, required: true }, selected: { type: Boolean, default: false } });
defineEmits(["click"]);
const icon = computed(() => ICONS[MUST_HAVE_META[props.label]?.icon] ?? Store);
</script>

<template>
  <button
    @click="$emit('click')"
    :class="`inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-medium border transition-all ${selected ? 'bg-primary text-primary-foreground border-primary shadow-sm' : 'bg-white text-foreground border-border hover:bg-secondary'}`"
  >
    <component :is="icon" :size="14" />
    <Check v-if="selected" :size="11" />
    {{ label }}
  </button>
</template>
