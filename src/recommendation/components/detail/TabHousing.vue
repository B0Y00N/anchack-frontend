<script setup>
import { Home } from "lucide-vue-next";
import MiniBarChart from "../../../common/components/MiniBarChart.vue";

defineProps({ n: { type: Object, required: true } });
const emit = defineEmits(["listings"]);
</script>

<template>
  <div class="space-y-5">
    <div class="grid grid-cols-2 gap-4">
      <div class="bg-card border border-border rounded-2xl p-6"><p class="text-xs text-muted-foreground mb-2">보증금 중위값 (전체 유형)</p><p class="text-3xl font-bold text-foreground">{{ n.deposit != null ? `${n.deposit.toLocaleString()}만원` : "정보 없음" }}</p></div>
      <div class="bg-card border border-border rounded-2xl p-6"><p class="text-xs text-muted-foreground mb-2">월세 중위값 (전체 유형)</p><p class="text-3xl font-bold text-foreground">{{ n.monthly != null ? `${n.monthly}만원` : "정보 없음" }}</p></div>
    </div>
    <div class="bg-card border border-border rounded-2xl p-6">
      <div class="flex items-center justify-between mb-5">
        <h4 class="font-semibold text-foreground">월세 분포</h4>
        <button @click="emit('listings')" class="flex items-center gap-1.5 text-xs font-semibold text-primary bg-secondary px-3 py-1.5 rounded-full"><Home :size="12" /> 매물 보러가기</button>
      </div>
      <MiniBarChart
        v-if="n.rentDist && n.rentDist.length > 0"
        :data="n.rentDist.map((r) => ({ label: r.label, value: r.count }))"
      />
      <p v-else class="text-sm text-muted-foreground">월세 분포 정보가 없어요.</p>
    </div>
  </div>
</template>
