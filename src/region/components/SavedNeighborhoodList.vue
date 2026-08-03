<script setup>
import { computed } from "vue";
import { NEIGHBORHOODS, DONG_DATA } from "../../common/utils/mockData";

const props = defineProps({
  savedNeighborhoods: { type: Array, required: true },
});
const emit = defineEmits(["navigate"]);

function findDongInfo(id) {
  const entry = Object.entries(DONG_DATA).find(([, d]) => d.dong.includes(id));
  if (!entry) return null;
  const [districtName, distData] = entry;
  const hash = id.split("").reduce((a, c) => a + c.charCodeAt(0), 0) % 20;
  const dongRent = Math.max(30, distData.avgRent + hash - 10);
  return { districtName, distData, dongRent };
}

const items = computed(() =>
  props.savedNeighborhoods.map((id) => {
    const recN = NEIGHBORHOODS.find((x) => x.id === id);
    if (recN) return { id, type: "recommend", data: recN };
    const dongInfo = findDongInfo(id);
    if (dongInfo) return { id, type: "dong", data: dongInfo };
    return null;
  }).filter(Boolean),
);
</script>

<template>
  <div>
    <h2 class="text-lg font-bold text-foreground mb-5">관심 동네</h2>

    <div v-if="savedNeighborhoods.length === 0" class="text-center py-20 bg-card border border-border rounded-2xl">
      <div class="text-4xl mb-4">🏙️</div>
      <p class="font-semibold text-foreground mb-1">저장한 동네가 없어요</p>
      <p class="text-sm text-muted-foreground mb-6">동네 상세 페이지에서 관심 동네를 저장해보세요.</p>
      <button @click="emit('navigate', 'results')" class="bg-primary text-primary-foreground font-semibold px-6 py-2.5 rounded-full text-sm hover:bg-primary/90">동네 찾으러 가기</button>
    </div>

    <div v-else class="grid grid-cols-2 gap-4">
      <template v-for="item in items" :key="item.id">
        <div v-if="item.type === 'recommend'" class="bg-card border border-border rounded-2xl p-5 hover:border-primary/30 transition-colors">
          <div class="flex items-start justify-between mb-3">
            <div>
              <h3 class="font-bold text-foreground">{{ item.data.id }}</h3>
              <p class="text-xs text-primary font-semibold mt-0.5">적합도 {{ item.data.score }}점</p>
            </div>
            <span class="text-xs bg-secondary text-primary px-2 py-1 rounded-full font-medium">월세 {{ item.data.monthly }}만원</span>
          </div>
          <div class="flex flex-wrap gap-1.5 mb-4">
            <span v-for="t in item.data.tags" :key="t" class="text-xs bg-muted text-muted-foreground px-2 py-0.5 rounded-full">{{ t }}</span>
          </div>
          <button @click="emit('navigate', 'detail')" class="w-full text-xs font-semibold text-primary border border-primary/25 py-2 rounded-xl hover:bg-secondary">상세 보기</button>
        </div>

        <div v-else class="bg-card border border-border rounded-2xl p-5 hover:border-primary/30 transition-colors">
          <div class="flex items-start justify-between mb-1">
            <div>
              <h3 class="font-bold text-foreground">{{ item.id }}</h3>
              <p class="text-xs text-muted-foreground mt-0.5">{{ item.data.districtName }}</p>
            </div>
            <span class="text-xs bg-secondary text-primary px-2 py-1 rounded-full font-medium">평균 {{ item.data.dongRent }}만원</span>
          </div>
          <div class="grid grid-cols-3 gap-2 mb-4 mt-3">
            <div
              v-for="s in [
                { label: '안전', val: item.data.distData.safetyScore },
                { label: '교통', val: item.data.distData.transitScore },
                { label: '인프라', val: item.data.distData.infraScore },
              ]"
              :key="s.label"
              class="bg-muted rounded-lg p-2 text-center"
            >
              <p class="text-xs font-bold text-primary">{{ s.val }}</p>
              <p class="text-[10px] text-muted-foreground">{{ s.label }}</p>
            </div>
          </div>
          <button @click="emit('navigate', 'explore')" class="w-full text-xs font-semibold text-primary border border-primary/25 py-2 rounded-xl hover:bg-secondary">둘러보기</button>
        </div>
      </template>
    </div>
  </div>
</template>
