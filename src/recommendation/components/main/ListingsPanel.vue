<script setup>
import { ref, computed } from "vue";
import { ChevronLeft, Filter, ExternalLink } from "lucide-vue-next";
import { MOCK_LISTINGS, MOCK_TRANSACTIONS } from "../../../common/utils/mockData";
import TheFooter from "../../../common/components/TheFooter.vue";

defineProps({ neighborhoodId: { type: String, required: true } });
const emit = defineEmits(["back"]);

const activeTab = ref("listings"); // "listings" | "transactions"
const rentFilter = ref("전체"); // "전체" | "월세" | "전세"
const typeFilter = ref("전체");

const filtered = computed(() => MOCK_LISTINGS.filter((l) => typeFilter.value === "전체" || l.type === typeFilter.value));
const transFiltered = computed(() => MOCK_TRANSACTIONS.filter((t) => rentFilter.value === "전체" || t.type === rentFilter.value));
</script>

<template>
  <div class="min-h-screen bg-background pt-[60px]">
    <div class="border-b border-border bg-white">
      <div class="max-w-6xl mx-auto px-8 py-5">
        <button @click="emit('back')" class="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-primary mb-4 font-medium"><ChevronLeft :size="16" /> 동네 상세로 돌아가기</button>
        <h1 class="text-2xl font-bold text-foreground">{{ neighborhoodId }} 매물</h1>
      </div>
      <div class="max-w-6xl mx-auto px-8 flex">
        <button @click="activeTab = 'listings'" :class="`px-6 py-3.5 text-sm font-semibold border-b-2 ${activeTab === 'listings' ? 'border-primary text-primary' : 'border-transparent text-muted-foreground'}`">
          매물 목록 <span class="ml-1.5 text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full">{{ filtered.length }}</span>
        </button>
        <button @click="activeTab = 'transactions'" :class="`px-6 py-3.5 text-sm font-semibold border-b-2 ${activeTab === 'transactions' ? 'border-primary text-primary' : 'border-transparent text-muted-foreground'}`">실거래 현황</button>
      </div>
    </div>

    <div class="max-w-6xl mx-auto px-8 py-8">
      <template v-if="activeTab === 'listings'">
        <div class="flex items-center gap-4 mb-6">
          <div class="flex bg-muted rounded-xl p-1">
            <button v-for="f in ['전체', '월세', '전세']" :key="f" @click="rentFilter = f" :class="`px-4 py-2 rounded-lg text-sm font-semibold ${rentFilter === f ? 'bg-white shadow-sm' : 'text-muted-foreground'}`">{{ f }}</button>
          </div>
          <div class="flex gap-2">
            <button
              v-for="t in ['전체', '오피스텔', '빌라', '아파트']"
              :key="t"
              @click="typeFilter = t"
              :class="`px-3 py-1.5 rounded-full text-xs font-semibold border ${typeFilter === t ? 'bg-primary text-white border-primary' : 'bg-white border-border hover:bg-secondary'}`"
            >
              {{ t }}
            </button>
          </div>
          <button class="flex items-center gap-1.5 text-sm text-muted-foreground border border-border rounded-full px-4 py-2 hover:bg-muted ml-auto"><Filter :size="14" /> 상세 필터</button>
        </div>
        <div class="grid grid-cols-3 gap-5">
          <div v-for="listing in filtered" :key="listing.id" class="bg-card border border-border rounded-2xl overflow-hidden hover:border-primary/30 hover:shadow-md transition-all">
            <div class="h-44 relative flex items-center justify-center" :style="{ background: listing.bg }">
              <div class="text-4xl opacity-40">🏢</div>
              <span v-if="listing.badge" class="absolute top-3 left-3 bg-primary text-white text-xs font-bold px-2 py-1 rounded-lg">{{ listing.badge }}</span>
              <span class="absolute top-3 right-3 bg-white/90 text-foreground text-xs font-semibold px-2 py-1 rounded-lg">{{ listing.type }}</span>
            </div>
            <div class="p-5">
              <p class="text-xs text-muted-foreground mb-1">{{ listing.addr }} {{ listing.floor }}층</p>
              <h3 class="font-bold text-foreground mb-1">{{ listing.building }}</h3>
              <p class="text-xs text-muted-foreground mb-3">{{ listing.area }}m²</p>
              <p class="text-base font-bold text-primary">보증금 {{ listing.deposit.toLocaleString() }}만원</p>
              <p class="text-sm font-semibold text-foreground mb-3">월세 {{ listing.monthly }}만원</p>
              <div class="flex flex-wrap gap-1.5 mb-4">
                <span v-for="f in listing.features" :key="f" class="bg-muted text-muted-foreground text-xs px-2 py-0.5 rounded-full">{{ f }}</span>
              </div>
              <div class="flex items-center justify-between">
                <span :class="`text-xs font-semibold px-2 py-1 rounded-full ${listing.available === '즉시 입주' ? 'bg-secondary text-primary' : 'bg-amber-50 text-amber-700'}`">{{ listing.available }}</span>
                <button class="flex items-center gap-1 text-xs font-semibold text-primary">상세 보기 <ExternalLink :size="11" /></button>
              </div>
            </div>
          </div>
        </div>
      </template>

      <template v-else>
        <div class="flex items-center gap-4 mb-6">
          <div class="flex bg-muted rounded-xl p-1">
            <button v-for="f in ['전체', '월세', '전세']" :key="f" @click="rentFilter = f" :class="`px-4 py-2 rounded-lg text-sm font-semibold ${rentFilter === f ? 'bg-white shadow-sm' : 'text-muted-foreground'}`">{{ f }}</button>
          </div>
        </div>
        <div class="grid grid-cols-3 gap-4 mb-8">
          <div v-for="item in [{ label: '월세 중위값', value: '64만원' }, { label: '전세 중위값', value: '1억 8천만원' }, { label: '거래 건수', value: `${transFiltered.length}건` }]" :key="item.label" class="bg-card border border-border rounded-2xl p-5">
            <p class="text-xs text-muted-foreground mb-2">{{ item.label }}</p>
            <p class="text-2xl font-bold text-foreground">{{ item.value }}</p>
          </div>
        </div>
        <div class="bg-card border border-border rounded-2xl overflow-hidden">
          <table class="w-full">
            <thead>
              <tr class="border-b border-border bg-muted/40">
                <th v-for="col in ['거래일', '주소', '유형', '전용면적', '층', '보증금', '월세/전세금']" :key="col" class="px-5 py-4 text-left text-xs font-bold text-muted-foreground">{{ col }}</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(t, i) in transFiltered" :key="i" :class="`border-b border-border/50 hover:bg-secondary/30 ${i % 2 === 0 ? '' : 'bg-muted/15'}`">
                <td class="px-5 py-4 text-sm text-muted-foreground">{{ t.date }}</td>
                <td class="px-5 py-4 text-sm">{{ t.addr }}</td>
                <td class="px-5 py-4"><span :class="`text-xs font-semibold px-2.5 py-1 rounded-full ${t.type === '월세' ? 'bg-secondary text-primary' : 'bg-blue-50 text-blue-700'}`">{{ t.type }}</span></td>
                <td class="px-5 py-4 text-sm">{{ t.area }}m²</td>
                <td class="px-5 py-4 text-sm">{{ t.floor }}층</td>
                <td class="px-5 py-4 text-sm">{{ t.deposit.toLocaleString() }}만원</td>
                <td class="px-5 py-4 text-sm font-semibold">{{ t.type === "월세" ? `${t.monthly}만원/월` : `${t.deposit.toLocaleString()}만원` }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </template>
    </div>
    <TheFooter />
  </div>
</template>
