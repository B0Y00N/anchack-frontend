<script setup>
import { computed } from "vue";
import { User, Train, Clock } from "lucide-vue-next";
import NeighborhoodMap from "./NeighborhoodMap.vue";

const props = defineProps({
  n: { type: Object, required: true },
  hash: { type: Number, required: true },
});

const segments = computed(() => [
  { label: "도보", icon: User, min: props.n.walkMin, color: "#8ECBA9" },
  { label: "지하철", icon: Train, min: props.n.subwayMin, color: props.n.lineColor },
  { label: "환승 대기", icon: Clock, min: props.n.transferMin, color: "#C5D5CE" },
]);
</script>

<template>
  <div class="space-y-5">
    <div class="grid grid-cols-3 gap-4">
      <div v-for="item in [
        { label: '예상 소요시간', value: `${n.commuteTime}분` },
        { label: '환승 횟수', value: `${n.transfers}회` },
        { label: '주요 노선', value: n.lineNum + '호선' },
      ]" :key="item.label" class="bg-card border border-border rounded-2xl p-5 text-center">
        <p class="text-3xl font-bold text-primary mb-1">{{ item.value }}</p>
        <p class="text-xs text-muted-foreground">{{ item.label }}</p>
      </div>
    </div>

    <div class="bg-card border border-border rounded-2xl p-6">
      <h4 class="font-semibold text-foreground mb-5">구간별 소요시간</h4>
      <div v-for="seg in segments" :key="seg.label" class="flex items-center gap-3 mb-4">
        <div class="w-8 h-8 rounded-full flex items-center justify-center" :style="{ background: seg.color + '33' }">
          <component :is="seg.icon" :size="15" :style="{ color: seg.color }" />
        </div>
        <div class="flex-1">
          <div class="text-xs text-muted-foreground mb-1">{{ seg.label }}</div>
          <div class="h-2 bg-muted rounded-full overflow-hidden">
            <div class="h-full rounded-full" :style="{ width: (seg.min / n.commuteTime) * 100 + '%', background: seg.color }" />
          </div>
        </div>
        <span class="text-xs font-semibold w-10 text-right">{{ seg.min }}분</span>
      </div>
      <div class="mt-4 pt-4 border-t border-border">
        <p class="text-xs text-muted-foreground">주요 이용 노선</p>
        <p class="text-sm font-semibold text-foreground mt-1">{{ n.route }}</p>
      </div>
    </div>

    <NeighborhoodMap :dong="n.id" :hash="hash" mode="transit" />
  </div>
</template>
