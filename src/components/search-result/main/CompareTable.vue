<script setup>
import { computed } from "vue";
import { ChevronLeft, ShoppingCart } from "lucide-vue-next";
import { NEIGHBORHOODS } from "../../../utils/mockData";
import TheFooter from "../../common/TheFooter.vue";

const props = defineProps({ compareList: { type: Array, required: true } });
const emit = defineEmits(["back"]);

const ns = computed(() => NEIGHBORHOODS.filter((n) => props.compareList.includes(n.id)));

const rows = [
  { label: "적합도", get: (n) => `${n.score}점`, compare: "higher", num: (n) => n.score },
  { label: "통근시간", get: (n) => `${n.commuteTime}분`, compare: "lower", num: (n) => n.commuteTime },
  { label: "월세 중위값", get: (n) => `${n.monthly}만원 · 약 20m²`, compare: "lower", num: (n) => n.monthly },
  { label: "보증금", get: (n) => `${n.deposit.toLocaleString()}만원`, compare: "lower", num: (n) => n.deposit },
  { label: "종합 안전 점수", get: (n) => `${n.safetyScore}점`, compare: "higher", num: (n) => n.safetyScore },
  { label: "주요 장점", get: (n) => n.pros[0] },
  { label: "아쉬운 점", get: (n) => n.cons[0] },
];

function isBest(row, n) {
  if (!row.compare || !row.num) return false;
  const vals = ns.value.map(row.num);
  const val = row.num(n);
  return row.compare === "higher" ? val === Math.max(...vals) : val === Math.min(...vals);
}
function cellTone(row, n) {
  if (row.label === "주요 장점") return "text-emerald-700 bg-emerald-50/70";
  if (row.label === "아쉬운 점") return "text-rose-700 bg-rose-50/70";
  return isBest(row, n) ? "bg-secondary text-primary font-bold" : "text-foreground";
}
</script>

<template>
  <div v-if="ns.length === 0" class="min-h-screen bg-background pt-[60px] flex items-center justify-center">
    <div class="text-center">
      <div class="w-20 h-20 bg-secondary rounded-3xl flex items-center justify-center mx-auto mb-6"><ShoppingCart :size="36" class="text-primary" /></div>
      <h2 class="text-xl font-bold text-foreground mb-2">비교 대상이 없습니다.</h2>
      <p class="text-sm text-muted-foreground mb-6">추천 결과에서 동네를 담아보세요.</p>
      <button @click="emit('back')" class="bg-primary text-primary-foreground font-semibold px-6 py-2.5 rounded-full text-sm hover:bg-primary/90">추천 결과 보기</button>
    </div>
  </div>

  <div v-else class="min-h-screen bg-background pt-[60px]">
    <div class="max-w-5xl mx-auto px-8 py-8">
      <button @click="emit('back')" class="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-primary mb-6 font-medium"><ChevronLeft :size="16" /> 추천 결과로 돌아가기</button>
      <h1 class="text-3xl font-bold text-foreground mb-4">동네 비교</h1>

      <div v-if="ns.length === 1" class="bg-secondary border border-primary/20 rounded-2xl px-5 py-4 mb-6 flex items-center gap-3">
        <ShoppingCart :size="16" class="text-primary flex-shrink-0" />
        <p class="text-sm text-foreground">비교 대상을 선택해주세요. 추천 결과에서 동네를 하나 더 담으면 비교할 수 있어요.</p>
      </div>

      <div class="bg-card border border-border rounded-2xl overflow-hidden shadow-sm">
        <table class="w-full table-fixed">
          <thead>
            <tr class="border-b border-border bg-muted/40">
              <th class="px-6 py-5 text-left text-sm font-semibold text-muted-foreground w-[200px]">비교 항목</th>
              <th v-for="n in ns" :key="n.id" class="px-6 py-5 text-center">
                <div class="font-bold text-foreground">{{ n.id }}</div>
                <div class="text-sm font-bold text-primary">적합도 {{ n.score }}점</div>
              </th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(row, ri) in rows" :key="row.label" :class="`border-b border-border/50 ${ri % 2 === 0 ? '' : 'bg-muted/20'}`">
              <td class="px-6 py-4 text-sm font-medium text-muted-foreground">{{ row.label }}</td>
              <td v-for="n in ns" :key="n.id" :class="`px-6 py-4 text-center text-sm ${cellTone(row, n)}`">{{ row.get(n) }}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
    <TheFooter />
  </div>
</template>
