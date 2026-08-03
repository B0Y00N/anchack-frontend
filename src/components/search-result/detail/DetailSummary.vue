<script setup>
import { Check, AlertCircle } from "lucide-vue-next";
defineProps({ n: { type: Object, required: true } });
</script>

<template>
  <div class="grid grid-cols-2 gap-5 mb-8">
    <div class="bg-emerald-50 border border-emerald-200 rounded-2xl p-6">
      <div class="flex items-center gap-2 mb-4"><Check :size="15" class="text-emerald-700" /><h3 class="font-semibold text-emerald-700 text-sm">이 동네를 추천한 이유</h3></div>
      <ul class="space-y-2">
        <li v-for="(p, i) in n.pros" :key="i" class="text-sm text-foreground flex items-start gap-2"><span class="text-emerald-600 mt-0.5">•</span> {{ p }}</li>
      </ul>
    </div>
    <div class="bg-red-50 border border-red-200 rounded-2xl p-6">
      <div class="flex items-center gap-2 mb-4"><AlertCircle :size="15" class="text-red-500" /><h3 class="font-semibold text-red-700 text-sm">미리 알아둘 점</h3></div>
      <ul class="space-y-2">
        <li v-for="(c, i) in n.cons" :key="i" class="text-sm text-foreground flex items-start gap-2"><span class="text-red-500 mt-0.5">•</span> {{ c }}</li>
      </ul>
    </div>
  </div>
</template>
