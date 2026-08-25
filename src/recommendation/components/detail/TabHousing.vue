<script setup>
import { Home } from "lucide-vue-next";
import MiniBarChart from "../../../common/components/MiniBarChart.vue";
import HouseTypeMetricList from "./HouseTypeMetricList.vue";

defineProps({ n: { type: Object, required: true } });
const emit = defineEmits(["listings"]);

const rentColors = ["#FF1493", "#4A90D9", "#52B37A", "#F0B87A", "#E56B6F"];
const rentColor = (_value, index) => rentColors[index] ?? "#A8D5A0";
</script>

<template>
  <div class="space-y-5">
    <div class="grid grid-cols-2 gap-4">
      <div class="bg-card border border-border rounded-2xl p-6"><p class="text-xs text-muted-foreground mb-2">월세 보증금 중위값</p><p class="text-3xl font-bold text-foreground">{{ n.deposit != null ? `${n.deposit.toLocaleString()}만원` : "정보 없음" }}</p></div>
      <div class="bg-card border border-border rounded-2xl p-6"><p class="text-xs text-muted-foreground mb-2">월세 중위값</p><p class="text-3xl font-bold text-foreground">{{ n.monthly != null ? `${n.monthly}만원` : "정보 없음" }}</p></div>
    </div>
    <div class="bg-card border border-border rounded-2xl p-6">
      <div class="flex items-center justify-between mb-5">
        <h4 class="font-semibold text-foreground">월세 분포</h4>
        <button @click="emit('listings')" class="flex items-center gap-1.5 text-xs font-semibold text-primary bg-secondary px-3 py-1.5 rounded-full"><Home :size="12" /> 매물 보러가기</button>
      </div>
      <MiniBarChart
        v-if="n.rentDist && n.rentDist.length > 0"
        :data="n.rentDist.map((r) => ({ label: r.label, value: r.count }))"
        :color-for="rentColor"
      />
      <p v-else class="text-sm text-muted-foreground">월세 분포 정보가 없어요.</p>
    </div>
    <div v-if="n.monthlyHouseTypes?.length" class="bg-card border border-border rounded-2xl p-6">
      <h4 class="font-semibold text-foreground mb-5">주거유형별 월세 거래 지표</h4>
      <HouseTypeMetricList :metrics="n.monthlyHouseTypes" />
    </div>
    <div class="bg-card border border-border rounded-2xl p-6">
      <p class="text-xs text-muted-foreground mb-2">전세금 중위값</p>
      <p class="text-3xl font-bold text-foreground">{{ n.jeonseDeposit != null ? `${n.jeonseDeposit.toLocaleString()}만원` : "정보 없음" }}</p>
    </div>
    <div class="bg-card border border-border rounded-2xl p-6">
      <h4 class="font-semibold text-foreground mb-5">전세금 분포</h4>
      <MiniBarChart
        v-if="n.jeonseDist && n.jeonseDist.length > 0"
        :data="n.jeonseDist.map((r) => ({ label: r.label, value: r.count }))"
        :color-for="rentColor"
      />
      <p v-else class="text-sm text-muted-foreground">전세금 분포 정보가 없어요.</p>
    </div>
    <div v-if="n.jeonseHouseTypes?.length" class="bg-card border border-border rounded-2xl p-6">
      <h4 class="font-semibold text-foreground mb-5">주거유형별 전세 거래 지표</h4>
      <HouseTypeMetricList :metrics="n.jeonseHouseTypes" is-jeonse />
    </div>
  </div>
</template>
