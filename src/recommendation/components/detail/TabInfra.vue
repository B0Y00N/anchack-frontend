<script setup>
import { computed } from 'vue'
import { Dumbbell, Store, Hospital, Trees, Building2, Coffee, ShoppingBag } from 'lucide-vue-next'
import NeighborhoodMap from './NeighborhoodMap.vue'

const props = defineProps({
  n: { type: Object, required: true },
  hash: { type: Number, required: true },
})

const items = computed(() => [
  { label: '헬스장', count: props.n.gyms ?? 0, icon: Dumbbell, color: '#2D7A4F' },
  {
    label: '편의점',
    count: props.n.convenience ?? 0,
    icon: Store,
    color: '#52B37A',
  },
  {
    label: '병원/약국',
    count: (props.n.hospitals ?? 0) + (props.n.pharmacies ?? 0),
    icon: Hospital,
    color: '#6D9E5C',
  },
  { label: '공원', count: props.n.parks ?? 0, icon: Trees, color: '#8ECBA9' },
  { label: '은행', count: props.n.banks ?? 0, icon: Building2, color: '#7B68A6' },
  {
    label: '카페/음식점',
    count: (props.n.cafes ?? 0) + (props.n.restaurants ?? 0),
    icon: Coffee,
    color: '#C47C3A',
  },
  {
    label: '백화점',
    count: props.n.department ?? 0,
    icon: Building2,
    color: '#B03A8C',
  },
  {
    label: '대형마트',
    count: props.n.mart ?? 0,
    icon: ShoppingBag,
    color: '#D97706',
  },
])
</script>

<template>
  <div class="space-y-5">
    <div>
      <p class="mb-2 text-right text-[11px] text-muted-foreground">단위: 수</p>
      <div class="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <div
          v-for="item in items"
          :key="item.label"
          class="border rounded-2xl p-4 text-center bg-card border-border"
        >
        <component
          :is="item.icon"
          :size="26"
          :stroke-width="1.8"
          class="mx-auto mb-1.5"
          :style="{ color: item.color }"
        />
        <p class="text-xl font-bold text-foreground mb-0.5">{{ item.count }}</p>
        <p class="text-base text-muted-foreground">{{ item.label }}</p>
        </div>
      </div>
    </div>
    <NeighborhoodMap
      :district="n.guName"
      :dong="n.dongName"
      :admin-dong-id="n.id ?? n.adminDongId"
      :hash="hash"
      mode="infra"
      :boundary-stroke-weight="3"
      :boundary-fill-opacity="0.25"
    />
  </div>
</template>
