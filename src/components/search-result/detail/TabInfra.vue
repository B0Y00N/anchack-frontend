<script setup>
import { computed } from "vue";
import { Dumbbell, Store, Hospital, Trees, Building2, ShoppingBag } from "lucide-vue-next";
import NeighborhoodMap from "./NeighborhoodMap.vue";

const props = defineProps({
  n: { type: Object, required: true },
  hash: { type: Number, required: true },
});

const items = computed(() => [
  { label: "헬스장", count: props.n.gyms, icon: Dumbbell, good: props.n.gyms >= 4 },
  { label: "편의점", count: props.n.convenience, icon: Store, good: props.n.convenience >= 7 },
  { label: "병원/약국", count: props.n.hospitals, icon: Hospital, good: props.n.hospitals >= 3 },
  { label: "공원", count: props.n.parks, icon: Trees, good: props.n.parks >= 3 },
  { label: "백화점", count: props.hash % 2, icon: Building2, good: props.hash % 2 > 0 },
  { label: "대형마트", count: (props.hash + 1) % 2, icon: ShoppingBag, good: (props.hash + 1) % 2 > 0 },
]);
</script>

<template>
  <div class="space-y-5">
    <div class="grid grid-cols-3 gap-4">
      <div v-for="item in items" :key="item.label" :class="`border rounded-2xl p-4 text-center ${item.good ? 'bg-secondary border-primary/20' : 'bg-card border-border'}`">
        <component :is="item.icon" :size="26" :stroke-width="1.8" class="mx-auto text-primary mb-1.5" />
        <p :class="`text-xl font-bold mb-0.5 ${item.good ? 'text-primary' : 'text-foreground'}`">{{ item.count }}곳</p>
        <p class="text-xs text-muted-foreground">{{ item.label }}</p>
        <p v-if="item.good" class="text-xs text-primary font-semibold mt-1">✓ 충족</p>
      </div>
    </div>
    <NeighborhoodMap :dong="n.id" :hash="hash" mode="infra" />
  </div>
</template>
